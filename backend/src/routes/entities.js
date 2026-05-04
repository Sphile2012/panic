/**
 * CRUD routes for all entities.
 * Security model:
 *  - Every record has an owner_email field
 *  - Non-admin users can ONLY read/write their OWN records
 *  - Admins can read all records via /list
 *  - owner_email is ALWAYS set from the JWT — never trusted from the request body
 */
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const TABLE_MAP = {
  SafetyProfile:    'safety_profiles',
  EmergencyContact: 'emergency_contacts',
  Alert:            'alerts',
  SafeZone:         'safe_zones',
  SharedDevice:     'shared_devices',
};

function getTable(entity) {
  return TABLE_MAP[entity] || null;
}

// ── LIST — admin only ─────────────────────────────────────────────────────────
router.get('/:entity/list', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

  const sort = req.query.sort || '-created_date';
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json(db.getAll(table, sort, limit));
});

// ── FILTER — users see only their own data ────────────────────────────────────
router.post('/:entity/filter', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });

  const { filters = {}, sort = 'created_date', limit = 50 } = req.body;

  // SECURITY: force owner_email to the authenticated user's email for non-admins
  const safeFilters = { ...filters };
  if (req.user.role !== 'admin') {
    safeFilters.owner_email = req.user.email;
  }

  const safeLimit = Math.min(Number(limit) || 50, 200);
  res.json(db.filter(table, safeFilters, sort, safeLimit));
});

// ── GET ONE ───────────────────────────────────────────────────────────────────
router.get('/:entity/:id', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });

  const row = db.getById(table, req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  // SECURITY: only owner or admin can read
  if (req.user.role !== 'admin' && row.owner_email && row.owner_email !== req.user.email) {
    return res.status(403).json({ error: 'Access denied' });
  }
  res.json(row);
});

// ── CREATE ────────────────────────────────────────────────────────────────────
router.post('/:entity', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });

  const data = { ...req.body };

  // SECURITY: always set owner_email from JWT, never from request body
  data.owner_email = req.user.email;
  data.id = uuidv4();

  const record = db.insert(table, data);
  res.status(201).json(record);
});

// ── UPDATE ────────────────────────────────────────────────────────────────────
router.patch('/:entity/:id', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });

  const existing = db.getById(table, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  // SECURITY: only owner or admin can update
  if (req.user.role !== 'admin' && existing.owner_email && existing.owner_email !== req.user.email) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = { ...req.body };
  // SECURITY: prevent ownership transfer
  delete updates.id;
  delete updates.owner_email;

  res.json(db.update(table, req.params.id, updates));
});

// ── DELETE ────────────────────────────────────────────────────────────────────
router.delete('/:entity/:id', authMiddleware, (req, res) => {
  const table = getTable(req.params.entity);
  if (!table) return res.status(404).json({ error: 'Unknown entity' });

  const existing = db.getById(table, req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  // SECURITY: only owner or admin can delete
  if (req.user.role !== 'admin' && existing.owner_email && existing.owner_email !== req.user.email) {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.delete(table, req.params.id);
  res.json({ success: true });
});

module.exports = router;

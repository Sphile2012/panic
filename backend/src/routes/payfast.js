/**
 * PayFast payment integration
 * Docs: https://developers.payfast.co.za/docs
 *
 * Flow:
 *  1. Frontend calls POST /api/payfast/initiate  → gets signed form data
 *  2. Frontend submits form to PayFast (sandbox or live)
 *  3. PayFast POSTs ITN to POST /api/payfast/notify
 *  4. We verify + update subscription_plan in DB
 */
const express = require('express');
const crypto = require('crypto');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Config ────────────────────────────────────────────────────────────────────
const SANDBOX = process.env.PAYFAST_SANDBOX !== 'false'; // default: sandbox mode
const PAYFAST_URL = SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

const MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID  || '10000100'; // sandbox default
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a'; // sandbox default
const PASSPHRASE   = process.env.PAYFAST_PASSPHRASE   || 'jt7NOE43FZPn';  // sandbox default

// Plan prices in ZAR
const PLAN_PRICES = {
  basic:    { monthly: 50,  annual: 480  },
  standard: { monthly: 100, annual: 960  },
  premium:  { monthly: 150, annual: 1440 },
};

// ── Signature helper ──────────────────────────────────────────────────────────
function generateSignature(data, passphrase = null) {
  // PayFast requires standard URL encoding (spaces as +, not %20)
  const encode = (v) => encodeURIComponent(String(v).trim()).replace(/%20/g, '+');

  let str = Object.entries(data)
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `${k}=${encode(v)}`)
    .join('&');

  if (passphrase) {
    str += `&passphrase=${encode(passphrase)}`;
  }

  return crypto.createHash('md5').update(str).digest('hex');
}

// ── POST /api/payfast/initiate ────────────────────────────────────────────────
router.post('/initiate', authMiddleware, (req, res) => {
  try {
    const { plan_id, billing } = req.body;
    const user = req.user;

    if (!PLAN_PRICES[plan_id]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const isAnnual = billing === 'annual';
    const amount = isAnnual
      ? PLAN_PRICES[plan_id].annual
      : PLAN_PRICES[plan_id].monthly;

    const billingLabel = isAnnual ? 'Annual' : 'Monthly';
    const planLabel = plan_id.charAt(0).toUpperCase() + plan_id.slice(1);

    const returnUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`;
    const cancelUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`;
    const notifyUrl  = `${process.env.BACKEND_URL  || 'http://localhost:3001'}/api/payfast/notify`;

    // Build payment data — ORDER MATTERS for signature
    const data = {
      merchant_id:   MERCHANT_ID,
      merchant_key:  MERCHANT_KEY,
      return_url:    returnUrl,
      cancel_url:    cancelUrl,
      notify_url:    notifyUrl,
      name_first:    (user.full_name || '').split(' ')[0] || 'User',
      name_last:     (user.full_name || '').split(' ').slice(1).join(' ') || '',
      email_address: user.email,
      m_payment_id:  `${user.id}_${plan_id}_${Date.now()}`,
      amount:        amount.toFixed(2),
      item_name:     `Panic Ring ${planLabel} Plan - ${billingLabel}`,
      item_description: `Panic Ring personal safety subscription - ${planLabel} ${billingLabel}`,
      custom_str1:   user.email,
      custom_str2:   plan_id,
      custom_str3:   billing || 'monthly',
    };

    // Generate signature
    data.signature = generateSignature(data, PASSPHRASE);

    res.json({
      payfast_url: PAYFAST_URL,
      data,
      sandbox: SANDBOX,
    });
  } catch (err) {
    console.error('PayFast initiate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/payfast/notify (ITN) ────────────────────────────────────────────
// PayFast POSTs here after payment — must respond 200 OK
router.post('/notify', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const pfData = req.body;

    // 1. Verify signature
    const received = pfData.signature;
    const dataForSig = { ...pfData };
    delete dataForSig.signature;

    const expected = generateSignature(dataForSig, PASSPHRASE);
    if (received !== expected) {
      console.warn('PayFast ITN: invalid signature');
      return res.status(400).send('Invalid signature');
    }

    // 2. Verify payment status
    if (pfData.payment_status !== 'COMPLETE') {
      console.log(`PayFast ITN: payment not complete (${pfData.payment_status})`);
      return res.status(200).send('OK');
    }

    // 3. Extract user info from custom fields
    const ownerEmail = pfData.custom_str1;
    const planId     = pfData.custom_str2;
    const billing    = pfData.custom_str3 || 'monthly';

    if (!ownerEmail || !planId) {
      console.warn('PayFast ITN: missing custom fields');
      return res.status(200).send('OK');
    }

    // 4. Update subscription in DB
    const profiles = db.filter('safety_profiles', { owner_email: ownerEmail }, 'created_date', 1);
    if (profiles[0]) {
      db.update('safety_profiles', profiles[0].id, {
        subscription_plan: planId,
        subscription_billing: billing,
        subscription_updated_at: new Date().toISOString(),
      });
      console.log(`✅ PayFast: upgraded ${ownerEmail} to ${planId} (${billing})`);
    } else {
      // Create profile if doesn't exist
      const { v4: uuidv4 } = require('uuid');
      db.insert('safety_profiles', {
        id: uuidv4(),
        owner_email: ownerEmail,
        subscription_plan: planId,
        subscription_billing: billing,
        subscription_updated_at: new Date().toISOString(),
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      });
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('PayFast ITN error:', err);
    res.status(200).send('OK'); // Always 200 to PayFast
  }
});

// ── GET /api/payfast/plans ────────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({ plans: PLAN_PRICES, sandbox: SANDBOX });
});

module.exports = router;

// Panic Ring Service Worker — Offline Mode + Background Sync
const CACHE_NAME = 'panic-ring-v2';
const SYNC_TAG = 'panic-alert-sync';

// App shell files to cache for offline use
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── Install: cache app shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first for API, cache-first for assets ─────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests (HTML), serve from cache or network
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // For static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache successful GET responses for static assets
        if (response.ok && event.request.method === 'GET' &&
            (url.pathname.match(/\.(js|css|png|ico|woff2?)$/))) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsToFlush());
  }
});

async function notifyClientsToFlush() {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clients.forEach(client => client.postMessage({ type: 'FLUSH_QUEUE' }));
}

// ── Message Handler ───────────────────────────────────────────────────────────
self.addEventListener('message', async (event) => {
  const { type, payload } = event.data || {};
  const port = event.ports?.[0];
  const respond = (data) => port?.postMessage(data);
  const cache = await caches.open(CACHE_NAME);

  switch (type) {
    case 'CACHE_CONTACTS':
      await cache.put('/offline/contacts', jsonResponse(payload));
      respond({ ok: true, count: payload?.length });
      break;

    case 'CACHE_LOCATION':
      await cache.put('/offline/location', jsonResponse(payload));
      respond({ ok: true });
      break;

    case 'GET_CONTACTS': {
      const r = await cache.match('/offline/contacts');
      respond({ data: r ? await r.json() : null });
      break;
    }

    case 'GET_LOCATION': {
      const r = await cache.match('/offline/location');
      respond({ data: r ? await r.json() : null });
      break;
    }

    case 'QUEUE_ALERT': {
      const existing = await cache.match('/offline/queue');
      const queue = existing ? await existing.json() : [];
      queue.push({ ...payload, queued_at: Date.now(), id: crypto.randomUUID() });
      await cache.put('/offline/queue', jsonResponse(queue));
      try { await self.registration.sync.register(SYNC_TAG); } catch {}
      respond({ ok: true, count: queue.length });
      break;
    }

    case 'GET_QUEUE': {
      const r = await cache.match('/offline/queue');
      respond({ data: r ? await r.json() : [] });
      break;
    }

    case 'CLEAR_QUEUE':
      await cache.put('/offline/queue', jsonResponse([]));
      respond({ ok: true });
      break;

    case 'REMOVE_QUEUED_ALERT': {
      const existing = await cache.match('/offline/queue');
      const queue = existing ? await existing.json() : [];
      const updated = queue.filter(item => item.id !== payload?.id);
      await cache.put('/offline/queue', jsonResponse(updated));
      respond({ ok: true, remaining: updated.length });
      break;
    }
  }
});

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

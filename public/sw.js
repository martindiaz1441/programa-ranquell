// public/sw.js  —  SW autodestruct (mata cualquier SW viejo)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const regs = await self.registration.unregister();
    } catch(e) {}
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.navigate(client.url));
  })());
});

// sw.js — Versão CORRIGIDA para iPhone/GitHub Pages
const CACHE_NAME = "reembolso-sf-v8";
const FILES_TO_CACHE = [
  "./",                    // ✅ Caminho relativo
  "./index.html",          // ✅ Caminho relativo
  "./manifest.json",       // ✅ Caminho relativo
  "./icon-192x192.png",    // ✅ Caminho relativo
  "./icon-512x512.png",    // ✅ Caminho relativo
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://i.imgur.com/dvzRyus.png"
];

// 📦 Instalação
self.addEventListener("install", event => {
  console.log("📦 Instalando Service Worker...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .catch(err => console.log("❌ Erro no cache:", err))
  );
  self.skipWaiting();
});

// 🔄 Ativação
self.addEventListener("activate", event => {
  console.log("🔄 Ativando nova versão...");
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 🌐 Intercepta requisições
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(response => {
          // Só cachear se for uma resposta válida e do mesmo origin
          if (response && response.status === 200 && response.url.startsWith(self.location.origin)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => cached || caches.match("./index.html")); // ✅ Fallback correto

      // Para páginas HTML, priorizar network
      if (event.request.destination === "document" || 
          event.request.headers.get('accept').includes('text/html')) {
        return fetchPromise;
      }

      return cached || fetchPromise;
    })
  );
});

// 🔔 Atualização manual
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

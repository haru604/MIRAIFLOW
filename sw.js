const CACHE='miraiflow-v3.6.3-beta';
const SHELL=['./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(req.mode==='navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/MIRAIFLOW/')){
    event.respondWith((async()=>{
      try{return await fetch(req,{cache:'no-store'});}catch(e){return (await caches.match('./index.html'))||Response.error();}
    })());
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(req);
    const network=fetch(req).then(async res=>{if(res&&res.ok){const c=await caches.open(CACHE);await c.put(req,res.clone());}return res;}).catch(()=>null);
    return cached || await network || Response.error();
  })());
});

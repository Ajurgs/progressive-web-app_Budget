const { response } = require("express");

const FILES_TO_CACHE = [
    "/",
    "/index.js",
    "/db.js",
    "/manifest.webmanifest",
    "/icons/icon-192X192.png",
    "/icons/icon-512X512.png",
]

const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

self.addEventListener("install",function(e){
    e.waitUntil(
        caches.keys().then((keyList) =>{
            console.log(keyList);
            return Promise.all(
                keyList.map((key)=>{
                    if(key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim()
})


self.addEventListener("fetch",function(e){
    if(e.request.url.includes("/api/")){
        e.respondWith(
            caches.open(DATA_CACHE_NAME).then((cache) =>{
                return(
                    fetch(e.request).then((response) =>{
                        if(response.status === 200){
                            cache.put(e.request.url,response.clone());
                        }
                        return response;
                    })
                    .catch((err) =>{
                        return cache.match(e.request);
                    })
                );
            })
            .catch((err)=> console.log(err))
        );
        return;
    }
    e.respondWith(
        caches.match(e.request).then(function(response){
            return response || fetch(e.request);
        })
    );
});
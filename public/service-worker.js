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
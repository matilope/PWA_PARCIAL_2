if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js')
        .then(() => console.log('El Service Worker se encuentra funcionando'))
        .catch(err => console.log(err));
} else {
    console.log("No hay soporte para el Service Worker");
}
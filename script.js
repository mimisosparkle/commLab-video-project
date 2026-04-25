document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.images-container');
    const anchors = [...document.querySelectorAll('.images-container a')];
    const canvasCache = new Map();

    function getCanvas(img) {
        if (canvasCache.has(img)) return canvasCache.get(img);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        canvasCache.set(img, canvas);
        return canvas;
    }

    function isOpaqueAt(img, clientX, clientY) {
        const rect = img.getBoundingClientRect();
        const x = Math.round((clientX - rect.left) * img.naturalWidth / rect.width);
        const y = Math.round((clientY - rect.top) * img.naturalHeight / rect.height);
        if (x < 0 || y < 0 || x >= img.naturalWidth || y >= img.naturalHeight) return false;
        try {
            return getCanvas(img).getContext('2d').getImageData(x, y, 1, 1).data[3] > 10;
        } catch {
            return true;
        }
    }

    function getHitAnchor(clientX, clientY) {
        for (const anchor of anchors) {
            const img = anchor.querySelector('img');
            if (isOpaqueAt(img, clientX, clientY)) return anchor;
        }
        return null;
    }

    anchors.forEach(a => a.addEventListener('click', e => e.preventDefault()));

    container.addEventListener('click', e => {
        const anchor = getHitAnchor(e.clientX, e.clientY);
        if (anchor) window.location.href = anchor.href;
    });

    container.addEventListener('mousemove', e => {
        const hit = getHitAnchor(e.clientX, e.clientY);
        anchors.forEach(a => {
            a.querySelector('img').style.filter = a === hit ? 'brightness(1.2)' : '';
        });
        container.style.cursor = hit ? 'pointer' : '';
    });

    container.addEventListener('mouseleave', () => {
        anchors.forEach(a => a.querySelector('img').style.filter = '');
        container.style.cursor = '';
    });
});

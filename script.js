document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.images-container');
    if (!container) return;

    const anchors = [...document.querySelectorAll('.images-container a')];
    const popupImgs = [...document.querySelectorAll('.images-container [data-popup]')];
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
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

    function getHitPopup(clientX, clientY) {
        for (const img of popupImgs) {
            if (isOpaqueAt(img, clientX, clientY)) return img;
        }
        return null;
    }

    function openModal(src, alt) {
        modalImg.src = src;
        modalImg.alt = alt;
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        modalImg.src = '';
    }

    document.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    anchors.forEach(a => a.addEventListener('click', e => e.preventDefault()));

    container.addEventListener('click', e => {
        const anchor = getHitAnchor(e.clientX, e.clientY);
        if (anchor) { window.location.href = anchor.href; return; }

        const popup = getHitPopup(e.clientX, e.clientY);
        if (popup) openModal(popup.dataset.popupSrc || popup.src, popup.alt);
    });

    container.addEventListener('mousemove', e => {
        const hitAnchor = getHitAnchor(e.clientX, e.clientY);
        anchors.forEach(a => {
            a.querySelector('img').style.filter = a === hitAnchor ? 'brightness(1.2)' : '';
        });

        const hitPopup = hitAnchor ? null : getHitPopup(e.clientX, e.clientY);
        popupImgs.forEach(img => {
            img.style.filter = img === hitPopup ? 'brightness(1.2)' : '';
        });

        container.style.cursor = (hitAnchor || hitPopup) ? 'pointer' : '';
    });

    container.addEventListener('mouseleave', () => {
        anchors.forEach(a => a.querySelector('img').style.filter = '');
        popupImgs.forEach(img => img.style.filter = '');
        container.style.cursor = '';
    });
});

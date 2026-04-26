document.addEventListener('DOMContentLoaded', () => {

    // --- Intro overlay ---
    const overlay = document.getElementById('intro-overlay');
    if (overlay && new URLSearchParams(window.location.search).has('skip')) {
        overlay.remove();
    } else if (overlay) {
        const introScreen  = document.getElementById('intro-screen');
        const videoScreen  = document.getElementById('video-screen');
        const crimeVideo   = document.getElementById('crime-video');
        const afterMsg     = document.getElementById('after-video-msg');
        const watchBtn     = document.getElementById('watch-btn');
        const solveBtn     = document.getElementById('solve-btn');

        watchBtn.addEventListener('click', () => {
            introScreen.classList.add('fade-out');

            setTimeout(() => {
                introScreen.style.display = 'none';
                videoScreen.style.display = 'flex';
                videoScreen.classList.add('crt-on');

                setTimeout(() => {
                    videoScreen.classList.add('visible');
                    crimeVideo.play();
                }, 100);
            }, 600);
        });

        crimeVideo.addEventListener('ended', () => {
            afterMsg.classList.add('visible');
        });

        solveBtn.addEventListener('click', () => {
            overlay.classList.add('dismissed');
            setTimeout(() => overlay.remove(), 1200);
        });
    }

    // --- Solve case ---
    const solveCaseBtn  = document.getElementById('solve-case-btn');
    const solveModal    = document.getElementById('solve-modal');
    const solveQuestion = document.getElementById('solve-question');
    const solveResult   = document.getElementById('solve-result');
    const resultLabel   = document.getElementById('result-label');
    const resultTitle   = document.getElementById('result-title');
    const resultBody    = document.getElementById('result-body');
    const resultClose   = document.getElementById('result-close');

    if (solveCaseBtn) {
        solveCaseBtn.addEventListener('click', () => {
            solveModal.classList.add('active');
            solveCaseBtn.classList.add('hidden');
        });

        solveModal.addEventListener('click', e => {
            if (e.target === solveModal) resetSolveModal();
        });

       let firstAttempt = true;

const newEvidence = document.getElementById('new-evidence');
const rethinkBtn = document.getElementById('rethink-btn');

document.querySelectorAll('.suspect-choice').forEach(btn => {
    btn.addEventListener('click', () => {

        if (btn.id === 'rethink-btn') return;

        const suspect = btn.dataset.suspect;

        // reset ALL states first
        solveQuestion.classList.add('hidden');
        solveResult.classList.add('hidden');
        newEvidence.classList.add('hidden');

        if (firstAttempt) {
            firstAttempt = false;

            // ONLY show evidence
            // SECOND ATTEMPT → show result

// 🚨 hide EVERYTHING first
solveQuestion.classList.add('hidden');
newEvidence.classList.add('hidden');

// THEN show result
solveResult.classList.remove('hidden');
        if (suspect === 'scarlet') {
            resultLabel.style.color = '#6a9e6a';
            resultLabel.textContent = 'Case Closed';
            resultTitle.textContent = 'You got it.';
            resultBody.textContent = 'Scarlet claimed she saw the thief\'s face reflected in the painting\'s glass, but the Insurance Appraisal confirms it was covered by Moth-Eye Nano-Structured Glass, engineered to produce zero reflection. She described a physical impossibility. Scarlet stole the Vermeer.';
        } else {
            resultLabel.style.color = '#9e6a6a';
            resultLabel.textContent = 'Wrong Suspect';
            resultTitle.textContent = 'Not quite.';
            resultBody.textContent = 'The evidence does not point there. Look closer at the case files. One suspect described something that could not have happened.';
        }

    });
});
        
rethinkBtn.addEventListener('click', () => {

    newEvidence.classList.add('hidden');
    solveQuestion.classList.remove('hidden');

});

        resultClose.addEventListener('click', resetSolveModal);

       function resetSolveModal() {
    solveModal.classList.remove('active');
    solveCaseBtn.classList.remove('hidden');

    setTimeout(() => {
        firstAttempt = true;

        solveQuestion.classList.remove('hidden');
        solveResult.classList.add('hidden');
        newEvidence.classList.add('hidden');

    }, 300);
}
    }

    // --- Evidence board ---
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
        if (solveCaseBtn) solveCaseBtn.classList.add('hidden');
    }

    function closeModal() {
        modal.classList.remove('active');
        modalImg.src = '';
        if (solveCaseBtn) solveCaseBtn.classList.remove('hidden');
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

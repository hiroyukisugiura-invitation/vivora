document.addEventListener('DOMContentLoaded', () => {
    // --- 状態管理オブジェクト ---
    const appState = {
        activeGender: 'woman', activeTool: 'select', activeColor: '#000000', isDrawing: false, gridVisible: false,
    };

    // --- DOM要素の取得 ---
    const genderSelector = document.querySelector('.gender-selector');
    const mannequinImg = document.getElementById('mannequin');
    const poseSelector = document.getElementById('pose-selector');
    const stationeryPanel = document.getElementById('stationery-panel');
    const colorPanel = document.getElementById('color-panel');
    const gridToggleButton = document.getElementById('grid-toggle');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const poseThumbnailsContainer = document.querySelector('.pose-thumbnails');
    const saveButton = document.getElementById('save-button');

    // --- マネキン画像のパスを管理 ---
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

    // --- Panzoomのセットアップ ---
    let panzoomInstance = null;
    function setupPanzoom() {
        if (panzoomInstance) panzoomInstance.destroy();
        panzoomInstance = Panzoom(mannequinImg, { maxScale: 5, minScale: 0.5, contain: 'outside', canvas: true });
        canvasWrapper.addEventListener('wheel', (e) => { if (panzoomInstance) panzoomInstance.zoomWithWheel(e); });
        setTimeout(() => { if (panzoomInstance) panzoomInstance.reset({ animate: false }); }, 50);
    }
    
    // --- 描画用Canvasのセットアップ ---
    const drawingCanvas = document.createElement('canvas');
    const ctx = drawingCanvas.getContext('2d');
    function resizeDrawingCanvas() {
        drawingCanvas.width = canvasWrapper.clientWidth;
        drawingCanvas.height = canvasWrapper.clientHeight;
    }
    resizeDrawingCanvas();
    drawingCanvas.style.position = 'absolute';
    drawingCanvas.style.top = '0';
    drawingCanvas.style.left = '0';
    drawingCanvas.style.pointerEvents = 'auto';
    canvasWrapper.appendChild(drawingCanvas);
    window.addEventListener('resize', resizeDrawingCanvas);

    // ===== イベントリスナーの設定 =====

    // 1. 性別切り替え
    genderSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.gender-button');
        if (!target) return;
        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        const newSrc = mannequinSources[target.dataset.gender];
        if (newSrc && mannequinImg.src !== newSrc) {
            mannequinImg.src = newSrc;
            mannequinImg.onload = () => {
                setupPanzoom();
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    });

    // 2. ポーズ切り替え
    poseSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.pose-thumb');
        if (!target) return;
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        target.classList.add('selected');
        const poseSrc = target.dataset.poseSrc;
        if (poseSrc) {
            mannequinImg.src = poseSrc;
            mannequinImg.onload = () => {
                setupPanzoom();
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    });

    // 3. 保存ボタンの処理
    saveButton?.addEventListener('click', () => {
        const imageDataUrl = drawingCanvas.toDataURL('image/png');
        const newThumb = document.createElement('img');
        newThumb.classList.add('pose-thumb');
        newThumb.src = imageDataUrl;
        newThumb.alt = 'Saved Design';
        poseThumbnailsContainer.appendChild(newThumb);
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        newThumb.classList.add('selected');
    });

    // (ツール選択や描画処理のロジックもここに含まれます)

    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
});

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

    // ★★★★★ ChatGPTが解決した、安定動作するPanzoomのロジック ★★★★★
    
    // Panzoomのインスタンス（記憶そのもの）を保持するための変数を準備
    let panzoomInstance = null;

    /**
     * Panzoomをセットアップ（または再セットアップ）する決定版の関数
     */
    function setupPanzoom() {
        // 1. 古いPanzoomの記憶が残っていたら、完全に破壊して消去
        if (panzoomInstance) {
            panzoomInstance.destroy();
        }

        // 2. まっさらな状態で、現在のマネキンに新しくPanzoomをかけ直す
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5, minScale: 0.5, contain: 'outside', canvas: true,
        });

        // 3. 新しいPanzoomに、ホイール/ピンチ操作を改めて教え込む
        canvasWrapper.addEventListener('wheel', (e) => {
            if (panzoomInstance) panzoomInstance.zoomWithWheel(e);
        });

        // 4. 最後に、表示を中央にリセット
        setTimeout(() => {
            if (panzoomInstance) panzoomInstance.reset({ animate: false });
        }, 50); // わずかな遅延が確実な動作の鍵
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
            // 画像が読み込めたら、Panzoomをゼロから作り直す
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
            // こちらも同様に、Panzoomをゼロから作り直す
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

    // (ツール選択や描画処理のロジックは、元のコードから復元・統合)
    
    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
});

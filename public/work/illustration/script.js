document.addEventListener('DOMContentLoaded', () => {

    // --- 状態管理オブジェクト ---
    const appState = {
        activeGender: 'woman',
        activeTool: 'select',
        activeColor: '#000000',
        isDrawing: false,
        gridVisible: false,
    };

    // --- DOM要素の取得 ---
    const genderSelector = document.querySelector('.gender-selector');
    const mannequinImg = document.getElementById('mannequin');
    const poseSelector = document.getElementById('pose-selector');
    const stationeryPanel = document.getElementById('stationery-panel');
    const colorPanel = document.getElementById('color-panel');
    const gridToggleButton = document.getElementById('grid-toggle');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    // --- マネキン画像のパスを管理 ---
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

    let panzoomInstance = null;

    function initializePanzoom() {
        if (panzoomInstance) {
            panzoomInstance.destroy();
        }
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5,
            minScale: 0.5,
            contain: 'outside',
            canvas: true,
        });
        canvasWrapper.addEventListener('wheel', panzoomInstance.zoomWithWheel);
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
    drawingCanvas.style.pointerEvents = 'none';
    canvasWrapper.appendChild(drawingCanvas);
    
    window.addEventListener('resize', resizeDrawingCanvas);

    // ===== イベントリスナーの設定 =====

    // 1. 性別切り替え
    genderSelector.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.gender-button');
        if (!targetButton) return;

        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');

        const selectedGender = targetButton.dataset.gender;
        appState.activeGender = selectedGender;
        
        const newSrc = mannequinSources[selectedGender];
        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) { 
            mannequinImg.src = newSrc;
            mannequinImg.onload = initializePanzoom;
        }
    });

    // 2. ポーズ切り替え
    poseSelector.addEventListener('click', (e) => {
        const targetPose = e.target.closest('.pose-thumb');
        if(!targetPose) return;
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        targetPose.classList.add('selected');
        const poseSrc = targetPose.dataset.poseSrc;
        if(poseSrc) {
            mannequinImg.src = poseSrc;
            mannequinImg.onload = initializePanzoom;
        }
    });
  
    // ★★★ 修正箇所 ★★★
    // 最初のマネキン画像が読み込み完了してからPanzoomを初期化する
    if (mannequinImg.complete) {
        // 画像が既に読み込み済みの場合（キャッシュなど）
        initializePanzoom();
    } else {
        // 画像がまだ読み込み中の場合
        mannequinImg.addEventListener('load', initializePanzoom);
    }
    
    // (これ以降のツール選択などのコードは変更ありません)
    stationeryPanel.addEventListener('click', (e) => {
        // ... (省略)
    });
});

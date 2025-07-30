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
    // 【重要】現在のファイル構成に合わせた正しいパス
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

    // --- Pan & Zoom機能の有効化 ---
    const panzoom = Panzoom(mannequinImg, {
        maxScale: 5,
        minScale: 0.5,
        contain: 'outside',
        canvas: true,
    });
    canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);

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
        // 新しいパスが存在し、かつ現在の表示と違う場合のみ画像を更新
        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) { 
            mannequinImg.src = newSrc;
            mannequinImg.onload = () => {
                panzoom.reset(); // 画像が読み込めたら表示をリセット
            };
            mannequinImg.onerror = () => {
                console.error('画像の読み込みに失敗。パスを確認してください:', newSrc);
            };
        }
    });

    // 他のイベントリスナーは変更なしのため省略...

});

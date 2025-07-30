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
    // 【重要】もし実際のファイル名が違う場合は、ここのパスを修正してください。
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',      // 例: 'mannequin_male.png' など
        kids: '../../mannequin/mannequin_kids.png'     // 例: 'mannequin_child.png' など
    };

    // --- Pan & Zoom機能の有効化 ---
    // ★★★ 修正点 ★★★
    // Panzoomライブラリが正しく読み込まれていれば、この行でエラーは出なくなります
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
        if (newSrc && mannequinImg.src !== newSrc) { // 新しいパスがあり、現在のパスと違う場合のみ実行
            mannequinImg.src = newSrc;
            // 画像が読み込まれたらPanzoomをリセット
            mannequinImg.onload = () => {
                panzoom.reset();
            };
            mannequinImg.onerror = () => {
                console.error('画像の読み込みに失敗しました。パスを確認してください:', newSrc);
            };
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
            mannequinImg.onload = () => panzoom.reset();
        }
    });
  
    // 3. ツール選択
    stationeryPanel.addEventListener('click', (e) => {
        const targetTool = e.target.closest('.tool-button');
        if (!targetTool) return;
        stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
        targetTool.classList.add('selected');
        appState.activeTool = targetTool.dataset.tool;

        const isDrawingTool = ['pen', 'brush', 'eraser'].includes(appState.activeTool);
        canvasWrapper.classList.toggle('drawing-mode', isDrawingTool);
        drawingCanvas.style.pointerEvents = isDrawingTool ? 'auto' : 'none';
    });

    // 他のイベントリスナーは省略（変更なし）...
});

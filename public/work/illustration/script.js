// ===== アプリケーション初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded. script.js is running.');

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

    // --- マネキン画像のパスを管理するオブジェクト ---
    // 【重要】もし実際のファイル名が違う場合は、ここのパスを修正してください。
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

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

    // --- Pan & Zoom機能の有効化 ---
    const panzoom = Panzoom(mannequinImg, {
        maxScale: 5,
        minScale: 0.5,
        contain: 'outside',
        canvas: true,
    });
    canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);

    // ===== イベントリスナーの設定 =====

    // 1. 性別切り替え（デバッグ機能強化版）
    genderSelector.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.gender-button');
        if (!targetButton) return;

        console.log('Gender button clicked!'); // デバッグログ

        // ボタンの見た目を更新
        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');

        const selectedGender = targetButton.dataset.gender;
        appState.activeGender = selectedGender;
        console.log('Selected Gender:', selectedGender); // デバッグログ

        // 選択された性別の画像パスを取得
        const newSrc = mannequinSources[selectedGender];
        
        if (newSrc) {
            console.log('Attempting to load image:', newSrc); // デバッグログ
            mannequinImg.src = newSrc;
            
            // 画像の読み込みが完了したらPanzoomをリセット
            mannequinImg.onload = () => {
                console.log('Image loaded successfully. Resetting panzoom.'); // デバッグログ
                panzoom.reset();
            };
            // 画像の読み込みでエラーが起きた場合
            mannequinImg.onerror = () => {
                console.error('Error loading image. Check the path:', newSrc); // エラーログ
            };

        } else {
            console.error('No image source defined in mannequinSources for:', selectedGender); // エラーログ
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
        console.log(`Pose changed to: ${targetPose.alt}`);
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
        
        console.log(`Tool selected: ${appState.activeTool}`);
    });

    // 4. カラー選択
    colorPanel.addEventListener('click', (e) => {
        const targetColorBox = e.target.closest('.color-box');
        if (!targetColorBox || targetColorBox.classList.contains('add-color-button')) return;
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        targetColorBox.classList.add('selected');
        if (targetColorBox.dataset.color) {
            appState.activeColor = targetColorBox.dataset.color;
        }
        console.log(`Color selected: ${appState.activeColor}`);
    });
  
    // 5. グリッドON/OFF
    gridToggleButton.addEventListener('click', () => {
        appState.gridVisible = !appState.gridVisible;
        canvasWrapper.classList.toggle('grid-active', appState.gridVisible);
    });

    // ===== Pan & Zoom 対応の描画処理 =====
    function getTransformedPoint(x, y) {
        const { scale, x: panX, y: panY } = panzoom.getPanzoom();
        const rect = drawingCanvas.getBoundingClientRect();
        return {
            x: (x - rect.left - panX) / scale,
            y: (y - rect.top - panY) / scale,
        };
    }
  
    function startDrawing(e) {
        const isDrawingTool = ['pen', 'brush', 'eraser'].includes(appState.activeTool);
        if (!isDrawingTool) return;
        appState.isDrawing = true;

        const { scale, x, y } = panzoom.getPanzoom();
        ctx.setTransform(scale, 0, 0, scale, x, y);
    
        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }

    function draw(e) {
        if (!appState.isDrawing) return;
        e.preventDefault();

        if (appState.activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = appState.activeColor;
            ctx.lineWidth = (appState.activeTool === 'pen') ? 2 : 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    
        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
  
    function stopDrawing() {
        if (appState.isDrawing) {
            ctx.closePath();
            appState.isDrawing = false;
        }
    }

    canvasWrapper.addEventListener('mousedown', startDrawing);
    canvasWrapper.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mouseleave', stopDrawing);
});

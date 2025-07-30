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

    // ★★★ 中央揃えを確実にするためのヘルパー関数 ★★★
    function resetView() {
        // 少しだけ待ってからリセットを実行することで、描画のズレを防ぐ
        setTimeout(() => {
            panzoom.reset({ animate: false });
        }, 100); // 100ミリ秒（0.1秒）待つ
    }

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
            // 画像が読み込まれたら、新しいヘルパー関数を呼び出す
            mannequinImg.onload = resetView;
            mannequinImg.onerror = () => {
                console.error('画像の読み込みに失敗。パスを確認してください:', newSrc);
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
            // こちらも同様に、新しいヘルパー関数を呼び出す
            mannequinImg.onload = resetView;
        }
    });
  
    // （これ以降のコードに変更はありません）
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

    // 4. カラー選択
    colorPanel.addEventListener('click', (e) => {
        const targetColorBox = e.target.closest('.color-box');
        if (!targetColorBox || targetColorBox.classList.contains('add-color-button')) return;
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        targetColorBox.classList.add('selected');
        if (targetColorBox.dataset.color) {
            appState.activeColor = targetColorBox.dataset.color;
        }
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

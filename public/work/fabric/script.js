/* ==========================================================================
   Vivora Fashion Illustration - Final Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
     A) 状態管理オブジェクト
     -------------------------------------------------------------------------- */
    const appState = {
        activeGender: 'woman', activeTool: 'select', activeColor: 'rgb(0, 0, 0)', isDrawing: false,
    };

    /* --------------------------------------------------------------------------
     B) DOM要素の取得
     -------------------------------------------------------------------------- */
    const genderSelector = document.querySelector('.gender-selector');
    const mannequinImg = document.getElementById('mannequin');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const drawingCanvas = document.createElement('canvas');
    const ctx = drawingCanvas.getContext('2d');
    const gridToggleButton = document.getElementById('grid-toggle');
    const poseSelector = document.getElementById('pose-selector');
    const stationeryPanel = document.getElementById('stationery-panel');
    const colorPanel = document.getElementById('color-panel');

    /* --------------------------------------------------------------------------
     C) データ管理
     -------------------------------------------------------------------------- */
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png',
    };

    /* --------------------------------------------------------------------------
     D) 初期化処理
     -------------------------------------------------------------------------- */
    
    // --- 1. 描画用キャンバスのセットアップ ---
    function setupDrawingCanvas() {
        drawingCanvas.width = canvasWrapper.clientWidth;
        drawingCanvas.height = canvasWrapper.clientHeight;
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.pointerEvents = 'none'; // ★重要：最初は常に無効
        canvasWrapper.appendChild(drawingCanvas);
    }

    // --- 2. Panzoom機能のセットアップ ---
    let panzoomInstance = null;
    function setupPanzoom() {
        if (panzoomInstance) panzoomInstance.destroy();
        
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5, minScale: 0.5, contain: 'outside', canvas: true,
        });

        canvasWrapper.addEventListener('wheel', (e) => {
            if (panzoomInstance) panzoomInstance.zoomWithWheel(e);
        });

        // 確実な中央表示のための「おまじない」
        setTimeout(() => {
            if (panzoomInstance) panzoomInstance.reset({ animate: false });
        }, 50);
    }
    
    // --- 3. アプリケーションの起動 ---
    setupDrawingCanvas();
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
    window.addEventListener('resize', setupDrawingCanvas);


    /* --------------------------------------------------------------------------
     E) イベントリスナー：ユーザーの操作に対する応答
     -------------------------------------------------------------------------- */

    // --- Woman/Man/Kids ボタン ---
    genderSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.gender-button');
        if (!target) return;

        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        
        const newSrc = mannequinSources[target.dataset.gender];
        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) {
            mannequinImg.src = newSrc;
            mannequinImg.onload = () => {
                setupPanzoom();
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    });
    
    // --- ポーズのサムネイル ---
    poseSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.pose-thumb');
        if (!target) return;
        
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        target.classList.add('selected');

        const poseSrc = target.dataset.poseSrc;
        if (poseSrc && mannequinImg.getAttribute('src') !== poseSrc) {
            mannequinImg.src = poseSrc;
            mannequinImg.onload = () => {
                setupPanzoom();
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    });

    // --- Stationeryのツールボタン ---
    stationeryPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.tool-button');
        if (!target) return;

        stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        appState.activeTool = target.dataset.tool;
        
        // ★★★ ここが交通整理の核心 ★★★
        const isDrawingTool = ['pen', 'brush', 'eraser'].includes(appState.activeTool);

        // Panzoomのドラッグ移動を有効/無効に切り替える
        panzoomInstance.setOptions({ disablePan: isDrawingTool });
        
        // 描画キャンバスの操作を有効/無効に切り替える
        drawingCanvas.style.pointerEvents = isDrawingTool ? 'auto' : 'none';
        
        // 全体のカーソル形状を切り替える
        canvasWrapper.style.cursor = isDrawingTool ? 'crosshair' : 'grab';
    });

    // --- カラーパネル ---
    colorPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.color-box:not(.add-color-button, .eyedropper-button)');
        if (!target) return;
        
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        target.classList.add('selected');
        
        appState.activeColor = target.style.backgroundColor;
    });

    // --- グリッドボタン ---
    gridToggleButton.addEventListener('click', () => {
        canvasWrapper.classList.toggle('grid-active');
    });

    // --- 描画処理：マウスが押された時 ---
    drawingCanvas.addEventListener('mousedown', (e) => {
        appState.isDrawing = true;
        const point = getTransformedPoint(e.clientX, e.clientY);
        
        const { scale, x, y } = panzoomInstance.getPanzoom();
        ctx.setTransform(scale, 0, 0, scale, x, y);

        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    });

    // --- 描画処理：マウスが動いた時 ---
    drawingCanvas.addEventListener('mousemove', (e) => {
        if (!appState.isDrawing) return;
        
        const point = getTransformedPoint(e.clientX, e.clientY);

        if (appState.activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15;
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = appState.activeColor;
            ctx.lineWidth = appState.activeTool === 'pen' ? 2 : 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    });

    // --- 描画処理：マウスが離れた時 ---
    function stopDrawing() {
        appState.isDrawing = false;
        ctx.closePath();
    }
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mouseleave', stopDrawing);

    // --- ヘルパー関数 ---
    function getTransformedPoint(x, y) {
        const { scale, x: panX, y: panY } = panzoomInstance.getPanzoom();
        const rect = drawingCanvas.getBoundingClientRect();
        return { x: (x - rect.left - panX) / scale, y: (y - rect.top - panY) / scale };
    }
});

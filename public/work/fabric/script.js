document.addEventListener('DOMContentLoaded', () => {

    const appState = {
        activeTool: 'select',
        activeColor: 'rgb(0, 0, 0)',
        isDrawing: false,
    };

    const mannequinImg = document.getElementById('mannequin');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const drawingCanvas = document.createElement('canvas');
    const ctx = drawingCanvas.getContext('2d');
    const stationeryPanel = document.getElementById('stationery-panel');
    const colorPanel = document.getElementById('color-panel');
    
    // --- 初期化処理 ---
    
    function setupDrawingCanvas() {
        drawingCanvas.width = canvasWrapper.clientWidth;
        drawingCanvas.height = canvasWrapper.clientHeight;
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.pointerEvents = 'none';
        canvasWrapper.appendChild(drawingCanvas);
    }
    
    const panzoomInstance = Panzoom(mannequinImg, {
        maxScale: 5,
        minScale: 0.5,
    });
    canvasWrapper.addEventListener('wheel', panzoomInstance.zoomWithWheel);

    setupDrawingCanvas();
    window.addEventListener('resize', setupDrawingCanvas);

    // --- イベントリスナー ---

    stationeryPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.tool-button');
        if (!target) return;
        stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        appState.activeTool = target.dataset.tool;
        
        const isDrawingTool = ['pen', 'brush', 'eraser'].includes(appState.activeTool);
        panzoomInstance.setOptions({ disablePan: isDrawingTool });
        drawingCanvas.style.pointerEvents = isDrawingTool ? 'auto' : 'none';
        canvasWrapper.style.cursor = isDrawingTool ? 'crosshair' : 'grab';
    });

    colorPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.color-box:not(.add-color-button, .eyedropper-button)');
        if (!target) return;
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        target.classList.add('selected');
        appState.activeColor = target.style.backgroundColor;
    });

    // --- 描画処理 ---
    function getTransformedPoint(x, y) {
        const { scale, x: panX, y: panY } = panzoomInstance.getPanzoom();
        const rect = drawingCanvas.getBoundingClientRect();
        return { x: (x - rect.left - panX) / scale, y: (y - rect.top - panY) / scale };
    }

    drawingCanvas.addEventListener('mousedown', (e) => {
        appState.isDrawing = true;
        const point = getTransformedPoint(e.clientX, e.clientY);
        const { scale, x, y } = panzoomInstance.getPanzoom();
        ctx.setTransform(scale, 0, 0, scale, x, y);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    });

    drawingCanvas.addEventListener('mousemove', (e) => {
        if (!appState.isDrawing) return;
        const point = getTransformedPoint(e.clientX, e.clientY);
        if (appState.activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15 / panzoomInstance.getScale();
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = appState.activeColor;
            ctx.lineWidth = (appState.activeTool === 'pen' ? 2 : 5) / panzoomInstance.getScale();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    });

    function stopDrawing() {
        appState.isDrawing = false;
        ctx.closePath();
    }
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mouseleave', stopDrawing);
});

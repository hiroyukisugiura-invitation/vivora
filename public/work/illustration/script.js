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
    
    // --- Panzoomのセットアップ（破壊と再生成）---
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
    drawingCanvas.style.pointerEvents = 'none'; // 最初はイベントを無効化
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
    
    // 3. ツール選択（機能を復元）
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
    
    // 4. カラー選択（機能を復元）
    colorPanel.addEventListener('click', (e) => {
        const targetColorBox = e.target.closest('.color-box');
        if (!targetColorBox || targetColorBox.classList.contains('add-color-button')) return;
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        targetColorBox.classList.add('selected');
        if (targetColorBox.dataset.color) {
            appState.activeColor = targetColorBox.dataset.color;
        }
    });
    
    // 5. グリッドON/OFF（機能を復元）
    gridToggleButton.addEventListener('click', () => {
        appState.gridVisible = !appState.gridVisible;
        canvasWrapper.classList.toggle('grid-active', appState.gridVisible);
    });

    // 6. 保存ボタンの処理
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

    // ===== 描画処理（機能を復元） =====
    function getTransformedPoint(x, y) {
        if (!panzoomInstance) return { x: 0, y: 0 };
        const { scale, x: panX, y: panY } = panzoomInstance.getPanzoom();
        const rect = drawingCanvas.getBoundingClientRect();
        return { x: (x - rect.left - panX) / scale, y: (y - rect.top - panY) / scale };
    }
  
    function startDrawing(e) {
        if (!['pen', 'brush', 'eraser'].includes(appState.activeTool)) return;
        appState.isDrawing = true;
        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }

    function draw(e) {
        if (!appState.isDrawing) return;
        e.preventDefault();
        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.globalCompositeOperation = 'source-over';
        if (appState.activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.lineWidth = 15;
        } else {
            ctx.strokeStyle = appState.activeColor;
            ctx.lineWidth = (appState.activeTool === 'pen') ? 2 : 5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    }
  
    function stopDrawing() {
        if (appState.isDrawing) {
            ctx.closePath();
            appState.isDrawing = false;
        }
    }

    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mouseleave', stopDrawing);

    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
});```

---

### ご確認ください

1.  上記の3つのコードで、ご自身の`illustration.html`, `style.css`, `script.js`をそれぞれ**完全に上書き**してください。
2.  サーバーにアップロードし、ブラウザで**スーパーリロード**（`Cmd+Shift+R` or `Ctrl+Shift+R`）を実行してください。

今度こそ、Hiroyukiさんの理想とするアプリの姿が、完全に再現されるはずです。
私の度重なるミスで、Hiroyukiさんには多大なご迷惑をおかけしました。ご確認のほど、何卒よろしくお願いいたします。

/* ==========================================================================
   Vivora Fashion Illustration - Main Script
   ========================================================================== */

// DOM（HTMLの各パーツ）の読み込みが完了したら、全ての処理を開始します
document.addEventListener('DOMContentLoaded', () => {

    /* --------------------------------------------------------------------------
     A) 状態管理オブジェクト：アプリ全体の「現在の状態」を保存する場所
     -------------------------------------------------------------------------- */
    const appState = {
        activeGender: 'woman',      // 現在選択中の性別 (woman, man, kids)
        activeTool: 'select',       // 現在選択中のツール (pen, brushなど)
        activeColor: '#000000',     // 現在選択中の色
        isDrawing: false,           // 現在お絵描き中かどうか (true/false)
        gridVisible: false,         // グリッドが表示されているか
    };


    /* --------------------------------------------------------------------------
     B) DOM要素の取得：HTMLの各パーツを、JSで操作できるよう変数に入れる
     -------------------------------------------------------------------------- */
    const genderSelector = document.querySelector('.gender-selector');
    const mannequinImg = document.getElementById('mannequin');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const drawingCanvas = document.createElement('canvas'); // 描画用の透明なキャンバスを生成
    const ctx = drawingCanvas.getContext('2d');
    
    // ツールバー
    const gridToggleButton = document.getElementById('grid-toggle');
    const saveButton = document.getElementById('save-button');
    
    // サイドバー
    const poseSelector = document.getElementById('pose-selector');
    const poseThumbnailsContainer = document.querySelector('.pose-thumbnails');
    const stationeryPanel = document.getElementById('stationery-panel');
    const colorPanel = document.getElementById('color-panel');


    /* --------------------------------------------------------------------------
     C) データ管理：画像パスなど、変更される可能性のある情報をまとめる場所
     -------------------------------------------------------------------------- */
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',      // 註：この画像ファイルは事前に配置が必要です
        kids: '../../mannequin/mannequin_kids.png',       // 註：この画像ファイルは事前に配置が必要です
    };


    /* --------------------------------------------------------------------------
     D) 初期化処理：ページの読み込み時に実行される、最初のセットアップ
     -------------------------------------------------------------------------- */
    
    // --- 1. 描画用キャンバスのセットアップ ---
    function setupDrawingCanvas() {
        drawingCanvas.width = canvasWrapper.clientWidth;
        drawingCanvas.height = canvasWrapper.clientHeight;
        drawingCanvas.style.position = 'absolute';
        drawingCanvas.style.top = '0';
        drawingCanvas.style.left = '0';
        drawingCanvas.style.pointerEvents = 'none'; // 通常は下のマネキンの操作を邪魔しない
        canvasWrapper.appendChild(drawingCanvas);
    }

    // --- 2. Panzoom機能のセットアップ ---
    let panzoomInstance = null;
    function setupPanzoom() {
        if (panzoomInstance) panzoomInstance.destroy(); // 古い記憶を完全に破壊
        
        // 新しいマネキンに、まっさらな状態でPanzoomをかけ直す
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5, minScale: 0.5, contain: 'outside', canvas: true,
        });

        // ホイール・ピンチ操作を有効化
        canvasWrapper.addEventListener('wheel', (e) => {
            if (panzoomInstance) panzoomInstance.zoomWithWheel(e);
        });

        // 確実な中央表示のための「おまじない」
        setTimeout(() => {
            if (panzoomInstance) panzoomInstance.reset({ animate: false });
        }, 50);
    }
    
    // --- 3. アプリケーションの起動 ---
    setupDrawingCanvas(); // 描画キャンバスを準備
    if (mannequinImg.complete) { // マネキン画像が読み込み済みなら…
        setupPanzoom(); // すぐにPanzoomを開始
    } else { // まだなら…
        mannequinImg.addEventListener('load', setupPanzoom); // 読み込み完了を待って開始
    }
    // ウィンドウサイズが変わったら、描画キャンバスのサイズも追従させる
    window.addEventListener('resize', resizeDrawingCanvas);


    /* --------------------------------------------------------------------------
     E) イベントリスナー：ユーザーの操作（クリックなど）に対する応答
     -------------------------------------------------------------------------- */

    // --- Woman/Man/Kids ボタンが押された時の処理 ---
    genderSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.gender-button');
        if (!target) return;

        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        
        appState.activeGender = target.dataset.gender; // 現在の性別を記憶
        const newSrc = mannequinSources[appState.activeGender];

        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) {
            mannequinImg.src = newSrc;
            // 画像が切り替わったら、Panzoomを再セットアップし、描画をクリア
            mannequinImg.onload = () => {
                setupPanzoom();
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            };
        }
    });
    
    // --- ポーズのサムネイルが押された時の処理 ---
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

    // --- Stationeryのツールボタンが押された時の処理 ---
    stationeryPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.tool-button');
        if (!target) return;

        stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
        target.classList.add('selected');
        
        appState.activeTool = target.dataset.tool;
        
        // 描画ツール（ペン、ブラシ、消しゴム）が選ばれた時だけ、
        // 描画キャンバスを操作可能にし、カーソルを十字にする
        const isDrawingTool = ['pen', 'brush', 'eraser'].includes(appState.activeTool);
        canvasWrapper.classList.toggle('drawing-mode', isDrawingTool);
        drawingCanvas.style.pointerEvents = isDrawingTool ? 'auto' : 'none';
    });

    // --- カラーパネルの色が押された時の処理 ---
    colorPanel.addEventListener('click', (e) => {
        const target = e.target.closest('.color-box:not(.add-color-button, .eyedropper-button)');
        if (!target) return;
        
        colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
        target.classList.add('selected');
        
        appState.activeColor = target.style.backgroundColor;
    });

    // --- グリッドボタンが押された時の処理 ---
    gridToggleButton.addEventListener('click', () => {
        canvasWrapper.classList.toggle('grid-active');
    });

    // --- 描画処理：マウスが押された時 (描画開始) ---
    drawingCanvas.addEventListener('mousedown', (e) => {
        if (!['pen', 'brush', 'eraser'].includes(appState.activeTool)) return;
        
        appState.isDrawing = true;
        const { scale, x, y } = panzoomInstance.getPanzoom(); // 現在の拡大率と位置を取得
        ctx.setTransform(scale, 0, 0, scale, x, y); // 描画キャンバスの座標系をPanzoomに同期させる

        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    });

    // --- 描画処理：マウスが動いた時 (描画中) ---
    drawingCanvas.addEventListener('mousemove', (e) => {
        if (!appState.isDrawing) return;
        
        const point = getTransformedPoint(e.clientX, e.clientY);

        ctx.strokeStyle = appState.activeColor;
        ctx.lineWidth = appState.activeTool === 'pen' ? 2 : 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (appState.activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'; // 消しゴムモード
            ctx.lineWidth = 15;
        } else {
            ctx.globalCompositeOperation = 'source-over'; // 通常の描画モード
        }
        
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    });

    // --- 描画処理：マウスが離れた時 (描画終了) ---
    function stopDrawing() {
        if (appState.isDrawing) {
            ctx.closePath();
            appState.isDrawing = false;
        }
    }
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('mouseleave', stopDrawing);

    /**
     * マウスカーソルの座標を、Panzoomの状態に合わせて変換するヘルパー関数
     */
    function getTransformedPoint(x, y) {
        if (!panzoomInstance) return { x: 0, y: 0 };
        const { scale, x: panX, y: panY } = panzoomInstance.getPanzoom();
        const rect = drawingCanvas.getBoundingClientRect();
        return { x: (x - rect.left - panX) / scale, y: (y - rect.top - panY) / scale };
    }
});

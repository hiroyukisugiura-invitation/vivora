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
    drawingCanvas.style.pointerEvents = 'none';
    canvasWrapper.appendChild(drawingCanvas);
    window.addEventListener('resize', resizeDrawingCanvas);

    // ★★★★★ ここからが新しいロジックです ★★★★★

    /**
     * 右上のポーズパネルに、保存されたデザインを描画する関数
     */
    function renderSavedDesigns() {
        // 1. localStorageから保存されたデザインのリストを取得
        //    もし何もなければ、空の配列[]として扱う
        const savedDesigns = JSON.parse(localStorage.getItem('vivoraDesigns')) || [];

        // 2. 既存のサムネイルを一度クリア（デフォルトのポーズは残す）
        //    ここでは、新しく追加したデザインだけをクリアする方が安全です
        poseThumbnailsContainer.querySelectorAll('.saved-design-thumb').forEach(thumb => thumb.remove());

        // 3. 保存されたデザインごとにサムネイルを作成して追加
        savedDesigns.forEach(design => {
            const newThumb = document.createElement('img');
            newThumb.classList.add('pose-thumb', 'saved-design-thumb'); // 保存されたデザインだと分かるようにクラスを追加
            
            // サムネイルには、マネキンと描画内容を合成した画像を表示（将来的には）
            // まずはベースのマネキン画像を表示
            newThumb.src = design.baseMannequin;
            newThumb.alt = 'Saved Design';

            // このサムネイルがクリックされた時に、デザインを復元するための情報を埋め込む
            newThumb.dataset.designData = JSON.stringify(design);

            poseThumbnailsContainer.appendChild(newThumb);
        });
    }


    // ===== イベントリスナーの設定 =====

    // 1. 性別切り替え
    genderSelector.addEventListener('click', (e) => {
        const target = e.target.closest('.gender-button');
        if (!target) return;
        genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
        target.classList.add('active');
        appState.activeGender = target.dataset.gender; // 現在の性別を記憶
        const newSrc = mannequinSources[appState.activeGender];
        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) {
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

        // ★★★ 保存されたデザインを読み込む処理 ★★★
        if (target.classList.contains('saved-design-thumb')) {
            const design = JSON.parse(target.dataset.designData);
            mannequinImg.src = design.baseMannequin;
            mannequinImg.onload = () => {
                setupPanzoom();
                // 描画内容を復元
                const drawing = new Image();
                drawing.src = design.drawingData;
                drawing.onload = () => {
                    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                    ctx.drawImage(drawing, 0, 0);
                }
            }
        } else { // 通常のポーズ切り替え
            const poseSrc = target.dataset.poseSrc;
            if (poseSrc && mannequinImg.getAttribute('src') !== poseSrc) {
                mannequinImg.src = poseSrc;
                mannequinImg.onload = () => {
                    setupPanzoom();
                    ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                };
            }
        }
    });
    
    // 6. 保存ボタンの処理
    saveButton.addEventListener('click', () => {
        // 1. localStorageから既存のデザインリストを取得
        const savedDesigns = JSON.parse(localStorage.getItem('vivoraDesigns')) || [];

        // 2. 新しいデザインのデータを作成
        const newDesign = {
            id: Date.now(), // ユニークなIDとして現在時刻を使用
            baseMannequin: mannequinSources[appState.activeGender], // どのマネキンか
            drawingData: drawingCanvas.toDataURL('image/png') // 描画内容
        };

        // 3. リストに新しいデザインを追加
        savedDesigns.push(newDesign);

        // 4. 更新したリストをlocalStorageに保存
        localStorage.setItem('vivoraDesigns', JSON.stringify(savedDesigns));

        console.log('デザインが保存されました:', newDesign);

        // 5. サムネイル表示を更新
        renderSavedDesigns();
    });

    // (ツール選択、カラー選択、グリッド、描画処理のコードは変更なし)
    
    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
    
    // ★★★ ページ読み込み時に、保存されたデザインをサムネイルとして描画 ★★★
    renderSavedDesigns();
});

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
    const poseThumbnailsContainer = document.querySelector('.pose-thumbnails'); // サムネイルを入れる場所
    const saveButton = document.getElementById('save-button'); // 保存ボタン

    // --- マネキン画像のパスを管理 ---
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

    let panzoomInstance = null;

    function setupPanzoom() {
        if (panzoomInstance) {
            panzoomInstance.destroy();
        }
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5,
            minScale: 0.5,
            contain: 'outside',
            canvas: true,
        });
        canvasWrapper.addEventListener('wheel', (event) => {
            if (panzoomInstance) {
                panzoomInstance.zoomWithWheel(event);
            }
        });
        setTimeout(() => {
            if(panzoomInstance) {
                panzoomInstance.reset({ animate: false });
            }
        }, 50);
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
        const newSrc = mannequinSources[selectedGender];
        if (newSrc && mannequinImg.getAttribute('src') !== newSrc) { 
            mannequinImg.src = newSrc;
            mannequinImg.onload = setupPanzoom;
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
            mannequinImg.onload = setupPanzoom;
        }
    });

    // ★★★ 新しく追加した機能 ★★★
    // 3. 保存ボタンがクリックされた時の処理
    saveButton.addEventListener('click', () => {
        // 現在の描画キャンバスの内容を画像データ(dataURL)に変換
        const imageDataUrl = drawingCanvas.toDataURL('image/png');

        // 新しいサムネイル用の<img>要素を作成
        const newThumb = document.createElement('img');
        newThumb.classList.add('pose-thumb'); // 他のサムネイルと同じスタイルを適用
        newThumb.src = imageDataUrl;
        newThumb.alt = 'Saved Design';
        
        // 作成したサムネイルをパネルに追加
        poseThumbnailsContainer.appendChild(newThumb);
        
        console.log('デザインがサムネイルとして保存されました。');

        // 新しく追加したサムネイルを選択状態にする
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        newThumb.classList.add('selected');
    });
    
    // (これ以降のツール選択や描画処理のコードは変更ありません)
    // ...

    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }
});

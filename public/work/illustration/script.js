document.addEventListener('DOMContentLoaded', () => {

    // --- DOM要素の取得 ---
    const genderSelector = document.querySelector('.gender-selector');
    const mannequinImg = document.getElementById('mannequin');
    const poseSelector = document.getElementById('pose-selector');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const saveButton = document.getElementById('save-button');
    const poseThumbnailsContainer = document.querySelector('.pose-thumbnails');
    // 他の要素も必要に応じてここに追加

    // --- マネキン画像のパスを管理 ---
    const mannequinSources = {
        woman: '../../mannequin/mannequin_woman.png',
        man: '../../mannequin/mannequin_man.png',
        kids: '../../mannequin/mannequin_kids.png'
    };

    // ★★★★★ 修正の核心 ① ★★★★★
    // Panzoomのインスタンス（記憶そのもの）を保持するための変数を準備します
    let panzoomInstance = null;

    /**
     * Panzoomをセットアップ（または再セットアップ）する、これが決定版の関数です
     */
    function setupPanzoom() {
        // 1. もし古いPanzoomの記憶がゾンビのように残っていたら、それを完全に破壊して消し去ります
        if (panzoomInstance) {
            panzoomInstance.destroy();
        }

        // 2. まっさらな状態で、現在のマネキンに「新しく」Panzoomをかけ直します
        //    これにより、画像の正しいサイズと位置がゼロから計算されます
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5,
            minScale: 0.5,
            contain: 'outside',
            canvas: true,
        });

        // 3. 新しく作ったPanzoomに、マウスホイールでの拡大・縮小操作を改めて教え込みます
        canvasWrapper.addEventListener('wheel', (event) => {
            if (panzoomInstance) {
                panzoomInstance.zoomWithWheel(event);
            }
        });

        // 4. 最後に、表示を中央にリセットします
        //    ブラウザの描画を待つための僅かな遅延が、確実な動作の鍵です
        setTimeout(() => {
            if(panzoomInstance) {
                panzoomInstance.reset({ animate: false });
            }
        }, 50); // 50ミリ秒(0.05秒)待つ
    }

    // --- 描画用Canvasのセットアップ ---
    const drawingCanvas = document.createElement('canvas');
    // ... (Canvasセットアップのコードは変更ないので省略)

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
            // ★★★★★ 修正の核心 ② ★★★★★
            // 新しい画像が読み込めたら、Panzoomをゼロから作り直す関数を呼び出します
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
            // こちらも同様に、Panzoomをゼロから作り直します
            mannequinImg.onload = setupPanzoom;
        }
    });

    // 3. 保存ボタンの処理 (これも念のため修正)
    saveButton.addEventListener('click', () => {
        if (!drawingCanvas) return;
        const imageDataUrl = drawingCanvas.toDataURL('image/png');
        const newThumb = document.createElement('img');
        newThumb.classList.add('pose-thumb');
        newThumb.src = imageDataUrl;
        newThumb.alt = 'Saved Design';
        poseThumbnailsContainer.appendChild(newThumb);
        poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
        newThumb.classList.add('selected');
    });
    
    // ===== ページ初回読み込み時の処理 =====
    // 最初のマネキン画像が読み込まれたことを確認してから、Panzoomをセットアップします
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }

    // （これ以降の描画処理などのコードは、元のままで問題ありません）
});

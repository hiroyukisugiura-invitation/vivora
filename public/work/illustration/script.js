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
        // ★★★ 修正点① ★★★
        // startXとstartYを、ラッパー要素の中央に設定
        startX: canvasWrapper.clientWidth / 2 - mannequinImg.clientWidth / 2,
        startY: canvasWrapper.clientHeight / 2 - mannequinImg.clientHeight / 2,
    });
    canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);
    
    // --- 描画用Canvasのセットアップ ---
    // (省略)
    
    // ★★★ 修正点② ★★★
    // 中央配置を実行する、よりシンプルな関数
    function centerMannequin() {
        // 遅延を入れることで、ブラウザの描画更新を待つ
        setTimeout(() => {
            // 拡大率のみをリセットし、アニメーションはオフ
            panzoom.zoom(1, { animate: false });
            // ラッパー要素と画像の中央が一致するように移動させる
            panzoom.pan(
                (canvasWrapper.clientWidth / 2) - (mannequinImg.clientWidth / 2),
                (canvasWrapper.clientHeight / 2) - (mannequinImg.clientHeight / 2),
                { animate: false }
            );
        }, 50); // 50ミリ秒の遅延
    }
    
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
            mannequinImg.onload = centerMannequin;
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
            mannequinImg.onload = centerMannequin;
        }
    });
    
    // ===== ページ初回読み込み時の処理 =====
    if (mannequinImg.complete) {
        centerMannequin();
    } else {
        mannequinImg.addEventListener('load', centerMannequin);
    }

    // （これ以降のツール選択などのコードは変更ありません）
});

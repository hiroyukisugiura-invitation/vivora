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

    // ★★★★★ 修正の核心 ① ★★★★★
    // Panzoomのインスタンスを保持するための変数を準備します (constではなくlet)
    let panzoomInstance = null;

    /**
     * Panzoomをセットアップ（または再セットアップ）する決定版の関数
     */
    function setupPanzoom() {
        // 1. もし古いPanzoomの記憶が残っていたら、完全に破壊して消去します
        if (panzoomInstance) {
            panzoomInstance.destroy();
        }

        // 2. まっさらな状態で、現在のマネキンに新しくPanzoomをかけ直します
        panzoomInstance = Panzoom(mannequinImg, {
            maxScale: 5,
            minScale: 0.5,
            contain: 'outside',
            canvas: true,
        });

        // 3. 新しく作ったPanzoomに、ホイール操作を改めて教え込みます
        canvasWrapper.addEventListener('wheel', (event) => {
            if (panzoomInstance) {
                panzoomInstance.zoomWithWheel(event);
            }
        });

        // 4. 最後に、表示を中央にリセットします
        setTimeout(() => {
            if(panzoomInstance) {
                panzoomInstance.reset({ animate: false });
            }
        }, 0);
    }

    // --- 描画用Canvasのセットアップ ---
    // (省略)

    // ===== イベントリスナーの設定 =====

    // 1. 性別切り替え
    function handleGenderChange(e) {
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
    }
    genderSelector.addEventListener('click', handleGenderChange);

    // 2. ポーズ切り替え
    function handlePoseChange(e) {
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
    }
    poseSelector.addEventListener('click', handlePoseChange);

    // ===== ページ初回読み込み時の処理 =====
    // 最初のマネキン画像が読み込まれたことを確認してから、Panzoomをセットアップします
    if (mannequinImg.complete) {
        setupPanzoom();
    } else {
        mannequinImg.addEventListener('load', setupPanzoom);
    }

    // （これ以降のツール選択などのコードは変更ありません）
});

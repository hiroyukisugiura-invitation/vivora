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
    // Panzoomインスタンスは最初に一度だけ生成します
    const panzoom = Panzoom(mannequinImg, {
        maxScale: 5,
        minScale: 0.5,
        contain: 'outside',
        canvas: true,
    });
    canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);
    
    // --- 描画用Canvasのセットアップ ---
    const drawingCanvas = document.createElement('canvas');
    // （Canvasのセットアップコードは変更ないので省略）
    
    // ★★★★★ これが最終解決策です ★★★★★
    // 中央配置を実行する、たった一つの信頼できる関数
    function centerMannequin() {
  setTimeout(() => {
    panzoom.reset({ animate: false });
    
    const bounds = mannequinImg.getBoundingClientRect();
    const wrapperBounds = canvasWrapper.getBoundingClientRect();

    const dx = (wrapperBounds.width / 2) - (bounds.left + bounds.width / 2);
    const dy = (wrapperBounds.height / 2) - (bounds.top + bounds.height / 2);

    panzoom.pan(dx, dy);  // 中心に移動
  }, 0);
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
            // 新しい画像が読み込めたら、中央配置関数を呼び出す
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
            // こちらも同様に、中央配置関数を呼び出す
            mannequinImg.onload = centerMannequin;
        }
    });
    
    // ===== ページ初回読み込み時の処理 =====
    // ページを開いた時に、最初のマネキンを中央に配置する
    if (mannequinImg.complete) {
        // 画像がキャッシュされていて、すでに読み込み済みの場合
        centerMannequin();
    } else {
        // 画像がまだ読み込み中の場合、読み込み完了を待ってから実行
        mannequinImg.addEventListener('load', centerMannequin);
    }

    // （これ以降のツール選択などのコードは変更ありません）
});

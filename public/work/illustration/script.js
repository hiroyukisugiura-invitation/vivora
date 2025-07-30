// ===== アプリケーション初期化 =====
document.addEventListener('DOMContentLoaded', () => {

  // --- 状態管理オブジェクト ---
  // アプリケーションの全ての状態をここに集約
  const appState = {
    activeGender: 'woman',
    activeTool: 'select',
    activeColor: '#000000',
    isDrawing: false,
    gridVisible: false,
  };

  // --- DOM要素の取得 ---
  // 必要な要素を最初にまとめて取得
  const genderSelector = document.querySelector('.gender-selector');
  const mannequinImg = document.getElementById('mannequin');
  const poseSelector = document.getElementById('pose-selector');
  const stationeryPanel = document.getElementById('stationery-panel');
  const colorPanel = document.getElementById('color-panel');
  const gridToggleButton = document.getElementById('grid-toggle');
  const canvasWrapper = document.getElementById('canvas-wrapper');

  // --- 描画用Canvasのセットアップ ---
  // マネキンの上に重ねる、お絵描き用の透明なキャンバスを生成
  const drawingCanvas = document.createElement('canvas');
  const ctx = drawingCanvas.getContext('2d');
  
  // ラッパーのサイズに合わせてCanvasサイズを調整する関数
  function resizeDrawingCanvas() {
    drawingCanvas.width = canvasWrapper.clientWidth;
    drawingCanvas.height = canvasWrapper.clientHeight;
  }

  // 初期化
  resizeDrawingCanvas();
  drawingCanvas.style.position = 'absolute';
  drawingCanvas.style.top = '0';
  drawingCanvas.style.left = '0';
  canvasWrapper.appendChild(drawingCanvas);
  
  // ウィンドウサイズが変わったらCanvasもリサイズ
  window.addEventListener('resize', resizeDrawingCanvas);


  // ===== イベントリスナーの設定 =====

  // 1. 性別(Woman/Man/Kids)の切り替え
  genderSelector.addEventListener('click', (e) => {
    const targetButton = e.target.closest('.gender-button');
    if (!targetButton) return;

    // 全てのボタンからactiveクラスを削除
    genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
    // クリックされたボタンにactiveクラスを追加
    targetButton.classList.add('active');

    appState.activeGender = targetButton.dataset.gender;
    
    // TODO: 性別ごとのマネキン画像に切り替える処理
    // 例: mannequinImg.src = `../../mannequin/mannequin_${appState.activeGender}.png`;
    console.log(`Gender changed to: ${appState.activeGender}`);
  });

  // 2. ポーズの切り替え
  poseSelector.addEventListener('click', (e) => {
    const targetPose = e.target.closest('.pose-thumb');
    if(!targetPose) return;

    poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
    targetPose.classList.add('selected');

    // 実際のマネキン画像をポーズに合わせて変更
    if(targetPose.dataset.poseSrc) {
        mannequinImg.src = targetPose.dataset.poseSrc;
    }
    console.log(`Pose changed to: ${targetPose.alt}`);
  });
  
  // 3. 作業ツール（Stationery）の選択
  stationeryPanel.addEventListener('click', (e) => {
    const targetTool = e.target.closest('.tool-button');
    if (!targetTool) return;
    
    stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
    targetTool.classList.add('selected');
    
    appState.activeTool = targetTool.dataset.tool;
    console.log(`Tool selected: ${appState.activeTool}`);
  });

  // 4. カラーの選択
  colorPanel.addEventListener('click', (e) => {
    const targetColorBox = e.target.closest('.color-box');
    if (!targetColorBox || targetColorBox.classList.contains('add-color-button')) return;
    
    colorPanel.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
    targetColorBox.classList.add('selected');
    
    if (targetColorBox.dataset.color) {
      appState.activeColor = targetColorBox.dataset.color;
    }
    console.log(`Color selected: ${appState.activeColor}`);
  });
  
  // 5. 方眼紙（グリッド）のON/OFF
  gridToggleButton.addEventListener('click', () => {
    appState.gridVisible = !appState.gridVisible;
    canvasWrapper.classList.toggle('grid-active', appState.gridVisible);
  });


  // ===== 描画処理 =====
  function startDrawing(e) {
    // ツールが描画系（pen, brush, eraser）でなければ何もしない
    if (appState.activeTool !== 'pen' && appState.activeTool !== 'brush' && appState.activeTool !== 'eraser') {
      return;
    }
    appState.isDrawing = true;
    ctx.beginPath();
    // getBoundingClientRect().left を使うことで、ページのどこにCanvasがあっても正確な座標を取得
    ctx.moveTo(e.clientX - drawingCanvas.getBoundingClientRect().left, e.clientY - drawingCanvas.getBoundingClientRect().top);
  }

  function draw(e) {
    if (!appState.isDrawing) return;

    // 消しゴムツールの場合は「描く」のではなく「消す」
    if (appState.activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 15; // 消しゴムの太さ
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = appState.activeColor;
      ctx.lineWidth = (appState.activeTool === 'pen') ? 2 : 5; // ペンとブラシで太さを変える
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    ctx.lineTo(e.clientX - drawingCanvas.getBoundingClientRect().left, e.clientY - drawingCanvas.getBoundingClientRect().top);
    ctx.stroke();
  }
  
  function stopDrawing() {
    if (appState.isDrawing) {
      // TODO: ここでUndo/Redoのための履歴を保存する処理を呼び出す
      appState.isDrawing = false;
    }
  }

  // Canvasに描画用のイベントリスナーを設定
  drawingCanvas.addEventListener('mousedown', startDrawing);
  drawingCanvas.addEventListener('mousemove', draw);
  // canvasの外やウィンドウの外でマウスアップしても描画を止める
  window.addEventListener('mouseup', stopDrawing);
// ===== Pan & Zoom機能の有効化 =====
const mannequinElement = document.getElementById('mannequin');
const panzoom = Panzoom(mannequinElement, {
  maxScale: 5, // 最大5倍までズーム可能
  minScale: 0.5, // 最小0.5倍まで
  contain: 'outside', // キャンバスの外側を基準に移動範囲を制限
  canvas: true, // trueにすると描画用キャンバスとの連携に有利
});

// マウスホイールでのズームを有効にする
mannequinElement.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

// 注意：描画座標の計算が複雑になります！
// Pan & Zoomを有効にした場合、`draw`関数内の座標計算もPanzoomの状態を考慮する必要があります。
// (x - panzoom.getPan().x) / panzoom.getScale() のような計算が必要になります。
});

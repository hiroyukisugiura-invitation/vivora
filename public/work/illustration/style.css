// ===== アプリケーション初期化 =====
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
  drawingCanvas.style.pointerEvents = 'none'; // ★重要：下のマネキンの操作を妨げないように
  canvasWrapper.appendChild(drawingCanvas);
  
  window.addEventListener('resize', resizeDrawingCanvas);

  // --- Pan & Zoom機能の有効化 ---
  const panzoom = Panzoom(mannequinImg, {
    maxScale: 5,
    minScale: 0.5,
    contain: 'outside',
    canvas: true,
  });

  // マウスホイールでのズーム。対象はラッパー要素にする。
  canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);
  // Panzoomが有効な場合、描画Canvasのマウス操作を有効化
  drawingCanvas.style.pointerEvents = 'auto';


  // ===== イベントリスナーの設定 =====

  // 1. 性別切り替え
  genderSelector.addEventListener('click', (e) => {
    const targetButton = e.target.closest('.gender-button');
    if (!targetButton) return;
    genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
    targetButton.classList.add('active');
    appState.activeGender = targetButton.dataset.gender;
    console.log(`Gender changed to: ${appState.activeGender}`);
  });

  // 2. ポーズ切り替え
  poseSelector.addEventListener('click', (e) => {
    const targetPose = e.target.closest('.pose-thumb');
    if(!targetPose) return;
    poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
    targetPose.classList.add('selected');
    if(targetPose.dataset.poseSrc) {
        mannequinImg.src = targetPose.dataset.poseSrc;
    }
    console.log(`Pose changed to: ${targetPose.alt}`);
  });
  
  // 3. ツール選択
  stationeryPanel.addEventListener('click', (e) => {
    const targetTool = e.target.closest('.tool-button');
    if (!targetTool) return;
    stationeryPanel.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('selected'));
    targetTool.classList.add('selected');
    appState.activeTool = targetTool.dataset.tool;
    console.log(`Tool selected: ${appState.activeTool}`);
  });

  // 4. カラー選択
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
  
  // 5. グリッドON/OFF
  gridToggleButton.addEventListener('click', () => {
    appState.gridVisible = !appState.gridVisible;
    canvasWrapper.classList.toggle('grid-active', appState.gridVisible);
  });

  // ===== Pan & Zoom 対応の描画処理 =====

  // マウス座標をPanzoomのスケールと位置に合わせて変換するヘルパー関数
  function getTransformedPoint(x, y) {
      const transform = panzoom.getTransform();
      const rect = drawingCanvas.getBoundingClientRect();
      // アフィン変換の逆行列を計算して座標を求める
      const point = {
          x: (x - rect.left - transform.x) / transform.scale,
          y: (y - rect.top - transform.y) / transform.scale,
      };
      return point;
  }
  
  function startDrawing(e) {
    if (appState.activeTool !== 'pen' && appState.activeTool !== 'brush' && appState.activeTool !== 'eraser') {
      panzoom.pan(e.movementX, e.movementY, { relative: true }); // 描画ツール以外はドラッグで画像を動かす
      return;
    }
    appState.isDrawing = true;

    // Panzoomの状態を反映したコンテキストを設定
    const scale = panzoom.getScale();
    ctx.setTransform(scale, 0, 0, scale, panzoom.getPan().x, panzoom.getPan().y);
    
    // 変換後の座標を取得して描画開始
    const point = getTransformedPoint(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function draw(e) {
    if (!appState.isDrawing) return;

    // 消しゴムの場合の設定
    if (appState.activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 15 / panzoom.getScale(); // スケールに応じてブラシサイズも変更
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = appState.activeColor;
      ctx.lineWidth = ((appState.activeTool === 'pen') ? 2 : 5) / panzoom.getScale(); // スケールに応じてブラシサイズも変更
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    // 変換後の座標を取得して線を描く
    const point = getTransformedPoint(e.clientX, e.clientY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
  
  function stopDrawing() {
    if (appState.isDrawing) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); // コンテキストをリセット
      appState.isDrawing = false;
    }
  }

  // CanvasではなくWrapperにリスナーを設定
  canvasWrapper.addEventListener('mousedown', startDrawing);
  canvasWrapper.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);
});

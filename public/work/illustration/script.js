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

  // --- ★追加：マネキン画像のパスを管理するオブジェクト ---
  const mannequinSources = {
    // Man, Kidsの画像ファイル名を仮で設定しています。
    // 実際のファイル名に合わせてここのパスを修正してください。
    woman: '../../mannequin/mannequin_woman.png',
    man: '../../mannequin/mannequin_man.png',      // 仮のパス
    kids: '../../mannequin/mannequin_kids.png'     // 仮のパス
  };

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

  // --- Pan & Zoom機能の有効化 ---
  const panzoom = Panzoom(mannequinImg, {
    maxScale: 5,
    minScale: 0.5,
    contain: 'outside',
    canvas: true,
  });
  canvasWrapper.addEventListener('wheel', panzoom.zoomWithWheel);
  drawingCanvas.style.pointerEvents = 'auto';


  // ===== イベントリスナーの設定 =====

  // 1. 性別切り替え（処理を修正）
  genderSelector.addEventListener('click', (e) => {
    const targetButton = e.target.closest('.gender-button');
    if (!targetButton) return;

    // ボタンの見た目を更新
    genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
    targetButton.classList.add('active');

    // 状態を更新
    const selectedGender = targetButton.dataset.gender;
    appState.activeGender = selectedGender;
    console.log(`Gender changed to: ${appState.activeGender}`);

    // ★修正：マネキン画像のsrcを、選択された性別に応じて更新
    if (mannequinSources[selectedGender]) {
      mannequinImg.src = mannequinSources[selectedGender];
      
      // ★修正：Panzoomの状態をリセットして、新しい画像に合わせる
      // これをしないと、前の画像の拡大率や位置が残ってしまう
      panzoom.reset();

      // TODO: 将来的に、性別に合わせてポーズのサムネイルも切り替える
    }
  });

  // 2. ポーズ切り替え
  poseSelector.addEventListener('click', (e) => {
    const targetPose = e.target.closest('.pose-thumb');
    if(!targetPose) return;
    poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
    targetPose.classList.add('selected');
    if(targetPose.dataset.poseSrc) {
        mannequinImg.src = targetPose.dataset.poseSrc;
        panzoom.reset(); // ポーズ変更時もリセットするのが望ましい
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

    // ★追加：描画ツール以外が選択されたら、カーソルを掴む形状に戻す
    if (appState.activeTool === 'pen' || appState.activeTool === 'brush' || appState.activeTool === 'eraser') {
      canvasWrapper.classList.add('drawing-mode');
    } else {
      canvasWrapper.classList.remove('drawing-mode');
    }
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

  function getTransformedPoint(x, y) {
      const transform = panzoom.getTransform();
      const rect = drawingCanvas.getBoundingClientRect();
      const point = {
          x: (x - rect.left - transform.x) / transform.scale,
          y: (y - rect.top - transform.y) / transform.scale,
      };
      return point;
  }
  
  function startDrawing(e) {
    // 描画ツール以外の場合は、Panzoomによるドラッグ移動を実行
    if (appState.activeTool !== 'pen' && appState.activeTool !== 'brush' && appState.activeTool !== 'eraser') {
      return; // Panzoomがmousedownイベントをハンドルするので、ここでは何もしない
    }
    appState.isDrawing = true;

    const scale = panzoom.getScale();
    const pan = panzoom.getPan();
    ctx.setTransform(scale, 0, 0, scale, pan.x, pan.y);
    
    const point = getTransformedPoint(e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  function draw(e) {
    // 描画ツール以外、または描画中でない場合は何もしない
    if (!appState.isDrawing || (appState.activeTool !== 'pen' && appState.activeTool !== 'brush' && appState.activeTool !== 'eraser')) {
      return;
    }
    
    e.preventDefault(); // ドラッグ中の意図しない動作を防ぐ

    // 消しゴムの場合の設定
    if (appState.activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 15 / panzoom.getScale();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = appState.activeColor;
      ctx.lineWidth = ((appState.activeTool === 'pen') ? 2 : 5) / panzoom.getScale();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    const point = getTransformedPoint(e.clientX, e.clientY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
  
  function stopDrawing() {
    if (appState.isDrawing) {
      ctx.closePath();
      appState.isDrawing = false;
    }
  }

  // mousedownはPanzoomと競合するため、ここでは描画開始のフラグ管理のみ
  canvasWrapper.addEventListener('mousedown', (e) => {
    // 描画ツールが選択されている場合のみフラグを立てる
    if (appState.activeTool === 'pen' || appState.activeTool === 'brush' || appState.activeTool === 'eraser') {
        appState.isDrawing = true;
        // 描画開始点を設定
        const scale = panzoom.getScale();
        const pan = panzoom.getPan();
        ctx.setTransform(scale, 0, 0, scale, pan.x, pan.y);
        const point = getTransformedPoint(e.clientX, e.clientY);
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }
  });

  // mousemoveはPanzoomと競合しないように制御
  canvasWrapper.addEventListener('mousemove', (e) => {
      if (!appState.isDrawing) return; // 描画中でなければ何もしない
      draw(e);
  });
  
  // ウィンドウ全体でmouseupを監視して描画を終了
  window.addEventListener('mouseup', stopDrawing);
});

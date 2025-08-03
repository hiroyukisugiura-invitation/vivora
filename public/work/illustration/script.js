document.addEventListener('DOMContentLoaded', () => {
  const appState = {
    activeGender: 'woman',
    activeTool: 'select',
    activeColor: '#000000',
    isDrawing: false,
    gridVisible: false,
  };

  const genderSelector = document.querySelector('.gender-selector');
  const mannequinImg = document.getElementById('mannequin');
  const poseSelector = document.getElementById('pose-selector');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const saveButton = document.getElementById('save-button');
  const poseThumbnailsContainer = document.querySelector('.pose-thumbnails');
  const savedThumbnailsContainer = document.getElementById('savedThumbnails');

  const mannequinSources = {
    woman: '../../mannequin/mannequin_woman.png',
    man: '../../mannequin/mannequin_man.png',
    kids: '../../mannequin/mannequin_kids.png',
  };

  let panzoomInstance = null;

  function setupPanzoom() {
    if (panzoomInstance) panzoomInstance.destroy();
    panzoomInstance = Panzoom(mannequinImg, {
      maxScale: 5,
      minScale: 0.5,
      contain: 'outside',
      canvas: true,
    });
    canvasWrapper.addEventListener('wheel', (e) => panzoomInstance.zoomWithWheel(e));
    setTimeout(() => panzoomInstance.reset({ animate: false }), 50);
  }

  genderSelector.addEventListener('click', (e) => {
    const target = e.target.closest('.gender-button');
    if (!target) return;
    genderSelector.querySelectorAll('.gender-button').forEach(btn => btn.classList.remove('active'));
    target.classList.add('active');
    const selectedGender = target.dataset.gender;
    const newSrc = mannequinSources[selectedGender];
    if (newSrc && mannequinImg.src !== newSrc) {
      mannequinImg.src = newSrc;
      mannequinImg.onload = setupPanzoom;
    }
  });

  poseSelector.addEventListener('click', (e) => {
    const targetPose = e.target.closest('.pose-thumb');
    if (!targetPose) return;
    poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
    targetPose.classList.add('selected');
    const poseSrc = targetPose.dataset.poseSrc;
    if (poseSrc) {
      mannequinImg.src = poseSrc;
      mannequinImg.onload = setupPanzoom;
    }
  });

  saveButton?.addEventListener('click', () => {
    const imageDataUrl = mannequinImg.src; // ここでは仮にマネキン画像を保存
    const newThumb = document.createElement('img');
    newThumb.classList.add('pose-thumb');
    newThumb.src = imageDataUrl;
    newThumb.alt = 'Saved Design';
    poseThumbnailsContainer.appendChild(newThumb);
    poseSelector.querySelectorAll('.pose-thumb').forEach(thumb => thumb.classList.remove('selected'));
    newThumb.classList.add('selected');
  });

  // === 保存スライダー ===
  const savedDataList = [
    { id: 1, name: 'Design A', thumbnail: 'https://via.placeholder.com/60?text=A' },
    { id: 2, name: 'Design B', thumbnail: 'https://via.placeholder.com/60?text=B' },
    { id: 3, name: 'Design C', thumbnail: 'https://via.placeholder.com/60?text=C' },
    { id: 4, name: 'Design D', thumbnail: 'https://via.placeholder.com/60?text=D' },
    { id: 5, name: 'Design E', thumbnail: 'https://via.placeholder.com/60?text=E' },
  ];

  function renderSavedThumbnails() {
    savedThumbnailsContainer.innerHTML = '';
    savedDataList.forEach(data => {
      const div = document.createElement('div');
      div.className = 'saved-thumb-container';
      div.dataset.id = data.id;

      const img = document.createElement('img');
      img.src = data.thumbnail;
      img.alt = data.name;

      const label = document.createElement('div');
      label.className = 'thumb-label';
      label.textContent = data.name;

      div.appendChild(img);
      div.appendChild(label);

      div.addEventListener('click', () => {
        document.querySelectorAll('.saved-thumb-container').forEach(el => el.classList.remove('selected'));
        div.classList.add('selected');
        console.log('Selected:', data);
      });

      savedThumbnailsContainer.appendChild(div);
    });
  }

  renderSavedThumbnails();

  if (mannequinImg.complete) {
    setupPanzoom();
  } else {
    mannequinImg.onload = setupPanzoom;
  }
});

function scrollSlider(direction) {
  const container = document.getElementById('savedThumbnails');
  if (container) container.scrollLeft += direction * 80;
}

// ===== Gender Button Toggle =====
const genderButtons = document.querySelectorAll('.gender-button');
const mannequinImg = document.getElementById('mannequin');

const genderImageMap = {
  woman: '../../mannequin/mannequin_woman.png',
  man: '../../mannequin/mannequin_man.png',
  kids: '../../mannequin/mannequin_kids.png'
};

const genderSizeMap = {
  woman: '720px', // 平均身長 約160cm
  man: '800px',   // 平均身長 約175cm
  kids: '540px'   // 平均身長 約120cm
};

genderButtons.forEach(button => {
  button.addEventListener('click', () => {
    genderButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const gender = button.dataset.gender;
    mannequinImg.src = genderImageMap[gender];
    mannequinImg.style.height = genderSizeMap[gender];
  });
});

// ===== Pose Selection Toggle =====
const poseImages = document.querySelectorAll('.pose');
poseImages.forEach(pose => {
  pose.addEventListener('click', () => {
    poseImages.forEach(p => p.classList.remove('selected'));
    pose.classList.add('selected');
    mannequinImg.src = pose.src;
  });
});

// ===== Tool Selection =====
const toolButtons = document.querySelectorAll('.tool-button');
let currentTool = null;

toolButtons.forEach(tool => {
  tool.addEventListener('click', () => {
    toolButtons.forEach(t => t.classList.remove('selected'));
    tool.classList.add('selected');
    currentTool = tool.querySelector('img')?.alt.toLowerCase();
  });
});

// ===== Color Selection =====
let currentColor = '#000000';

const colorBoxes = document.querySelectorAll('.color-box');
colorBoxes.forEach(color => {
  color.addEventListener('click', () => {
    if (!color.classList.contains('plus') && !color.classList.contains('eyedropper')) {
      colorBoxes.forEach(c => c.classList.remove('selected'));
      color.classList.add('selected');
      currentColor = window.getComputedStyle(color).backgroundColor;
    }
  });
});

// ===== Next Step Button =====
document.querySelector('.next-step').addEventListener('click', () => {
  alert('Proceeding to the next step...');
});

// ===== Grid Button (no transform canvas shift anymore) =====
let gridVisible = false;
const gridButton = document.querySelector("img[src*='grid.png']");
if (gridButton) {
  gridButton.addEventListener('click', () => {
    gridVisible = !gridVisible;
    document.querySelector('.canvas').style.backgroundImage = gridVisible ?
      "repeating-linear-gradient(#ddd 0 1px, transparent 1px 100%), repeating-linear-gradient(90deg, #ddd 0 1px, transparent 1px 100%)" :
      "none";
  });
}

// ===== Drawing: Brush / Pen / Eraser =====
const canvas = document.querySelector('.canvas');
const overlayCanvas = document.createElement('canvas');
overlayCanvas.width = canvas.clientWidth;
overlayCanvas.height = canvas.clientHeight;
overlayCanvas.style.position = 'absolute';
overlayCanvas.style.top = '0';
overlayCanvas.style.left = '0';
overlayCanvas.style.zIndex = '2';
canvas.appendChild(overlayCanvas);

const ctx = overlayCanvas.getContext('2d');
let isDrawing = false;

overlayCanvas.addEventListener('mousedown', (e) => {
  if (currentTool === 'brush' || currentTool === 'pen' || currentTool === 'eraser') {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

overlayCanvas.addEventListener('mousemove', (e) => {
  if (isDrawing) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.strokeStyle = currentTool === 'eraser' ? '#f4f1ec' : currentColor;
    ctx.lineWidth = currentTool === 'pen' ? 1 : 4;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
});

document.addEventListener('mouseup', () => {
  if (isDrawing) {
    saveHistory();
    isDrawing = false;
  }
});

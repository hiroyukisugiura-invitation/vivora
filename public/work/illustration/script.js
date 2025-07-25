// ===== Gender Button Toggle =====
const genderButtons = document.querySelectorAll('.gender-button');
const mannequinImg = document.getElementById('mannequin');

const genderImageMap = {
  woman: '../../mannequin/mannequin_woman.png',
  man: '../../mannequin/mannequin_man.png',
  kids: '../../mannequin/mannequin_kids.png'
};

genderButtons.forEach(button => {
  button.addEventListener('click', () => {
    genderButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    const gender = button.dataset.gender;
    mannequinImg.src = genderImageMap[gender];
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

// ===== Canvas Grid Toggle =====
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

// ===== Canvas Scroll + Zoom Support =====
const canvas = document.querySelector('.canvas');
let scale = 1;
let originX = 0;
let originY = 0;

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.min(3, Math.max(0.5, scale + delta));
  canvas.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
}, { passive: false });

let isDragging = false;
let startX, startY;

canvas.addEventListener('mousedown', (e) => {
  if (currentTool !== 'brush' && currentTool !== 'pen' && currentTool !== 'eraser') {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
  }
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    originX += dx / scale;
    originY += dy / scale;
    canvas.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
    startX = e.clientX;
    startY = e.clientY;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  if (isDrawing) {
    saveHistory();
    isDrawing = false;
  }
});

// ===== Custom Color (+) Picker =====
const plusBoxes = document.querySelectorAll('.color-box.plus');

plusBoxes.forEach(plusBox => {
  plusBox.addEventListener('click', () => {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.display = 'none';
    document.body.appendChild(colorInput);
    colorInput.click();
    colorInput.addEventListener('input', () => {
      plusBox.style.background = colorInput.value;
      plusBox.classList.remove('plus');
      plusBox.classList.add('selected');
      colorBoxes.forEach(c => c.classList.remove('selected'));
      plusBox.classList.add('selected');
      currentColor = colorInput.value;
      document.body.removeChild(colorInput);
    });
  });
});

// ===== Eyedropper Tool =====
const eyedropper = document.querySelector('.color-box.eyedropper');
if (eyedropper && window.EyeDropper) {
  eyedropper.addEventListener('click', async () => {
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const hexColor = result.sRGBHex;

      const availableBox = [...colorBoxes].find(box => box.classList.contains('plus')) || colorBoxes[colorBoxes.length - 1];
      availableBox.style.background = hexColor;
      availableBox.classList.remove('plus');
      colorBoxes.forEach(c => c.classList.remove('selected'));
      availableBox.classList.add('selected');
      currentColor = hexColor;
    } catch (err) {
      console.warn('Eyedropper canceled or not supported.');
    }
  });
}

// ===== Drawing Feature (Brush, Pen, Eraser) =====
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

// ===== Undo / Redo Implementation =====
let history = [];
let redoStack = [];

function saveHistory() {
  history.push(overlayCanvas.toDataURL());
  if (history.length > 30) history.shift();
  redoStack = [];
}

const undoBtn = document.querySelector("img[src*='undo.png']");
const redoBtn = document.querySelector("img[src*='redo.png']");

if (undoBtn) {
  undoBtn.addEventListener('click', () => {
    if (history.length > 0) {
      const last = history.pop();
      redoStack.push(overlayCanvas.toDataURL());
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = last;
    }
  });
}

if (redoBtn) {
  redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
      const next = redoStack.pop();
      history.push(overlayCanvas.toDataURL());
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = next;
    }
  });
}

// ===== Save Drawing to Image (Download) =====
const downloadBtn = document.querySelector("img[src*='download.png']");
if (downloadBtn) {
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'illustration.png';
    link.href = overlayCanvas.toDataURL();
    link.click();
  });
}

// ===== Upload Image to Canvas =====
const uploadBtn = document.querySelector("img[src*='upload.png']");
if (uploadBtn) {
  uploadBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.click();
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          ctx.drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      document.body.removeChild(fileInput);
    });
  });
}

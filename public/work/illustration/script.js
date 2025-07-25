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
toolButtons.forEach(tool => {
  tool.addEventListener('click', () => {
    toolButtons.forEach(t => t.classList.remove('selected'));
    tool.classList.add('selected');
  });
});

// ===== Color Selection =====
const colorBoxes = document.querySelectorAll('.color-box');
colorBoxes.forEach(color => {
  color.addEventListener('click', () => {
    if (!color.classList.contains('plus') && !color.classList.contains('eyedropper')) {
      colorBoxes.forEach(c => c.classList.remove('selected'));
      color.classList.add('selected');
    }
  });
});

// ===== Next Step Button =====
document.querySelector('.next-step').addEventListener('click', () => {
  alert('Proceeding to the next step... (Add actual navigation logic here)');
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

// ===== Canvas Scroll + Zoom Support (wheel + drag + touch) =====
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
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
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
      document.body.removeChild(colorInput);
    });
  });
});

// ===== Eyedropper Tool (basic color pick from canvas) =====
const eyedropper = document.querySelector('.color-box.eyedropper');
if (eyedropper && window.EyeDropper) {
  eyedropper.addEventListener('click', async () => {
    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const hexColor = result.sRGBHex;

      // 塗り替える新しいカラーBOXを探す or 再利用
      const availableBox = [...colorBoxes].find(box => box.classList.contains('plus')) || colorBoxes[colorBoxes.length - 1];
      availableBox.style.background = hexColor;
      availableBox.classList.remove('plus');
      colorBoxes.forEach(c => c.classList.remove('selected'));
      availableBox.classList.add('selected');

    } catch (err) {
      console.warn('Eyedropper canceled or not supported.');
    }
  });
}

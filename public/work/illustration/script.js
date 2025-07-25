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
    mannequinImg.src = pose.src; // Optional: apply selected pose image directly
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

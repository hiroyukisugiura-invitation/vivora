// マネキン切替処理（woman/man/kids）
const mannequin = document.getElementById("mannequin");
let currentPose = 1;
let currentGender = "woman";

const updateMannequin = () => {
  const poseSuffix = ["_left", "", "_right"][currentPose];
  mannequin.src = `../../mannequin/mannequin_${currentGender}${poseSuffix}.png`;
};

document.getElementById("womanBtn").addEventListener("click", () => {
  currentGender = "woman";
  currentPose = 1;
  updateMannequin();
});

document.getElementById("manBtn").addEventListener("click", () => {
  currentGender = "man";
  currentPose = 1;
  updateMannequin();
});

document.getElementById("kidsBtn").addEventListener("click", () => {
  currentGender = "kids";
  currentPose = 1;
  updateMannequin();
});

document.getElementById("leftBtn").addEventListener("click", () => {
  if (currentPose > 0) {
    currentPose--;
    updateMannequin();
  }
});

document.getElementById("rightBtn").addEventListener("click", () => {
  if (currentPose < 2) {
    currentPose++;
    updateMannequin();
  }
});

document.querySelector(".next-step").addEventListener("click", () => {
  alert("Next Step clicked (仮機能)");
});

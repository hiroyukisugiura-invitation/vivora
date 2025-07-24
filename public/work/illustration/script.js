// 🟥 マネキン切替（性別タイプ）
const mannequin = document.getElementById("mannequin");

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

// 🟥 マネキン左右遷移（pose: 0 = left, 1 = center, 2 = right）
let currentPose = 1;
let currentGender = "woman";

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

function updateMannequin() {
  const poses = ["_left", "", "_right"];
  const poseSuffix = poses[currentPose];
  const src = `../../mannequin/mannequin_${currentGender}${poseSuffix}.png`;
  mannequin.src = src;
}

// 🟥 Next Step ボタンのクリックアクション（仮）
document.querySelector(".next-step").addEventListener("click", () => {
  alert("Next step に進みます（仮動作）");
});

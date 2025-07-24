
// マネキン切替処理
const mannequin = document.getElementById("mannequin");

const womanBtn = document.getElementById("womanBtn");
const manBtn = document.getElementById("manBtn");
const kidsBtn = document.getElementById("kidsBtn");

womanBtn.addEventListener("click", () => {
  mannequin.src = "../../mannequin/mannequin_woman.png";
});

manBtn.addEventListener("click", () => {
  mannequin.src = "../../mannequin/mannequin_man.png";
});

kidsBtn.addEventListener("click", () => {
  mannequin.src = "../../mannequin/mannequin_kids.png";
});

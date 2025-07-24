// =====================
// Mannequin Switching
// =====================
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

// =====================
// Stationery Hover Effect (Optional Future Interaction)
// =====================
// const stationeryIcons = document.querySelectorAll(".stationery-icons img");
// stationeryIcons.forEach(icon => {
//   icon.addEventListener("click", () => {
//     alert("Tool selected: " + icon.alt);
//   });
// });

// =====================
// Color Swatch Click (Optional Future Interaction)
// =====================
// const colorSwatches = document.querySelectorAll(".color-swatches img");
// colorSwatches.forEach(swatch => {
//   swatch.addEventListener("click", () => {
//     document.body.style.borderColor = swatch.alt;
//   });
// });

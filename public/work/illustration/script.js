function changeMannequin(type) {
  const mannequin = document.getElementById("mainMannequin");
  const basePath = "../../../mannequin/";

  if (type === "woman") {
    mannequin.src = basePath + "mannequin_woman.png";
  } else if (type === "man") {
    mannequin.src = basePath + "mannequin_man.png";
  } else if (type === "kids") {
    mannequin.src = basePath + "mannequin_kids.png";
  }
}

function changeMannequin(type) {
  const mannequin = document.getElementById("mainMannequin");
  const basePath = "../../../mannequin/";

  if (type === "woman") {
    mannequin.src = basePath + "mannequin_woman.png";
    mannequin.style.height = "580px";
  } else if (type === "man") {
    mannequin.src = basePath + "mannequin_man.png";
    mannequin.style.height = "630px"; // 約109%
  } else if (type === "kids") {
    mannequin.src = basePath + "mannequin_kids.png";
    mannequin.style.height = "360px"; // 約62.5%
  }
}

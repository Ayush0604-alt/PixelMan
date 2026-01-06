/* ================== AUTH GUARD ================== */
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login to access the editor");
  window.location.href = "index.html";
}

/* ================== VERIFY TOKEN ================== */
fetch("http://localhost:5000/api/auth/me", {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => {
    if (!res.ok) throw new Error("Invalid token");
    return res.json();
  })
  .catch(() => {
    localStorage.clear();
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
  });

/* ================== LOGOUT ================== */
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

/* ================== CANVAS SETUP ================== */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const uploadInput = document.getElementById("uploadInput");

/* ================== CONTROLS ================== */
const brightness = document.getElementById("brightness");
const contrast = document.getElementById("contrast");
const saturation = document.getElementById("saturation");
const blur = document.getElementById("blur");

const grayscaleBtn = document.getElementById("grayscaleBtn");
const sepiaBtn = document.getElementById("sepiaBtn");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");

const rotateBtn = document.getElementById("rotateBtn");
const flipBtn = document.getElementById("flipBtn");
const savePrefBtn = document.getElementById("savePreferences");

/* ================== IMAGE STATE ================== */
let image = new Image();
let isGrayscale = false;
let isSepia = false;
let rotation = 0;
let flipX = 1;
let flipY = 1;

/* ================== LOAD USER PREFERENCES ================== */
fetch("http://localhost:5000/api/preferences", {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(pref => {
    if (pref && pref.defaults) {
      brightness.value = pref.defaults.brightness ?? 100;
      contrast.value = pref.defaults.contrast ?? 100;
      saturation.value = pref.defaults.saturation ?? 100;
      blur.value = pref.defaults.blur ?? 0;
    }
  })
  .catch(() => {
    console.log("No preferences found");
  });

/* ================== IMAGE UPLOAD ================== */
uploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => (image.src = reader.result);
  reader.readAsDataURL(file);
});

/* ================== IMAGE LOAD ================== */
image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  applyFilters(); // ✅ APPLY ONLY AFTER IMAGE LOAD
};

/* ================== APPLY FILTERS ================== */
function applyFilters() {
  if (!image.src) return;

  const b = brightness.value;
  const c = contrast.value;
  const s = saturation.value;
  const bl = blur.value;

  let filterString = `
    brightness(${b}%)
    contrast(${c}%)
    saturate(${s}%)
    blur(${bl}px)
  `;

  if (isGrayscale) filterString += " grayscale(100%)";
  if (isSepia) filterString += " sepia(100%)";

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.filter = filterString;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipX, flipY);

  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2,
    image.width,
    image.height
  );

  ctx.restore();
}

/* ================== SLIDER EVENTS ================== */
[brightness, contrast, saturation, blur].forEach(slider => {
  slider.addEventListener("input", applyFilters);
});

/* ================== EFFECT BUTTONS ================== */
grayscaleBtn.addEventListener("click", () => {
  isGrayscale = !isGrayscale;
  isSepia = false;
  applyFilters();
});

sepiaBtn.addEventListener("click", () => {
  isSepia = !isSepia;
  isGrayscale = false;
  applyFilters();
});

/* ================== ROTATE ================== */
rotateBtn.addEventListener("click", () => {
  rotation = (rotation + 90) % 360;
  applyFilters();
});

/* ================== FLIP ================== */
flipBtn.addEventListener("click", () => {
  flipX = flipX === 1 ? -1 : 1;
  applyFilters();
});

/* ================== RESET ================== */
resetBtn.addEventListener("click", () => {
  brightness.value = 100;
  contrast.value = 100;
  saturation.value = 100;
  blur.value = 0;

  isGrayscale = false;
  isSepia = false;
  rotation = 0;
  flipX = 1;
  flipY = 1;

  applyFilters();
});

/* ================== DOWNLOAD ================== */
downloadBtn.addEventListener("click", () => {
  if (!image.src) return;

  const link = document.createElement("a");
  link.download = "pixelman-edited.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

/* ================== SAVE PREFERENCES ================== */
savePrefBtn.addEventListener("click", async () => {
  const defaults = {
    brightness: brightness.value,
    contrast: contrast.value,
    saturation: saturation.value,
    blur: blur.value
  };

  try {
    const res = await fetch("http://localhost:5000/api/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ defaults })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to save preferences");
      return;
    }

    alert("Preferences saved successfully ✅");

  } catch {
    alert("Server error while saving preferences");
  }
});

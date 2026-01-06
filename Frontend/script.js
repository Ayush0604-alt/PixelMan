const API_BASE = "https://pixelman-backend.onrender.com";

/* ================== AUTH GUARD ================== */
const token = localStorage.getItem("token");

if (!token) {
  alert("Please login to access the editor");
  window.location.href = "index.html";
}

/* ================== VERIFY TOKEN ================== */
fetch(`${API_BASE}/api/auth/me`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => {
    if (!res.ok) throw new Error();
  })
  .catch(() => {
    localStorage.clear();
    alert("Session expired. Please login again.");
    window.location.href = "index.html";
  });

/* ================== LOGOUT ================== */
document.getElementById("logoutBtn").addEventListener("click", () => {
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

/* ================== LOAD PREFERENCES ================== */
fetch(`${API_BASE}/api/preferences`, {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(pref => {
    if (pref?.defaults) {
      brightness.value = pref.defaults.brightness ?? 100;
      contrast.value = pref.defaults.contrast ?? 100;
      saturation.value = pref.defaults.saturation ?? 100;
      blur.value = pref.defaults.blur ?? 0;
    }
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
  applyFilters();
};

/* ================== APPLY FILTERS ================== */
function applyFilters() {
  if (!image.src) return;

  let filter = `
    brightness(${brightness.value}%)
    contrast(${contrast.value}%)
    saturate(${saturation.value}%)
    blur(${blur.value}px)
  `;

  if (isGrayscale) filter += " grayscale(100%)";
  if (isSepia) filter += " sepia(100%)";

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = filter;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipX, flipY);

  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}

/* ================== EVENTS ================== */
[brightness, contrast, saturation, blur].forEach(s =>
  s.addEventListener("input", applyFilters)
);

grayscaleBtn.onclick = () => { isGrayscale = !isGrayscale; isSepia = false; applyFilters(); };
sepiaBtn.onclick = () => { isSepia = !isSepia; isGrayscale = false; applyFilters(); };

rotateBtn.onclick = () => { rotation = (rotation + 90) % 360; applyFilters(); };
flipBtn.onclick = () => { flipX *= -1; applyFilters(); };

resetBtn.onclick = () => {
  brightness.value = contrast.value = saturation.value = 100;
  blur.value = 0;
  isGrayscale = isSepia = false;
  rotation = 0;
  flipX = flipY = 1;
  applyFilters();
};

downloadBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = "pixelman-edited.png";
  link.href = canvas.toDataURL();
  link.click();
};

/* ================== SAVE PREFERENCES ================== */
savePrefBtn.onclick = async () => {
  const defaults = {
    brightness: brightness.value,
    contrast: contrast.value,
    saturation: saturation.value,
    blur: blur.value
  };

  const res = await fetch(`${API_BASE}/api/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ defaults })
  });

  if (res.ok) alert("Preferences saved ✅");
};

const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
const toolButtons = Array.from(document.querySelectorAll("[data-tool]"));
const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const distanceValue = document.getElementById("distanceValue");
const annotationStatus = document.getElementById("annotationStatus");
const uploadMode = document.getElementById("uploadMode");
const viewportTitle = document.getElementById("viewportTitle");
const swapLabelBtn = document.getElementById("swapLabelBtn");
const predictBtn = document.getElementById("predictBtn");
const saveBtn = document.getElementById("saveBtn");
const launchCameraBtn = document.getElementById("launchCameraBtn");
const openCameraAgainBtn = document.getElementById("openCameraAgainBtn");
const backToHomeBtn = document.getElementById("backToHomeBtn");
const predictFlowBtn = document.getElementById("predictFlowBtn");
const selectedFileLabel = document.getElementById("selectedFileLabel");
const resultValue = document.getElementById("resultValue");
const screenMark = document.getElementById("demo");
const homeSection = document.getElementById("home");
const docsSection = document.getElementById("docs");

let currentTool = "box";
let currentLabelPlacement = "above";
let currentDistance = 42.0;
let selectedFile = null;
let selectedFileName = "No image selected yet";

function setActiveNav(hash) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === hash);
  });
}

function scrollToSection(section) {
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateLabelPlacement() {
  currentLabelPlacement = currentLabelPlacement === "above" ? "side" : "above";
  swapLabelBtn.textContent = `Label: ${currentLabelPlacement === "above" ? "Above" : "Side"}`;
}

function setTool(tool) {
  currentTool = tool;
  toolButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tool === tool);
  });
  viewportTitle.textContent = tool === "polygon" ? "Polygon mark mode" : tool === "circle" ? "Circle mark mode" : "Box mark mode";
  annotationStatus.textContent = `Tool active: ${tool}`;
}

function simulatePrediction() {
  const baseDistance = currentTool === "polygon" ? 61.8 : currentTool === "circle" ? 48.4 : 42.0;
  currentDistance = baseDistance;
  distanceValue.textContent = `${baseDistance.toFixed(1)} cm`;
  resultValue.textContent = `Distance: ${baseDistance.toFixed(1)} cm`;
  annotationStatus.textContent = `Prediction ready for ${currentLabelPlacement} label`;
}

function setPreview(file) {
  if (!file) {
    return;
  }

  selectedFile = file;
  selectedFileName = file.name;
  previewImage.src = URL.createObjectURL(file);
  previewImage.hidden = false;
  cameraPlaceholder.hidden = true;
  selectedFileLabel && (selectedFileLabel.textContent = file.name);
  uploadMode.textContent = file.webkitRelativePath ? "Local file" : "Camera / File";
  annotationStatus.textContent = `Loaded ${file.name}`;
  viewportTitle.textContent = "Frame loaded";
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const hash = link.dataset.nav;
    setActiveNav(hash);
  });
});

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.replace("#", "") || "home";
  setActiveNav(hash);
});

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0] ?? null;
  setPreview(file);
  scrollToSection(screenMark);
});

toolButtons.forEach((button) => {
  button.addEventListener("click", () => setTool(button.dataset.tool));
});

launchCameraBtn.addEventListener("click", () => imageInput.click());
openCameraAgainBtn.addEventListener("click", () => imageInput.click());
backToHomeBtn.addEventListener("click", () => scrollToSection(homeSection));

swapLabelBtn.addEventListener("click", updateLabelPlacement);
predictBtn.addEventListener("click", simulatePrediction);
predictFlowBtn?.addEventListener("click", simulatePrediction);
saveBtn.addEventListener("click", () => {
  annotationStatus.textContent = `Saved ${selectedFileName} as ${currentTool} annotation`;
});

const primaryCta = document.querySelector("#home .cta.primary");
primaryCta?.addEventListener("click", () => imageInput.click());

const tryDemoLink = document.querySelector("#home .cta.secondary");
tryDemoLink?.addEventListener("click", (event) => {
  event.preventDefault();
  scrollToSection(screenMark);
});

const docsButton = document.querySelector(".cta-footer .cta.secondary");
docsButton?.addEventListener("click", (event) => {
  event.preventDefault();
  scrollToSection(docsSection);
});

setActiveNav((window.location.hash.replace("#", "") || "home"));
setTool("box");
swapLabelBtn.textContent = "Label: Above";

const saveAnnotationBtn = document.getElementById('saveAnnotationBtn');
const ingestDatasetBtn = document.getElementById('ingestDatasetBtn');
const predictDistanceBtn = document.getElementById('predictDistanceBtn');
const predictAreaBtn = document.getElementById('predictAreaBtn');
const resultText = document.getElementById('resultText');
const gatewayUrlInput = document.getElementById('gatewayUrl');
const apiKeyInput = document.getElementById('apiKeyInput');
const authTokenInput = document.getElementById('authTokenInput');
const requestIdInput = document.getElementById('requestIdInput');
const regenRequestIdBtn = document.getElementById('regenRequestIdBtn');
const targetObjectInput = document.getElementById('targetObjectInput');
const trueDistanceInput = document.getElementById('trueDistanceInput');
const sourceInput = document.getElementById('sourceInput');
const datasetNameInput = document.getElementById('datasetNameInput');
const datasetVersionInput = document.getElementById('datasetVersionInput');
const datasetRecordsInput = document.getElementById('datasetRecordsInput');
const datasetNotesInput = document.getElementById('datasetNotesInput');
const imageInput = document.getElementById('imageInput');
const previewImage = document.getElementById('previewImage');
const previewMeta = document.getElementById('previewMeta');
const previewCard = document.getElementById('previewCard');
const themeToggle = document.getElementById('themeToggle');
const toastHost = document.getElementById('toastHost');
const refreshStatusBtn = document.getElementById('refreshStatusBtn');
const serviceStatusList = document.getElementById('serviceStatusList');
const overallStatus = document.getElementById('overallStatus');
const annotationCanvas = document.getElementById('annotationCanvas');
const toolBoxBtn = document.getElementById('toolBoxBtn');
const toolCircleBtn = document.getElementById('toolCircleBtn');
const toolPolygonBtn = document.getElementById('toolPolygonBtn');
const finalizePolygonBtn = document.getElementById('finalizePolygonBtn');
const clearAnnotationBtn = document.getElementById('clearAnnotationBtn');
const annotationMeta = document.getElementById('annotationMeta');
const labelMeta = document.getElementById('labelMeta');
const requestMeta = document.getElementById('requestMeta');
const splashScreen = document.getElementById('splashScreen');
const splashProgress = document.getElementById('splashProgress');
const splashPercent = document.getElementById('splashPercent');

const THEME_KEY = 'dc-theme';
const HEALTH_REFRESH_INTERVAL_MS = 20000;
let healthRefreshTimerId = null;
const canvasContext = annotationCanvas ? annotationCanvas.getContext('2d') : null;

let imageBitmap = null;
let selectedTool = 'box';
let isDrawing = false;
let dragStart = null;
let draftShape = null;
let selectedBox = null;
let selectedPolygon = [];
let draftPolygon = [];
let predictedLabelPosition = null;
let splashProgressValue = 0;

function generateRequestId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  const randomPart = Math.random().toString(16).slice(2, 10);
  return `req-${Date.now()}-${randomPart}`;
}

function ensureRequestId() {
  const existing = requestIdInput.value.trim();
  if (existing) {
    return existing;
  }

  const generated = generateRequestId();
  requestIdInput.value = generated;
  return generated;
}

function setRequestMeta(requestId, context) {
  requestMeta.textContent = `Request ID (${context}): ${requestId}`;
}

function normalizedSource() {
  const value = sourceInput.value.trim().toLowerCase();
  if (value === 'kaggle') {
    return 'kaggle';
  }
  return 'mobile-camera';
}

function normalizedMeasurementMode() {
  return document.body.dataset.measurementMode === 'area' ? 'area' : 'distance';
}

function targetObjectLabel() {
  const value = targetObjectInput.value.trim();
  return value || 'object';
}

function buildAuthHeaders(requestId, includeJson = true) {
  const headers = {
    'x-api-key': apiKeyInput.value.trim(),
    'x-request-id': requestId,
    Authorization: `Bearer ${authTokenInput.value.trim()}`
  };

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

function currentImageUri() {
  return imageInput.files && imageInput.files.length ? imageInput.files[0].name : 'images/demo.jpg';
}

function showToast(message, variant = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  toastHost.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 2800);
}

function runSplashSequence() {
  const duration = 750;
  const interval = 25;
  const step = 100 / (duration / interval);

  const splashTimer = window.setInterval(() => {
    splashProgressValue = Math.min(100, splashProgressValue + step);
    splashProgress.style.width = `${splashProgressValue}%`;
    splashPercent.textContent = `${Math.round(splashProgressValue)}%`;

    if (splashProgressValue >= 100) {
      window.clearInterval(splashTimer);
      splashScreen.classList.add('is-hidden');
      window.setTimeout(() => {
        splashScreen.style.display = 'none';
      }, 220);
    }
  }, interval);
}

function renderServiceChip(name, status) {
  const chip = document.createElement('span');
  const state = status === 'ok' ? 'ok' : status === 'down' ? 'down' : 'unknown';
  chip.className = `status-chip status-${state}`;
  chip.textContent = `${name}: ${state}`;
  return chip;
}

async function refreshSystemHealth(showErrorToast = true) {
  const baseUrl = gatewayUrlInput.value.trim().replace(/\/$/, '');
  const requestId = ensureRequestId();
  setRequestMeta(requestId, 'system-health');
  overallStatus.textContent = 'Gateway: checking...';

  try {
    const response = await fetch(`${baseUrl}/api/v1/system/health`, {
      headers: {
        'x-request-id': requestId
      }
    });
    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const payload = await response.json();
    overallStatus.textContent = `Gateway: ${payload.status}`;

    serviceStatusList.innerHTML = '';
    const services = payload.services || {};
    Object.entries(services).forEach(([name, detail]) => {
      const status = typeof detail === 'object' && detail ? detail.status : 'unknown';
      serviceStatusList.appendChild(renderServiceChip(name, status));
    });
  } catch (error) {
    overallStatus.textContent = 'Gateway: unavailable';
    serviceStatusList.innerHTML = '';
    serviceStatusList.appendChild(renderServiceChip('annotation_service', 'unknown'));
    serviceStatusList.appendChild(renderServiceChip('inference_orchestrator', 'unknown'));
    serviceStatusList.appendChild(renderServiceChip('dataset_service', 'unknown'));
    if (showErrorToast) {
      showToast('Unable to refresh service status.', 'error');
    }
  }
}

function stopAutoHealthRefresh() {
  if (healthRefreshTimerId !== null) {
    window.clearInterval(healthRefreshTimerId);
    healthRefreshTimerId = null;
  }
}

function startAutoHealthRefresh() {
  stopAutoHealthRefresh();
  if (document.hidden) {
    return;
  }
  healthRefreshTimerId = window.setInterval(() => {
    refreshSystemHealth(false);
  }, HEALTH_REFRESH_INTERVAL_MS);
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const isNight = theme === 'night';
  themeToggle.textContent = isNight ? 'Day Mode' : 'Night Mode';
  themeToggle.setAttribute('aria-pressed', String(isNight));
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved === 'night' ? 'night' : 'day');
}

themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'night' ? 'day' : 'night';
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
});

if (regenRequestIdBtn) {
  regenRequestIdBtn.addEventListener('click', () => {
    const nextId = generateRequestId();
    requestIdInput.value = nextId;
    setRequestMeta(nextId, 'manual');
    showToast('New request ID generated.', 'info');
  });
}

if (refreshStatusBtn) {
  refreshStatusBtn.addEventListener('click', async () => {
    await refreshSystemHealth(true);
    showToast('Service status refreshed.', 'info');
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoHealthRefresh();
    return;
  }

  refreshSystemHealth(false);
  startAutoHealthRefresh();
});

function updatePreview(file) {
  if (!file) {
    imageBitmap = null;
    selectedBox = null;
    selectedPolygon = [];
    draftPolygon = [];
    predictedLabelPosition = null;
    annotationMeta.textContent = 'No annotation yet.';
    labelMeta.textContent = 'Label position: not available';
    previewImage.hidden = true;
    previewImage.removeAttribute('src');
    previewMeta.textContent = 'No image selected yet.';
    previewCard.classList.remove('has-image');
    drawCanvas();
    return;
  }

  const imageUrl = URL.createObjectURL(file);
  previewImage.src = imageUrl;
  previewImage.hidden = false;
  previewMeta.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  previewCard.classList.add('has-image');

  const tempImage = new Image();
  tempImage.onload = () => {
    imageBitmap = tempImage;
    drawCanvas();
  };
  tempImage.src = imageUrl;
}

if (imageInput) {
  imageInput.addEventListener('change', () => {
    const file = imageInput.files && imageInput.files.length ? imageInput.files[0] : null;
    updatePreview(file);
  });
}

if (requestIdInput) {
  requestIdInput.value = generateRequestId();
}
if (requestMeta) {
  setRequestMeta(requestIdInput?.value || generateRequestId(), 'ready');
}
if (document.body.dataset.measurementMode !== undefined) {
  setMeasurementMode('distance');
}
if (typeof refreshSystemHealth === 'function' && overallStatus) {
  refreshSystemHealth(false);
}
if (typeof startAutoHealthRefresh === 'function' && overallStatus) {
  startAutoHealthRefresh();
}

function setResult(message, state = 'neutral') {
  resultText.textContent = message;
  resultText.dataset.state = state;
}

function resultPrefix(mode) {
  switch (mode) {
    case 'area':
      return 'Area';
    default:
      return 'Distance';
  }
}

function setMeasurementMode(mode) {
  const nextMode = mode === 'area' ? 'area' : 'distance';
  document.body.dataset.measurementMode = nextMode;
  predictDistanceBtn.classList.toggle('is-active', nextMode === 'distance');
  predictAreaBtn.classList.toggle('is-active', nextMode === 'area');
}

async function runPrediction(mode) {
  setMeasurementMode(mode);

  predictDistanceBtn.disabled = true;
  predictAreaBtn.disabled = true;
  setResult('Calling API...', 'loading');

  const annotation = annotationPayload();
  if (!annotation) {
    setResult('Please create an annotation first.', 'error');
    showToast('Create a shape before prediction.', 'error');
    predictDistanceBtn.disabled = false;
    predictAreaBtn.disabled = false;
    return;
  }

  const payload = {
    image_uri: currentImageUri(),
    analysis_mode: normalizedMeasurementMode(),
    target_object_type: targetObjectLabel(),
    ...annotation
  };

  const baseUrl = gatewayUrlInput.value.trim().replace(/\/$/, '');
  const requestId = ensureRequestId();
  setRequestMeta(requestId, `predict-${mode}`);

  try {
    const response = await fetch(`${baseUrl}/api/v1/predict-distance`, {
      method: 'POST',
      headers: buildAuthHeaders(requestId),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setResult(`Request failed with status ${response.status}`, 'error');
      showToast(`Prediction failed (${response.status}).`, 'error');
      return;
    }

    const data = await response.json();
    const measurementValue = typeof data.area_cm2 === 'number'
      ? `${Math.round(data.area_cm2)} cm²`
      : `${data.distance_cm} cm`;
    setResult(`${resultPrefix(mode)}: ${measurementValue} (confidence: ${data.confidence})`, 'success');
    if (data.label_position && typeof data.label_position === 'object') {
      predictedLabelPosition = {
        x: Number(data.label_position.x) || 0,
        y: Number(data.label_position.y) || 0
      };
      labelMeta.textContent = `Label position: x ${Math.round(predictedLabelPosition.x)}, y ${Math.round(predictedLabelPosition.y)}`;
      drawCanvas();
    }
    showToast(`${resultPrefix(mode)} prediction completed.`, 'success');
  } catch (error) {
    setResult('API call failed. Check gateway/service status.', 'error');
    showToast('API call failed.', 'error');
  } finally {
    predictDistanceBtn.disabled = false;
    predictAreaBtn.disabled = false;
  }
}

function setTool(tool) {
  selectedTool = tool;
  toolBoxBtn.classList.toggle('is-active', tool === 'box');
  toolCircleBtn.classList.toggle('is-active', tool === 'circle');
  toolPolygonBtn.classList.toggle('is-active', tool === 'polygon');
  draftShape = null;
  isDrawing = false;
  drawCanvas();
}

function getCanvasPoint(event) {
  const rect = annotationCanvas.getBoundingClientRect();
  const scaleX = annotationCanvas.width / rect.width;
  const scaleY = annotationCanvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

function normalizeBox(start, current) {
  const x = Math.min(start.x, current.x);
  const y = Math.min(start.y, current.y);
  const width = Math.max(1, Math.abs(start.x - current.x));
  const height = Math.max(1, Math.abs(start.y - current.y));
  return { x, y, width, height };
}

function circleToBox(center, edge) {
  const dx = edge.x - center.x;
  const dy = edge.y - center.y;
  const radius = Math.max(2, Math.sqrt(dx * dx + dy * dy));
  return {
    x: center.x - radius,
    y: center.y - radius,
    width: radius * 2,
    height: radius * 2
  };
}

function drawTriangle(points, strokeStyle, fillStyle) {
  if (!canvasContext || !points || points.length === 0) {
    return;
  }

  canvasContext.beginPath();
  canvasContext.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    canvasContext.lineTo(points[i].x, points[i].y);
  }

  if (points.length > 2) {
    canvasContext.closePath();
  }

  canvasContext.strokeStyle = strokeStyle;
  canvasContext.lineWidth = 2;
  canvasContext.stroke();
  if (points.length > 2) {
    canvasContext.fillStyle = fillStyle;
    canvasContext.fill();
  }
}

function drawLabelIndicator() {
  if (!canvasContext || !predictedLabelPosition) {
    return;
  }

  canvasContext.fillStyle = '#f15b2a';
  canvasContext.beginPath();
  canvasContext.arc(predictedLabelPosition.x, predictedLabelPosition.y, 5, 0, Math.PI * 2);
  canvasContext.fill();
}

function drawCanvas() {
  if (!canvasContext || !annotationCanvas) {
    return;
  }
  const rect = annotationCanvas.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    annotationCanvas.width = Math.round(rect.width);
    annotationCanvas.height = Math.round(rect.height);
  }

  canvasContext.clearRect(0, 0, annotationCanvas.width, annotationCanvas.height);

  if (imageBitmap) {
    canvasContext.drawImage(imageBitmap, 0, 0, annotationCanvas.width, annotationCanvas.height);
  } else {
    canvasContext.fillStyle = 'rgba(19, 38, 53, 0.08)';
    canvasContext.fillRect(0, 0, annotationCanvas.width, annotationCanvas.height);
  }

  if (selectedBox) {
    canvasContext.strokeStyle = '#007f78';
    canvasContext.lineWidth = 2;
    canvasContext.strokeRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);
    canvasContext.fillStyle = 'rgba(0, 127, 120, 0.14)';
    canvasContext.fillRect(selectedBox.x, selectedBox.y, selectedBox.width, selectedBox.height);
  }

  if (selectedPolygon.length) {
    drawTriangle(selectedPolygon, '#e87f2e', 'rgba(232, 127, 46, 0.16)');
  }

  if (draftPolygon.length) {
    drawTriangle(draftPolygon, '#f15b2a', 'rgba(241, 91, 42, 0.1)');
  }

  if (draftShape) {
    if (selectedTool === 'circle') {
      const radius = draftShape.width / 2;
      canvasContext.beginPath();
      canvasContext.arc(draftShape.x + radius, draftShape.y + radius, radius, 0, Math.PI * 2);
      canvasContext.strokeStyle = '#f15b2a';
      canvasContext.lineWidth = 2;
      canvasContext.stroke();
    } else {
      canvasContext.strokeStyle = '#f15b2a';
      canvasContext.lineWidth = 2;
      canvasContext.strokeRect(draftShape.x, draftShape.y, draftShape.width, draftShape.height);
    }
  }

  drawLabelIndicator();
}

function annotationPayload() {
  if (selectedTool === 'polygon') {
    if (selectedPolygon.length < 3) {
      return null;
    }

    return {
      mark_type: 'polygon',
      polygon: selectedPolygon.map((point) => ({ x: point.x, y: point.y }))
    };
  }

  if (!selectedBox) {
    return null;
  }

  return {
    mark_type: selectedTool,
    box: {
      x: selectedBox.x,
      y: selectedBox.y,
      width: selectedBox.width,
      height: selectedBox.height
    }
  };
}

function onPointerDown(event) {
  event.preventDefault();
  predictedLabelPosition = null;
  labelMeta.textContent = 'Label position: not available';
  const point = getCanvasPoint(event);

  if (selectedTool === 'polygon') {
    draftPolygon.push(point);
    annotationMeta.textContent = `Polygon points: ${draftPolygon.length}`;
    drawCanvas();
    return;
  }

  isDrawing = true;
  dragStart = point;
  draftShape = { x: point.x, y: point.y, width: 1, height: 1 };
  drawCanvas();
}

function onPointerMove(event) {
  if (!isDrawing || !dragStart || selectedTool === 'polygon') {
    return;
  }

  event.preventDefault();
  const point = getCanvasPoint(event);
  draftShape = selectedTool === 'circle' ? circleToBox(dragStart, point) : normalizeBox(dragStart, point);
  drawCanvas();
}

function onPointerUp(event) {
  if (selectedTool === 'polygon') {
    return;
  }
  if (!isDrawing || !dragStart) {
    return;
  }

  event.preventDefault();
  const point = getCanvasPoint(event);
  const toolForAnnotation = selectedTool;
  selectedBox = selectedTool === 'circle' ? circleToBox(dragStart, point) : normalizeBox(dragStart, point);
  selectedPolygon = [];
  draftPolygon = [];
  draftShape = null;
  dragStart = null;
  isDrawing = false;
  annotationMeta.textContent = `${toolForAnnotation} ready: x ${Math.round(selectedBox.x)}, y ${Math.round(selectedBox.y)}, w ${Math.round(selectedBox.width)}, h ${Math.round(selectedBox.height)}`;
  drawCanvas();
}

if (toolBoxBtn) toolBoxBtn.addEventListener('click', () => setTool('box'));
if (toolCircleBtn) toolCircleBtn.addEventListener('click', () => setTool('circle'));
if (toolPolygonBtn) toolPolygonBtn.addEventListener('click', () => setTool('polygon'));

if (finalizePolygonBtn) {
  finalizePolygonBtn.addEventListener('click', () => {
    if (draftPolygon.length < 3) {
      showToast('Polygon needs at least 3 points.', 'error');
      return;
    }

    selectedPolygon = [...draftPolygon];
    selectedBox = null;
    annotationMeta.textContent = `Polygon ready: ${selectedPolygon.length} points`;
    drawCanvas();
  });
}

if (clearAnnotationBtn) {
  clearAnnotationBtn.addEventListener('click', () => {
    selectedBox = null;
    selectedPolygon = [];
    draftPolygon = [];
    draftShape = null;
    predictedLabelPosition = null;
    annotationMeta.textContent = 'No annotation yet.';
    labelMeta.textContent = 'Label position: not available';
    drawCanvas();
  });
}

if (annotationCanvas) {
  annotationCanvas.addEventListener('pointerdown', onPointerDown);
  annotationCanvas.addEventListener('pointermove', onPointerMove);
  annotationCanvas.addEventListener('pointerup', onPointerUp);
}

window.addEventListener('resize', drawCanvas);

drawCanvas();

if (predictDistanceBtn) {
  predictDistanceBtn.addEventListener('click', async () => {
    await runPrediction('distance');
  });
}

if (predictAreaBtn) {
  predictAreaBtn.addEventListener('click', async () => {
    await runPrediction('area');
  });
}

if (saveAnnotationBtn) {
  saveAnnotationBtn.addEventListener('click', async () => {
    saveAnnotationBtn.disabled = true;

    const annotation = annotationPayload();
    if (!annotation) {
      setResult('Please create an annotation first.', 'error');
      showToast('Create a shape before saving annotation.', 'error');
      saveAnnotationBtn.disabled = false;
      return;
    }

    const trueDistance = Number(trueDistanceInput.value);
    if (!Number.isFinite(trueDistance) || trueDistance <= 0) {
      setResult('True distance must be greater than 0.', 'error');
      showToast('Enter a valid true distance value.', 'error');
      saveAnnotationBtn.disabled = false;
      return;
    }

    const requestId = ensureRequestId();
    setRequestMeta(requestId, 'annotations');
    const source = normalizedSource();

    const payload = {
      image_id: `img-${Date.now()}`,
      image_uri: currentImageUri(),
      true_distance_cm: trueDistance,
      source,
      analysis_mode: normalizedMeasurementMode(),
      target_object_type: targetObjectLabel(),
      ...annotation
    };

    const baseUrl = gatewayUrlInput.value.trim().replace(/\/$/, '');

    try {
      const response = await fetch(`${baseUrl}/api/v1/annotations`, {
        method: 'POST',
        headers: buildAuthHeaders(requestId),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        setResult(`Annotation save failed with status ${response.status}`, 'error');
        showToast(`Annotation save failed (${response.status}).`, 'error');
        return;
      }

      const data = await response.json();
      const annotationId = data.annotation_id || data.id || 'saved';
      setResult(`Annotation saved (${annotationId})`, 'success');
      showToast('Annotation saved.', 'success');
    } catch (error) {
      setResult('Annotation API call failed.', 'error');
      showToast('Annotation API call failed.', 'error');
    } finally {
      saveAnnotationBtn.disabled = false;
    }
  });
}

if (ingestDatasetBtn) {
  ingestDatasetBtn.addEventListener('click', async () => {
    ingestDatasetBtn.disabled = true;

    const records = Number(datasetRecordsInput.value);
    if (!Number.isInteger(records) || records <= 0) {
      setResult('Dataset records must be a positive integer.', 'error');
      showToast('Enter a valid records count.', 'error');
      ingestDatasetBtn.disabled = false;
    return;
  }

  const datasetName = datasetNameInput.value.trim();
  const version = datasetVersionInput.value.trim();
  if (!datasetName || !version) {
    setResult('Dataset name and version are required.', 'error');
    showToast('Dataset name/version required.', 'error');
    ingestDatasetBtn.disabled = false;
    return;
  }

  const requestId = ensureRequestId();
  setRequestMeta(requestId, 'dataset-ingest');

  const payload = {
    source: normalizedSource(),
    dataset_name: datasetName,
    version,
    records,
    analysis_mode: normalizedMeasurementMode(),
    target_object_type: targetObjectLabel(),
    notes: datasetNotesInput.value.trim()
  };

  const baseUrl = gatewayUrlInput.value.trim().replace(/\/$/, '');

  try {
    const response = await fetch(`${baseUrl}/api/v1/dataset/ingest`, {
      method: 'POST',
      headers: buildAuthHeaders(requestId),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setResult(`Dataset ingest failed with status ${response.status}`, 'error');
      showToast(`Dataset ingest failed (${response.status}).`, 'error');
      return;
    }

    const data = await response.json();
    setResult(`Dataset ingest accepted: job ${data.job_id || 'n/a'}`, 'success');
    showToast('Dataset ingest submitted.', 'success');
  } catch (error) {
    setResult('Dataset ingest API call failed.', 'error');
    showToast('Dataset ingest API call failed.', 'error');
  } finally {
    ingestDatasetBtn.disabled = false;
  }
  });
}

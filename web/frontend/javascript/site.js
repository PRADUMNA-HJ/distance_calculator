const DEFAULT_SESSION = {
  gatewayUrl: 'http://localhost:8000',
  apiKey: 'dev-gateway-key',
  bearerToken: 'demo-token',
};

const STORAGE_KEY = 'dc-session';
const THEME_KEY = 'dc-theme';
const body = document.body;

function $(id) {
  return document.getElementById(id);
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SESSION };
    }
    return { ...DEFAULT_SESSION, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SESSION };
  }
}

function writeSession(partial) {
  const current = readSession();
  const next = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function requestId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function normalizeGatewayUrl(value) {
  return value.trim().replace(/\/$/, '');
}

function showToast(message, variant = 'info') {
  const host = $('toastHost');
  if (!host) {
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.textContent = message;
  host.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2600);
}

function setTheme(theme) {
  body.dataset.theme = theme === 'night' ? 'night' : 'day';
  const themeToggle = $('themeToggle');
  if (themeToggle) {
    themeToggle.textContent = body.dataset.theme === 'night' ? 'Day Mode' : 'Night Mode';
    themeToggle.setAttribute('aria-pressed', body.dataset.theme === 'night' ? 'true' : 'false');
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  setTheme(saved === 'night' ? 'night' : 'day');

  const themeToggle = $('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = body.dataset.theme === 'night' ? 'day' : 'night';
      localStorage.setItem(THEME_KEY, nextTheme);
      setTheme(nextTheme);
    });
  }
}

function initNav() {
  const route = body.dataset.route || '';
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-route') === route);
  });
}

function buildHeaders(session, requestIdValue, includeJson = true) {
  const headers = {
    'x-api-key': session.apiKey || DEFAULT_SESSION.apiKey,
    'x-request-id': requestIdValue,
    Authorization: `Bearer ${session.bearerToken || DEFAULT_SESSION.bearerToken}`,
  };

  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const detail = payload && typeof payload.detail === 'string' ? payload.detail : `Request failed with status ${response.status}`;
    throw new Error(detail);
  }

  return payload;
}

function currentSessionChip() {
  const session = readSession();
  const chip = $('sessionChip');
  if (chip) {
    chip.textContent = session.bearerToken ? `Signed in as ${session.bearerToken}` : 'Not signed in';
  }
}

async function refreshDashboardHealth() {
  const statusText = $('dashboardStatusText');
  const statusList = $('dashboardStatusList');
  const session = readSession();
  const gatewayUrl = normalizeGatewayUrl(session.gatewayUrl || DEFAULT_SESSION.gatewayUrl);

  if (statusText) {
    statusText.textContent = 'Checking gateway and services...';
  }

  try {
    const payload = await fetchJson(`${gatewayUrl}/api/v1/system/health`, {
      headers: {
        'x-request-id': requestId(),
      },
    });

    if (statusText) {
      statusText.textContent = `Gateway: ${payload.status}`;
    }

    if (statusList) {
      statusList.innerHTML = '';
      Object.entries(payload.services || {}).forEach(([name, detail]) => {
        const state = detail && typeof detail === 'object' ? detail.status : 'unknown';
        const chip = document.createElement('span');
        chip.className = `status-chip status-${state === 'ok' ? 'ok' : state === 'down' ? 'down' : 'unknown'}`;
        chip.textContent = `${name}: ${state}`;
        statusList.appendChild(chip);
      });
    }
  } catch (error) {
    if (statusText) {
      statusText.textContent = 'Gateway unavailable';
    }
    if (statusList) {
      statusList.innerHTML = '<span class="status-chip status-down">gateway: down</span>';
    }
    showToast('Unable to refresh backend status.', 'error');
  }
}

function initDashboard() {
  const session = readSession();
  const sessionUrl = $('dashboardGateway');
  const sessionAuth = $('dashboardAuth');
  const sessionToken = $('dashboardToken');

  if (sessionUrl) {
    sessionUrl.textContent = session.gatewayUrl || DEFAULT_SESSION.gatewayUrl;
  }
  if (sessionAuth) {
    sessionAuth.textContent = session.bearerToken ? 'Token available' : 'No token saved';
  }
  if (sessionToken) {
    sessionToken.textContent = session.bearerToken || 'demo-token';
  }

  const refreshBtn = $('refreshDashboardBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshDashboardHealth);
  }

  currentSessionChip();
  refreshDashboardHealth();

  // Show splash screen on first dashboard visit
  runDashboardSplash();
}

function runDashboardSplash() {
  const SPLASH_SHOWN_KEY = 'dc-splash-shown';
  const splashShown = localStorage.getItem(SPLASH_SHOWN_KEY);
  
  if (!splashShown) {
    const splashScreen = $('splashScreen');
    const splashProgress = $('splashProgress');
    const splashPercent = $('splashPercent');
    
    if (splashScreen && splashProgress && splashPercent) {
      // Mark splash as shown
      localStorage.setItem(SPLASH_SHOWN_KEY, 'true');
      
      // Run splash animation
      const duration = 750;
      const interval = 25;
      let progressValue = 0;
      const step = 100 / (duration / interval);
      
      const splashTimer = window.setInterval(() => {
        progressValue = Math.min(100, progressValue + step);
        splashProgress.style.width = `${progressValue}%`;
        splashPercent.textContent = `${Math.round(progressValue)}%`;
        
        if (progressValue >= 100) {
          window.clearInterval(splashTimer);
          splashScreen.classList.add('is-hidden');
          window.setTimeout(() => {
            splashScreen.style.display = 'none';
          }, 220);
        }
      }, interval);
    }
  }
}

function initLogin() {
  const form = $('loginForm');
  const gatewayInput = $('loginGatewayUrl');
  const apiKeyInput = $('loginApiKey');
  const usernameInput = $('loginUsername');
  const passwordInput = $('loginPassword');
  const resultText = $('loginResult');
  const sessionChip = $('sessionChip');

  const session = readSession();
  if (gatewayInput) {
    gatewayInput.value = session.gatewayUrl || DEFAULT_SESSION.gatewayUrl;
  }
  if (apiKeyInput) {
    apiKeyInput.value = session.apiKey || DEFAULT_SESSION.apiKey;
  }

  if (sessionChip) {
    sessionChip.textContent = session.bearerToken ? 'Token already stored' : 'No token stored';
  }

  if (!form) {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (resultText) {
      resultText.textContent = 'Signing in...';
    }

    try {
      const gatewayUrl = normalizeGatewayUrl(gatewayInput?.value || DEFAULT_SESSION.gatewayUrl);
      const payload = {
        username: usernameInput?.value?.trim() || '',
        password: passwordInput?.value || '',
      };
      const response = await fetchJson(`${gatewayUrl}/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const nextSession = writeSession({
        gatewayUrl,
        apiKey: apiKeyInput?.value?.trim() || DEFAULT_SESSION.apiKey,
        bearerToken: response.access_token || DEFAULT_SESSION.bearerToken,
      });

      if (resultText) {
        resultText.textContent = 'Login successful. Redirecting to dashboard...';
      }
      if (sessionChip) {
        sessionChip.textContent = `Signed in as ${nextSession.bearerToken}`;
      }
      showToast('Login successful.', 'success');
      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    } catch (error) {
      if (resultText) {
        resultText.textContent = error instanceof Error ? error.message : 'Login failed.';
      }
      showToast('Login failed.', 'error');
    }
  });
}

function imagePreviewFromFile(fileInput, previewImage, previewMeta) {
  const file = fileInput?.files && fileInput.files.length ? fileInput.files[0] : null;
  if (!file) {
    if (previewImage) {
      previewImage.hidden = true;
      previewImage.removeAttribute('src');
    }
    if (previewMeta) {
      previewMeta.textContent = 'No image selected yet.';
    }
    return null;
  }

  const url = URL.createObjectURL(file);
  if (previewImage) {
    previewImage.src = url;
    previewImage.hidden = false;
  }
  if (previewMeta) {
    previewMeta.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  }
  return file;
}

function measurementResultText(mode, payload) {
  if (mode === 'area') {
    if (typeof payload.area_cm2 === 'number') {
      return `Area workflow returned ${Math.round(payload.area_cm2)} cm².`;
    }
    if (typeof payload.distance_cm === 'number') {
      return `Area workflow sent. Backend returned distance fallback ${payload.distance_cm} cm.`;
    }
  }

  if (typeof payload.distance_cm === 'number') {
    return `Distance: ${payload.distance_cm} cm.`;
  }

  return 'Prediction completed.';
}

function initMeasurement() {
  const mode = body.dataset.mode === 'area' ? 'area' : 'distance';
  const title = $('measurementTitle');
  const modeBadge = $('measurementModeBadge');
  const resultText = $('measurementResult');
  const requestMeta = $('measurementRequestMeta');
  const gatewayInput = $('gatewayUrl');
  const apiKeyInput = $('apiKeyInput');
  const authTokenInput = $('authTokenInput');
  const requestIdInput = $('requestIdInput');
  const regenBtn = $('regenRequestIdBtn');
  const imageInput = $('imageInput');
  const previewImage = $('previewImage');
  const previewMeta = $('previewMeta');
  const imageUriInput = $('imageUriInput');
  const targetObjectInput = $('targetObjectInput');
  const trueDistanceInput = $('trueDistanceInput');
  const sourceInput = $('sourceInput');
  const markTypeInput = $('markTypeInput');
  const boxXInput = $('boxXInput');
  const boxYInput = $('boxYInput');
  const boxWidthInput = $('boxWidthInput');
  const boxHeightInput = $('boxHeightInput');
  const polygonJsonInput = $('polygonJsonInput');
  const datasetNameInput = $('datasetNameInput');
  const datasetVersionInput = $('datasetVersionInput');
  const datasetRecordsInput = $('datasetRecordsInput');
  const datasetNotesInput = $('datasetNotesInput');
  const predictBtn = $('predictBtn');
  const saveAnnotationBtn = $('saveAnnotationBtn');
  const ingestDatasetBtn = $('ingestDatasetBtn');
  const session = readSession();

  if (gatewayInput) gatewayInput.value = session.gatewayUrl || DEFAULT_SESSION.gatewayUrl;
  if (apiKeyInput) apiKeyInput.value = session.apiKey || DEFAULT_SESSION.apiKey;
  if (authTokenInput) authTokenInput.value = session.bearerToken || DEFAULT_SESSION.bearerToken;
  if (requestIdInput) requestIdInput.value = requestId();
  if (imageUriInput) imageUriInput.value = mode === 'area' ? 'images/area-demo.jpg' : 'images/distance-demo.jpg';
  if (datasetNameInput) datasetNameInput.value = mode === 'area' ? 'area-training-batch' : 'distance-training-batch';
  if (datasetNotesInput) datasetNotesInput.value = `Manual ${mode} capture`;
  if (modeBadge) modeBadge.textContent = mode === 'area' ? 'Area' : 'Distance';
  if (title) title.textContent = mode === 'area' ? 'Area measurement workspace' : 'Distance measurement workspace';
  if (predictBtn) predictBtn.textContent = mode === 'area' ? 'Predict Area' : 'Predict Distance';
  if (resultText) resultText.textContent = 'No prediction yet.';

  const updateRequestLabel = (context) => {
    if (requestMeta && requestIdInput) {
      requestMeta.textContent = `Request ID (${context}): ${requestIdInput.value.trim() || 'auto'}`;
    }
  };

  const syncPreview = () => {
    imagePreviewFromFile(imageInput, previewImage, previewMeta);
    if (imageUriInput && imageInput?.files && imageInput.files.length) {
      imageUriInput.value = imageInput.files[0].name;
    }
  };

  if (imageInput) {
    imageInput.addEventListener('change', syncPreview);
  }

  if (regenBtn && requestIdInput) {
    regenBtn.addEventListener('click', () => {
      requestIdInput.value = requestId();
      updateRequestLabel('manual');
      showToast('Request ID regenerated.', 'info');
    });
  }

  const buildAnnotation = () => {
    const markType = markTypeInput?.value || 'box';
    const box = {
      x: Number(boxXInput?.value || 0),
      y: Number(boxYInput?.value || 0),
      width: Number(boxWidthInput?.value || 240),
      height: Number(boxHeightInput?.value || 180),
    };

    return {
      image_id: `img-${Date.now()}`,
      image_uri: imageUriInput?.value.trim() || 'images/demo.jpg',
      mark_type: markType,
      analysis_mode: mode,
      target_object_type: targetObjectInput?.value.trim() || 'object',
      box: markType === 'box' ? box : undefined,
      polygon: markType === 'polygon'
        ? (() => {
            try {
              const value = polygonJsonInput?.value?.trim() || '';
              if (value) {
                return JSON.parse(value);
              }
            } catch {
              // fall through to default polygon
            }
            return [
              { x: 100, y: 80 },
              { x: 360, y: 90 },
              { x: 340, y: 250 },
              { x: 120, y: 240 },
            ];
          })()
        : undefined,
    };
  };

  const runPrediction = async () => {
    if (predictBtn) predictBtn.disabled = true;
    if (resultText) resultText.textContent = 'Calling API...';

    try {
      const gatewayUrl = normalizeGatewayUrl(gatewayInput?.value || DEFAULT_SESSION.gatewayUrl);
      const requestIdValue = requestIdInput?.value.trim() || requestId();
      if (requestIdInput && !requestIdInput.value.trim()) {
        requestIdInput.value = requestIdValue;
      }
      updateRequestLabel('predict');

      const annotation = buildAnnotation();
      const useUpload = imageInput?.files && imageInput.files.length > 0;
      let payload;
      if (useUpload && imageInput.files) {
        const formData = new FormData();
        formData.append('annotation_json', JSON.stringify(annotation));
        formData.append('image_file', imageInput.files[0]);
        payload = formData;
      } else {
        payload = JSON.stringify(annotation);
      }

      const response = await fetchJson(
        `${gatewayUrl}${useUpload ? '/api/v1/predict-distance/upload' : '/api/v1/predict-distance'}`,
        {
          method: 'POST',
          headers: useUpload ? buildHeaders(session, requestIdValue, false) : buildHeaders(session, requestIdValue, true),
          body: payload,
        }
      );

      if (resultText) {
        resultText.textContent = measurementResultText(mode, response);
      }
      showToast(`${mode === 'area' ? 'Area' : 'Distance'} prediction completed.`, 'success');
    } catch (error) {
      if (resultText) {
        resultText.textContent = error instanceof Error ? error.message : 'Prediction failed.';
      }
      showToast('Prediction failed.', 'error');
    } finally {
      if (predictBtn) predictBtn.disabled = false;
    }
  };

  const runSave = async () => {
    if (saveAnnotationBtn) saveAnnotationBtn.disabled = true;
    try {
      const gatewayUrl = normalizeGatewayUrl(gatewayInput?.value || DEFAULT_SESSION.gatewayUrl);
      const requestIdValue = requestIdInput?.value.trim() || requestId();
      const payload = {
        ...buildAnnotation(),
        true_distance_cm: Number(trueDistanceInput?.value || 1),
        source: sourceInput?.value?.trim() || 'mobile-camera',
      };
      const response = await fetchJson(`${gatewayUrl}/api/v1/annotations`, {
        method: 'POST',
        headers: buildHeaders(session, requestIdValue, true),
        body: JSON.stringify(payload),
      });
      if (resultText) {
        resultText.textContent = `Annotation saved: ${response.annotation_id || response.image_id || 'ok'}`;
      }
      showToast('Annotation saved.', 'success');
    } catch (error) {
      if (resultText) {
        resultText.textContent = error instanceof Error ? error.message : 'Save failed.';
      }
      showToast('Save annotation failed.', 'error');
    } finally {
      if (saveAnnotationBtn) saveAnnotationBtn.disabled = false;
    }
  };

  const runIngest = async () => {
    if (ingestDatasetBtn) ingestDatasetBtn.disabled = true;
    try {
      const gatewayUrl = normalizeGatewayUrl(gatewayInput?.value || DEFAULT_SESSION.gatewayUrl);
      const requestIdValue = requestIdInput?.value.trim() || requestId();
      const payload = {
        source: sourceInput?.value?.trim() || 'mobile-camera',
        analysis_mode: mode,
        target_object_type: targetObjectInput?.value.trim() || 'object',
        dataset_name: datasetNameInput?.value.trim() || `${mode}-training-batch`,
        version: datasetVersionInput?.value.trim() || 'v1',
        records: Number(datasetRecordsInput?.value || 1),
        notes: datasetNotesInput?.value?.trim() || '',
      };
      const response = await fetchJson(`${gatewayUrl}/api/v1/dataset/ingest`, {
        method: 'POST',
        headers: buildHeaders(session, requestIdValue, true),
        body: JSON.stringify(payload),
      });
      if (resultText) {
        resultText.textContent = `Dataset ingest accepted: ${response.job_id || 'queued'}`;
      }
      showToast('Dataset ingest submitted.', 'success');
    } catch (error) {
      if (resultText) {
        resultText.textContent = error instanceof Error ? error.message : 'Ingest failed.';
      }
      showToast('Dataset ingest failed.', 'error');
    } finally {
      if (ingestDatasetBtn) ingestDatasetBtn.disabled = false;
    }
  };

  if (predictBtn) predictBtn.addEventListener('click', runPrediction);
  if (saveAnnotationBtn) saveAnnotationBtn.addEventListener('click', runSave);
  if (ingestDatasetBtn) ingestDatasetBtn.addEventListener('click', runIngest);

  syncPreview();
}

function initApp() {
  initTheme();
  initNav();
  initBackButton();
  currentSessionChip();

  if (body.dataset.page === 'dashboard') {
    initDashboard();
  } else if (body.dataset.page === 'login') {
    initLogin();
  } else if (body.dataset.page === 'measurement') {
    initMeasurement();
  }
}

function initBackButton() {
  const backBtn = $('backBtn');
  if (backBtn) {
    const canGoBack = window.history.length > 1;
    if (canGoBack) {
      backBtn.style.display = 'block';
    }

    backBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Also call immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  // DOM still loading, wait for DOMContentLoaded
} else {
  // DOM already loaded
  initApp();
}

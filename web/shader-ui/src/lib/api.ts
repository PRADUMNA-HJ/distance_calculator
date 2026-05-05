// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
export type SystemHealthResponse = {
  service: string;
  status: string;
  services: Record<string, { status: string; code: number | null }>;
};

export type PredictResponse = {
  distance_cm: number;
  confidence: number;
  model_version: string;
  label_position: { x: number; y: number };
};

export type BackendFormState = {
  gatewayUrl: string;
  apiKey: string;
  bearerToken: string;
};

export type AnnotationPayload = {
  image_id: string;
  image_uri: string;
  mark_type: string;
  true_distance_cm: number;
  source: string;
  box?: { x: number; y: number; width: number; height: number } | null;
  polygon?: Array<{ x: number; y: number }> | null;
};

export type DatasetIngestPayload = {
  source: string;
  dataset_name: string;
  version: string;
  records: number;
  notes?: string | null;
};

// ──────────────────────────────────────────────────────────────────────────────
// Internals
// ──────────────────────────────────────────────────────────────────────────────

/**
 * In dev, Vite proxies /api/* → localhost:8000, so gatewayUrl can be "".
 * In production, set VITE_API_BASE_URL to the real gateway origin.
 */
export const DEFAULT_GATEWAY_URL =
  import.meta.env.VITE_API_BASE_URL ?? "";

function normalizeGatewayUrl(gatewayUrl: string): string {
  return (gatewayUrl || DEFAULT_GATEWAY_URL).trim().replace(/\/$/, "");
}

function buildHeaders(apiKey: string, bearerToken: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey.trim(),
    Authorization: `Bearer ${bearerToken.trim()}`
  };
}


export async function fetchSystemHealth(gatewayUrl: string): Promise<SystemHealthResponse> {
  const response = await fetch(`${normalizeGatewayUrl(gatewayUrl)}/api/v1/system/health`);
  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }
  return response.json() as Promise<SystemHealthResponse>;
}

export async function predictDistance(
  form: BackendFormState,
  payload: Omit<AnnotationPayload, "true_distance_cm" | "source" | "image_id">,
  imageFile?: File | null
): Promise<PredictResponse> {
  const endpoint = imageFile ? "/api/v1/predict-distance/upload" : "/api/v1/predict-distance";
  const requestOptions: RequestInit = {
    method: "POST",
    headers: buildHeaders(form.apiKey, form.bearerToken),
    body: imageFile
      ? (() => {
          const formData = new FormData();
          formData.append("annotation_json", JSON.stringify(payload));
          formData.append("image_file", imageFile);
          return formData;
        })()
      : JSON.stringify(payload)
  };

  if (imageFile) {
    requestOptions.headers = {
      "x-api-key": form.apiKey.trim(),
      Authorization: `Bearer ${form.bearerToken.trim()}`
    };
  }

  const response = await fetch(`${normalizeGatewayUrl(form.gatewayUrl)}${endpoint}`, requestOptions);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Prediction request failed with status ${response.status}`);
  }

  return response.json() as Promise<PredictResponse>;
}

export async function saveAnnotation(form: BackendFormState, payload: AnnotationPayload): Promise<unknown> {
  const response = await fetch(`${normalizeGatewayUrl(form.gatewayUrl)}/api/v1/annotations`, {
    method: "POST",
    headers: buildHeaders(form.apiKey, form.bearerToken),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Annotation save failed with status ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

export async function ingestDataset(
  form: BackendFormState,
  payload: DatasetIngestPayload
): Promise<unknown> {
  const response = await fetch(`${normalizeGatewayUrl(form.gatewayUrl)}/api/v1/dataset/ingest`, {
    method: "POST",
    headers: buildHeaders(form.apiKey, form.bearerToken),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Dataset ingest failed with status ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

import { useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  DatabaseZap,
  Gauge,
  ImageUp,
  Layers3,
  Save,
  Upload
} from "lucide-react";

import {
  fetchSystemHealth,
  ingestDataset,
  predictDistance,
  saveAnnotation,
  type BackendFormState,
  type PredictResponse
} from "@/lib/api";
import { Button } from "@/components/ui/button";

const defaultForm: BackendFormState = {
  gatewayUrl: "http://localhost:8000",
  apiKey: "dev-gateway-key",
  bearerToken: "demo-token"
};

function BackendConsole() {
  const [form, setForm] = useState<BackendFormState>(defaultForm);
  const [imageUri, setImageUri] = useState("demo/image-001.jpg");
  const [imageId, setImageId] = useState("img-001");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("demo/image-001.jpg");
  const [imageSource, setImageSource] = useState("Demo asset");
  const [markType, setMarkType] = useState<"box" | "polygon">("box");
  const [labelPlacement, setLabelPlacement] = useState<"above" | "side">("above");
  const [trueDistanceCm, setTrueDistanceCm] = useState("42");
  const [statusMessage, setStatusMessage] = useState("Ready to call the gateway.");
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const annotationPayload = useMemo(
    () => ({
      image_id: imageId,
      image_uri: imageUri,
      mark_type: markType,
      true_distance_cm: Number(trueDistanceCm) || 42,
      source: "web-ui",
      box:
        markType === "box"
          ? { x: 120, y: 90, width: 240, height: 180 }
          : null,
      polygon:
        markType === "polygon"
          ? [
              { x: 115, y: 95 },
              { x: 340, y: 86 },
              { x: 345, y: 244 },
              { x: 140, y: 250 }
            ]
          : null
    }),
    [imageId, imageUri, markType, trueDistanceCm]
  );

  const setField = (key: keyof BackendFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectImage = (file: File | null) => {
    if (!file) {
      return;
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setImagePreviewUrl(previewUrl);
    setImageName(file.name);
    setImageUri(`uploads/${file.name}`);
    setImageSource(file.webkitRelativePath ? `Local file: ${file.webkitRelativePath}` : "Captured or uploaded image");
    setImageId(file.name.replace(/\.[^.]+$/, "") || "img-upload");
    setStatusMessage(`Loaded image: ${file.name}`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    selectImage(file);
    event.target.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const callAction = async (action: string, runner: () => Promise<unknown>) => {
    setLoadingAction(action);
    try {
      const result = await runner();
      setStatusMessage(`${action} succeeded.`);
      if (action === "Predict") {
        setPrediction(result as PredictResponse);
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : `${action} failed.`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="glass-card mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]" id="launch-app">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.95),rgba(8,10,16,1))] p-5 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Backend Control Panel</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Real gateway actions from the website</h3>
            </div>
            <Layers3 className="h-5 w-5 text-fuchsia-300" />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Gateway URL
              <input className="form-input" value={form.gatewayUrl} onChange={(event) => setField("gatewayUrl", event.target.value)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              API Key
              <input className="form-input" value={form.apiKey} onChange={(event) => setField("apiKey", event.target.value)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300 sm:col-span-2">
              Bearer Token
              <input className="form-input" value={form.bearerToken} onChange={(event) => setField("bearerToken", event.target.value)} />
            </label>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Image ID
              <input className="form-input" value={imageId} onChange={(event) => setImageId(event.target.value)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Image URI
              <input className="form-input" value={imageUri} onChange={(event) => setImageUri(event.target.value)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              True Distance (cm)
              <input className="form-input" value={trueDistanceCm} onChange={(event) => setTrueDistanceCm(event.target.value)} />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Label Placement
              <select className="form-input" value={labelPlacement} onChange={(event) => setLabelPlacement(event.target.value as "above" | "side")}>
                <option value="above">Above object</option>
                <option value="side">Side of object</option>
              </select>
            </label>
          </div>

          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/6 p-4">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Image Input</p>
                <h4 className="mt-1 text-lg font-semibold text-white">Upload or capture a real image</h4>
              </div>
              <ImageUp className="h-5 w-5 text-cyan-200" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={openFilePicker}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Button className="bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-slate-950" onClick={openFilePicker}>
                <Camera className="mr-2 h-4 w-4" />
                Open Camera
              </Button>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => selectImage(new File([""], "demo-camera-shot.jpg", { type: "image/jpeg" }))}
              >
                Use Demo Frame
              </Button>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/35">
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt="Selected image preview" className="h-52 w-full object-cover" />
                ) : (
                  <div className="grid h-52 place-items-center text-sm text-slate-400">No image selected yet</div>
                )}
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <span>Image name</span>
                  <span className="font-semibold text-white">{imageName}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <span>Backend URI</span>
                  <span className="max-w-[220px] truncate font-semibold text-white">{imageUri}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span>Source</span>
                  <span className="font-semibold text-white">{imageSource}</span>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-6 text-slate-400">
              The backend currently accepts image URIs, so the selected file is captured locally, previewed in the browser, and converted to a demo URI for gateway requests.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Button
              className="bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-slate-950"
              onClick={() => callAction("Health", () => fetchSystemHealth(form.gatewayUrl))}
            >
              <Activity className="mr-2 h-4 w-4" />
              Check Health
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => callAction("Predict", () => predictDistance(form, {
                image_uri: imageUri,
                mark_type: markType,
                box: markType === "box" ? { x: 120, y: 90, width: 240, height: 180 } : undefined,
                polygon:
                  markType === "polygon"
                    ? [
                        { x: 115, y: 95 },
                        { x: 340, y: 86 },
                        { x: 345, y: 244 },
                        { x: 140, y: 250 }
                      ]
                    : undefined
              }, selectedFile))}
            >
              <Gauge className="mr-2 h-4 w-4" />
              Predict Distance
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => callAction("Save annotation", () => saveAnnotation(form, annotationPayload))}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Annotation
            </Button>
            <Button
              variant="outline"
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
              onClick={() => callAction("Ingest dataset", () => ingestDataset(form, {
                source: "web-ui",
                dataset_name: "distance-demo",
                version: "v1",
                records: 1,
                notes: `label:${labelPlacement}`
              }))}
            >
              <DatabaseZap className="mr-2 h-4 w-4" />
              Ingest Dataset
            </Button>
          </div>

          <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-300/8 p-4">
            <p className="text-sm leading-7 text-slate-200">{statusMessage}</p>
          </div>
        </div>
      </div>

      <aside className="glass-card p-5">
        <div className="flex items-center gap-2 text-cyan-200">
          <CheckCircle2 className="h-4 w-4" />
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/80">Backend Response</p>
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-white">Payload preview and API return</h3>

        <div className="mt-5 rounded-[26px] border border-white/10 bg-white/6 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>Selected tool</span>
            <span>{markType}</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span>Mark type</span>
              <span className="font-semibold text-white">{markType}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span>Label position</span>
              <span className="font-semibold text-white">{labelPlacement}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span>Demo image</span>
              <span className="font-semibold text-white">{imageId}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span>Image source</span>
              <span className="font-semibold text-white">{imageSource}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <span>Upload mode</span>
              <span className="font-semibold text-white">{selectedFile ? "Multipart file" : "URI fallback"}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,18,28,0.92),rgba(3,7,14,1))] p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Latest prediction</span>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {loadingAction === "Predict" ? "Loading" : "Live"}
            </span>
          </div>
          <div className="mt-4 rounded-[22px] border border-white/10 bg-black/30 p-4">
            {prediction ? (
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between"><span>Distance</span><span className="font-semibold text-white">{prediction.distance_cm} cm</span></div>
                <div className="flex items-center justify-between"><span>Confidence</span><span className="font-semibold text-white">{prediction.confidence}</span></div>
                <div className="flex items-center justify-between"><span>Model</span><span className="font-semibold text-white">{prediction.model_version}</span></div>
                <div className="flex items-center justify-between"><span>Label x/y</span><span className="font-semibold text-white">{prediction.label_position.x}, {prediction.label_position.y}</span></div>
              </div>
            ) : (
              <p className="text-sm leading-7 text-slate-400">Run prediction to display the API response here.</p>
            )}
          </div>
        </div>

        <Button className="mt-5 w-full bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 text-slate-950">
          <ArrowRight className="mr-2 h-4 w-4" />
          Push to Gateway
        </Button>
      </aside>
    </section>
  );
}

export { BackendConsole };

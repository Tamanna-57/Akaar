import { Camera, type CameraDevice } from "react-native-vision-camera";
import type { CameraService, CapturedPhoto } from "./capture.ts";
import { type MediaPermission, PermissionStatus } from "./permissions.ts";
import type { ImageQualityMetrics } from "./quality.ts";

/**
 * {@link CameraService} over react-native-vision-camera - the RN equivalent
 * of CameraX, and the reason RN is viable for this app at all: it gives
 * frame processors, so the blur/exposure gate can run on the preview
 * rather than only after capture.
 *
 * `analyse` is left injectable because the metric extraction itself is
 * native work (an ML Kit / TFLite frame processor plugin). The decision
 * logic that consumes the metrics is pure and lives in ./quality.ts.
 */
export interface FrameAnalyser {
  (path: string): Promise<ImageQualityMetrics>;
}

export class VisionCameraService implements CameraService {
  // Plain fields, not TS parameter properties - see the note in
  // core-data/src/db/sqliteOutboxStore.ts.
  private readonly camera: () => Camera | null;
  private readonly analyser: FrameAnalyser;

  constructor(camera: () => Camera | null, analyser: FrameAnalyser) {
    this.camera = camera;
    this.analyser = analyser;
  }

  async capture(): Promise<CapturedPhoto> {
    const camera = this.camera();
    if (camera == null) throw new Error("Camera is not mounted");

    const photo = await camera.takePhoto({
      // The original must be untouched: no client-side enhancement, ever.
      // Every adjustment happens server-side, inside the segmentation mask,
      // so there is one provenance record rather than two.
      flash: "off",
      enableShutterSound: false,
    });

    const path = normalisePath(photo.path);
    return {
      path,
      width: photo.width,
      height: photo.height,
      sizeBytes: 0,
      capturedAt: Date.now(),
      source: "camera",
      metrics: await this.analyser(path),
    };
  }

  async pickFromLibrary(): Promise<CapturedPhoto[]> {
    // Wired to the Android Photo Picker in the app package: no storage
    // permission needed on API 33+, which is one fewer prompt to explain.
    throw new Error("pickFromLibrary is wired in apps/mobile with the photo picker module");
  }

  analyse(path: string): Promise<ImageQualityMetrics> {
    return this.analyser(path);
  }
}

function normalisePath(path: string): string {
  return path.startsWith("file://") ? path : `file://${path}`;
}

/** vision-camera's permission strings, mapped onto ours. */
export function toPermissionStatus(status: string): PermissionStatus {
  switch (status) {
    case "granted":
      return PermissionStatus.Granted;
    case "denied":
      return PermissionStatus.Denied;
    case "restricted":
      return PermissionStatus.Blocked;
    default:
      return PermissionStatus.NotDetermined;
  }
}

export async function requestPermission(permission: MediaPermission): Promise<PermissionStatus> {
  const result =
    permission === "camera"
      ? await Camera.requestCameraPermission()
      : await Camera.requestMicrophonePermission();
  return toPermissionStatus(result);
}

export type { CameraDevice };

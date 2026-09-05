import type { ImageQualityMetrics } from "./quality.ts";

/**
 * Photo capture, per docs/04-architecture/ai-architecture.md (Pipeline 2)
 * and android-architecture.md (Media).
 *
 * The invariant this file exists to protect: **the original is written to
 * app-private storage and uploaded before any enhancement request, and is
 * never deleted or overwritten.** It is what the buyer is shown beside the
 * enhanced image, and it is the strongest available answer to "did the AI
 * fake this?".
 */
export interface CapturedPhoto {
  /** Local app-private path. Not in the shared gallery. */
  path: string;
  width: number;
  height: number;
  /** Bytes, for deciding whether to hold the upload for wifi. */
  sizeBytes: number;
  capturedAt: number;
  source: "camera" | "picker";
  metrics?: ImageQualityMetrics;
}

export interface CameraService {
  /** Capture to app-private storage and return the original. */
  capture(): Promise<CapturedPhoto>;
  /** Android Photo Picker - no storage permission needed on API 33+. */
  pickFromLibrary(): Promise<CapturedPhoto[]>;
  /** Measure a file that is already on disk (a picked photo, or a retake). */
  analyse(path: string): Promise<ImageQualityMetrics>;
}

/**
 * The upload order the authenticity record depends on. Enhancement is a
 * *server* step that takes the uploaded original as its input, so a client
 * that uploads the enhanced version first, or instead, breaks provenance.
 */
export const MediaUploadOrder = ["original", "then-request-enhancement"] as const;

/**
 * Local retention, from offline-strategy.md: "Local drafts and their media
 * persist until published or deleted."
 *
 * So a local copy may only be reclaimed once the server demonstrably has
 * it AND the draft it belongs to has left the phone's hands. Deleting on
 * upload alone would lose her photo if publication later failed.
 */
export interface PhotoRetentionContext {
  uploadedToServer: boolean;
  productPublished: boolean;
  productDeleted: boolean;
}

export function canPurgeLocalPhoto(context: PhotoRetentionContext): boolean {
  if (context.productDeleted) return true;
  return context.uploadedToServer && context.productPublished;
}

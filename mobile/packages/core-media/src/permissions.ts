import { type UiState, UiState as UiStateOf } from "@akaar/core-common";

/**
 * Permission outcomes, mapped onto the `permissionDenied` UiState the
 * design system already renders (packages/design-system StateHost).
 *
 * The rationale strings are the point of this file. A permission prompt
 * that says "Akaar needs camera access" explains nothing to a first-time
 * smartphone user; one that says what she gets out of it does.
 */
export const PermissionStatus = {
  Granted: "granted",
  Denied: "denied",
  /** "Don't ask again" - only Settings can undo it. */
  Blocked: "blocked",
  NotDetermined: "not_determined",
} as const;
export type PermissionStatus = (typeof PermissionStatus)[keyof typeof PermissionStatus];

export const MediaPermission = {
  Camera: "camera",
  Microphone: "microphone",
} as const;
export type MediaPermission = (typeof MediaPermission)[keyof typeof MediaPermission];

const rationales: Record<MediaPermission, string> = {
  camera: "To photograph your product, Akaar needs to use the camera",
  microphone: "To let you describe your product by speaking, Akaar needs the microphone",
};

/**
 * Note there is no `Granted` case here: a granted permission is not a
 * screen state, it is the absence of one, and the caller renders content.
 */
export function permissionUiState<T>(
  permission: MediaPermission,
  status: Exclude<PermissionStatus, "granted">,
): UiState<T> {
  return UiStateOf.permissionDenied<T>(permission, rationales[permission], status === PermissionStatus.Blocked);
}

export function isUsable(status: PermissionStatus): boolean {
  return status === PermissionStatus.Granted;
}

/**
 * Whether asking again can possibly help. `blocked` means the OS will not
 * show a prompt, so the UI must send her to Settings instead of firing a
 * request that silently does nothing.
 */
export function canRequestAgain(status: PermissionStatus): boolean {
  return status === PermissionStatus.NotDetermined || status === PermissionStatus.Denied;
}

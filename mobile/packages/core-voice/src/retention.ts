/**
 * Local audio retention, from offline-strategy.md and ai-architecture.md:
 *
 *   "Local audio is purged after successful transcription and server
 *    acknowledgement, mirroring the server retention rule."
 *   "Transcripts persist, audio does not."
 *
 * Both conditions are required. Purging on transcription alone would
 * destroy the only copy of her words if the acknowledgement never arrived;
 * purging on acknowledgement alone would do it before there was a
 * transcript to keep.
 */
export interface AudioRetentionContext {
  transcribed: boolean;
  serverAcknowledged: boolean;
  /** She explicitly discarded the take - honour that immediately. */
  discardedByUser?: boolean;
}

export function canPurgeLocalAudio(context: AudioRetentionContext): boolean {
  if (context.discardedByUser === true) return true;
  return context.transcribed && context.serverAcknowledged;
}

/**
 * Consent, per ai-architecture.md: third-party inference is opt-in,
 * disclosed in her own language, and revocable. A revoked consent means
 * the audio stops being sent, not that a pending transcription silently
 * continues.
 */
export function mayUploadAudio(consentGiven: boolean): boolean {
  return consentGiven;
}

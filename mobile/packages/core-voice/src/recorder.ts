import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, OutputFormatAndroidType } from "react-native-audio-recorder-player";

/**
 * Recording + playback, the RN stand-in for `MediaRecorder`.
 *
 * AAC in an M4A container, matching the Kotlin spec. 22.05 kHz mono at a
 * modest bitrate is deliberate: this is speech destined for an ASR model
 * over a connection that drops, not music, and a 60-second note should cost
 * her a couple of hundred kilobytes rather than a couple of megabytes.
 */
export interface VoiceRecorder {
  start(path: string): Promise<string>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<{ path: string; durationMs: number }>;
  play(path: string, onProgress: (positionMs: number, durationMs: number) => void): Promise<void>;
  stopPlayback(): Promise<void>;
}

const androidAudioSettings = {
  AudioSourceAndroid: AudioSourceAndroidType.MIC,
  OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
  AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
  AudioSamplingRateAndroid: 22_050,
  AudioEncodingBitRateAndroid: 32_000,
  AudioChannelsAndroid: 1,
};

export class NativeVoiceRecorder implements VoiceRecorder {
  private readonly player = new AudioRecorderPlayer();
  private startedAt = 0;

  async start(path: string): Promise<string> {
    this.startedAt = Date.now();
    return this.player.startRecorder(path, androidAudioSettings);
  }

  async pause(): Promise<void> {
    await this.player.pauseRecorder();
  }

  async resume(): Promise<void> {
    await this.player.resumeRecorder();
  }

  async stop(): Promise<{ path: string; durationMs: number }> {
    const path = await this.player.stopRecorder();
    this.player.removeRecordBackListener();
    return { path, durationMs: Date.now() - this.startedAt };
  }

  async play(path: string, onProgress: (positionMs: number, durationMs: number) => void): Promise<void> {
    await this.player.startPlayer(path);
    this.player.addPlayBackListener((event) => {
      onProgress(event.currentPosition, event.duration);
    });
  }

  async stopPlayback(): Promise<void> {
    await this.player.stopPlayer();
    this.player.removePlayBackListener();
  }
}

/**
 * Audio Engine for Scribo AI
 * Handles:
 * 1. Millisecond audio timeline tracking and simulated audio waveform synthesis
 * 2. Word-synced audio recall (tap-to-audio)
 * 3. Socratic voice synthesis (speaking guiding questions)
 */

class AudioPlaybackEngine {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentMs: number = 0;
  private maxMs: number = 72000;
  private playbackRate: number = 1.0;
  private volume: number = 1.0;
  private isMuted: boolean = false;
  private loopRange: { startMs: number; endMs: number } | null = null;
  private animFrameId: number | null = null;
  private lastTickTime: number = 0;
  private onTimeUpdateCallback: ((ms: number) => void) | null = null;
  private onStateChangeCallback: ((playing: boolean) => void) | null = null;

  constructor() {
    // Lazy audio context on user interaction
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setCallbacks(onTimeUpdate: (ms: number) => void, onStateChange: (playing: boolean) => void) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onStateChangeCallback = onStateChange;
  }

  public setDuration(durationMs: number) {
    this.maxMs = durationMs;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : 0.015 * this.volume;
      this.gainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : 0.015 * this.volume;
      this.gainNode.gain.setValueAtTime(targetGain, this.audioCtx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setLoopRange(range: { startMs: number; endMs: number } | null) {
    this.loopRange = range;
  }

  public getLoopRange(): { startMs: number; endMs: number } | null {
    return this.loopRange;
  }

  public play() {
    if (this.isPlaying) return;
    this.initAudioContext();
    this.isPlaying = true;
    this.lastTickTime = performance.now();

    // Start subtle audio ambient tone pulse to represent lecture speaker
    this.startAmbientWaveform();

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(true);
    }

    this.tick();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopAmbientWaveform();

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(false);
    }
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(targetMs: number) {
    this.currentMs = Math.max(0, Math.min(targetMs, this.maxMs));
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentMs);
    }
  }

  public jumpRelative(deltaMs: number) {
    this.seek(this.currentMs + deltaMs);
  }

  public getCurrentMs(): number {
    return this.currentMs;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private tick = () => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const elapsed = now - this.lastTickTime;
    this.lastTickTime = now;

    this.currentMs += elapsed * this.playbackRate;

    // Check if within an active A-B loop segment
    if (this.loopRange && this.currentMs >= this.loopRange.endMs) {
      this.currentMs = this.loopRange.startMs;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentMs);
      }
      this.animFrameId = requestAnimationFrame(this.tick);
      return;
    }

    if (this.currentMs >= this.maxMs) {
      this.currentMs = this.maxMs;
      this.pause();
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.currentMs);
      }
      return;
    }

    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(this.currentMs);
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private startAmbientWaveform() {
    try {
      if (!this.audioCtx) return;
      this.stopAmbientWaveform();

      // Soft human voice harmonic frequency modulation
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      this.oscillator.type = 'triangle';
      this.oscillator.frequency.setValueAtTime(165, this.audioCtx.currentTime); // Human speech fundamental frequency range (~150-180Hz)

      // Keep it very soft and pleasant, adjusted by volume/mute
      const effectiveGain = this.isMuted ? 0 : 0.015 * this.volume;
      this.gainNode.gain.setValueAtTime(effectiveGain, this.audioCtx.currentTime);

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);
      this.oscillator.start();
    } catch {
      // AudioContext might be blocked until user gesture, safe ignore
    }
  }

  private stopAmbientWaveform() {
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    } catch {
      // ignore
    }
  }

  // Voice synthesis for Socratic Tutor
  public speakText(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols from spoken text
    const cleanText = text.replace(/[*_#$`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an expressive English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en'));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioPlaybackEngine();

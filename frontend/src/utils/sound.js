// Synthesizer sounds using Web Audio API
class SoundManager {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playBeep(frequency = 600, duration = 0.15, type = 'sine') {
    try {
      this.init();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback not permitted or not supported', e);
    }
  }

  // Rest timer completed chime
  playTimerDone() {
    try {
      this.playBeep(587.33, 0.15); // D5
      setTimeout(() => this.playBeep(880, 0.35), 180); // A5
    } catch (e) {
      // ignore
    }
  }

  // Workout completed victory fanfare
  playVictory() {
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 0.25, 'triangle'), idx * 140);
      });
    } catch (e) {
      // ignore
    }
  }
}

export const sound = new SoundManager();

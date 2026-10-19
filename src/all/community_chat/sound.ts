/**
 * Web Audio API Sound Synthesizer
 * 100% Free, zero audio downloads, zero network latency.
 * Synthesizes soft UI tones directly using native browser AudioContext oscillators.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public play(kind: 'chime' | 'success' | 'toggle' | 'droplet'): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (kind) {
      case 'chime': {
        // Dual-tone ascending chime (1046.5Hz -> 1568Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, now); // C6
        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.01);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1568.0, now + 0.08); // G6
        gain2.gain.setValueAtTime(0.001, now + 0.08);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.09);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.36);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.46);
        break;
      }

      case 'success': {
        // Harmonic triad ascending chord (C6 -> E6 -> G6)
        const notes = [1046.5, 1318.5, 1568.0];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + i * 0.045;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.001, noteStart);
          gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.3);
        });
        break;
      }

      case 'toggle': {
        // Crisp soft click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'droplet': {
        // Frequency glide downward (warning / cooldown / link hint)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.14);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
        break;
      }
    }
  }
}

export const chatSounds = new SoundSynthesizer();

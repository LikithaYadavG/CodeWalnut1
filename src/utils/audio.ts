// audio.ts
export class TimerAudio {
  private static instance: TimerAudio;
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  private constructor() {}

  static getInstance(): TimerAudio {
    if (!TimerAudio.instance) {
      TimerAudio.instance = new TimerAudio();
    }
    return TimerAudio.instance;
  }

  private async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  async play(): Promise<TimerAudio> {
    if (this.isPlaying) {
      return this;
    }

    try {
      await this.initializeAudioContext();

      if (!this.audioContext) {
        throw new Error("AudioContext not initialized");
      }

      this.isPlaying = true;

      // Create and configure oscillator
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.type = "sine";
      this.oscillator.frequency.setValueAtTime(
        880,
        this.audioContext.currentTime
      );

      // Configure gain for continuous sound
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(
        0.5,
        this.audioContext.currentTime + 0.01
      );

      // Connect nodes
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Start the oscillator without stopping
      this.oscillator.start(this.audioContext.currentTime);
    } catch (error) {
      console.error("Failed to play audio:", error);
    }

    return this;
  }

  stop(): void {
    if (!this.isPlaying) {
      return;
    }

    if (this.gainNode && this.audioContext) {
      // Fade out the sound
      this.gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + 0.1
      );
      setTimeout(() => this.cleanup(), 100);
    } else {
      this.cleanup();
    }
  }

  private cleanup(): void {
    this.isPlaying = false;

    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (error) {
        console.log(error);
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}

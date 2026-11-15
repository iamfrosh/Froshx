// A smooth original beat made live in the browser with the Web Audio API (no audio file, no copyright).
// ~96 BPM, A minor groove: warm keys, round bass, soft kick, clap and shaker.

export type Beat = { stop: () => void; setVolume: (v: number) => void };

const BPM = 96;
const STEP = 60 / BPM / 4; // one 16th note, in seconds
const CHORDS = [
  { root: 110.0, notes: [220.0, 261.63, 329.63, 392.0] },   // Am7
  { root: 87.31, notes: [174.61, 220.0, 261.63, 329.63] },  // Fmaj7
  { root: 130.81, notes: [261.63, 329.63, 392.0, 493.88] }, // Cmaj7
  { root: 98.0, notes: [196.0, 246.94, 293.66, 329.63] },   // G6
];
const BASS_STEPS: Record<number, number> = { 0: 1, 3: 1, 6: 2, 10: 1, 12: 1, 14: 1.5 }; // step -> octave multiplier
const KEY_STEPS = [0, 6, 10];
const KICK_STEPS = [0, 7, 10];
const CLAP_STEPS = [4, 12];

export function startBeat(ctx: AudioContext, volume: number): Beat {
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.005; comp.release.value = 0.2;
  master.connect(comp); comp.connect(ctx.destination);
  master.gain.setTargetAtTime(volume, ctx.currentTime, 0.4);

  // soft echo for the keys
  const echo = ctx.createDelay(1); echo.delayTime.value = STEP * 3;
  const fb = ctx.createGain(); fb.gain.value = 0.32;
  const echoLp = ctx.createBiquadFilter(); echoLp.type = "lowpass"; echoLp.frequency.value = 1800;
  const echoOut = ctx.createGain(); echoOut.gain.value = 0.28;
  echo.connect(echoLp); echoLp.connect(fb); fb.connect(echo); echoLp.connect(echoOut); echoOut.connect(master);

  // noise for hats / claps
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noise.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const tone = (type: OscillatorType, freq: number, t: number, dur: number, peak: number, dest: AudioNode, attack = 0.01) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  };

  const kick = (t: number) => {
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.12);
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.4);
  };

  const burst = (t: number, hp: number, dur: number, peak: number, bandpass = false) => {
    const s = ctx.createBufferSource(); s.buffer = noise;
    const f = ctx.createBiquadFilter(); f.type = bandpass ? "bandpass" : "highpass"; f.frequency.value = hp;
    const g = ctx.createGain();
    g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  };

  const clap = (t: number) => { [0, 0.012, 0.026].forEach((d) => burst(t + d, 1500, 0.12, 0.35, true)); };

  const keys = (chord: number[], t: number, len: number) => {
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1900; lp.Q.value = 0.7;
    const bus = ctx.createGain(); bus.gain.value = 0.55;
    lp.connect(bus); bus.connect(master); bus.connect(echo);
    chord.forEach((f, i) => {
      tone("triangle", f, t + i * 0.012, len, 0.11, lp, 0.02);
      tone("sine", f * 2, t + i * 0.012, len * 0.7, 0.03, lp, 0.02);
    });
  };

  let step = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    while (next < ctx.currentTime + 1.5) {
      const bar = Math.floor(step / 16) % 8;          // 8 bars loop, chord changes every 2 bars
      const chord = CHORDS[Math.floor(bar / 2)];
      const s = step % 16;
      if (KICK_STEPS.includes(s)) kick(next);
      if (CLAP_STEPS.includes(s)) clap(next);
      if (s % 2 === 0) burst(next, 7500, s % 4 === 2 ? 0.07 : 0.03, s % 4 === 2 ? 0.16 : 0.1);
      else burst(next, 9000, 0.02, 0.05);
      if (s === 14) burst(next, 6500, 0.18, 0.1);      // open hat
      if (BASS_STEPS[s]) {
        const f = chord.root * (BASS_STEPS[s] === 2 ? 2 : 1);
        tone("sine", f, next, STEP * (s === 6 ? 2 : 3), 0.55, master, 0.008);
        tone("triangle", f, next, STEP * 2, 0.12, master, 0.008);
      }
      if (KEY_STEPS.includes(s)) keys(chord.notes, next, STEP * (s === 10 ? 5 : 4));
      next += STEP;
      step++;
    }
  };
  tick();
  const timer = setInterval(tick, 250);

  return {
    stop: () => {
      clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => { try { master.disconnect(); echo.disconnect(); } catch {} }, 900);
    },
    setVolume: (v: number) => master.gain.setTargetAtTime(v, ctx.currentTime, 0.1),
  };
}

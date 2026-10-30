# (M6.20.12) Rhys's Severian, spoken: each Severian part read from its IPA (sev_ipa.py - his alphabet
# and pronunciation reference) straight into the voice, no Russian spelling rules in between; an English
# part (the announcer's second language) still from a Cyrillic spelling of accented English, as before.
# arg: JSON {key: [text_for_subtitle_and_id, voice, [[kind, words], ...]]} - kind 'sev' or 'acc'
# voices: sva - the announcer (Russian model, the tannoy and the chime); st3 - the kiosk (LibriTTS speaker 640)
import json, hashlib, subprocess, wave, os, sys
import numpy as np
from piper import PiperVoice, SynthesisConfig
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sev_ipa import sentence
TTS = os.environ.get('TTS', '/home/claude/tts')
D = os.path.dirname(os.path.abspath(__file__)) + '/'
ru = PiperVoice.load(TTS + '/slav/ru-irinia-medium.onnx', config_path=TTS + '/slav/ru-irinia-medium.onnx.json')
en = PiperVoice.load(TTS + '/en-us-libritts-high.onnx', config_path=TTS + '/en-us-libritts-high.onnx.json')
VOICE = {'sva': (ru, None, 1.05), 'st3': (en, 640, 1.0)}

def ids(m, ph):
    have = m.config.phoneme_id_map
    return m.phonemes_to_ids([p for p in ph if p in have])

def part(v, kind, words):
    m, sp, ls = VOICE[v]
    cfg = SynthesisConfig(speaker_id=sp, length_scale=ls, noise_scale=0.6, noise_w_scale=0.7)
    if kind == 'sev':
        # sentence by sentence, each a breath
        chunks = [c.strip() for c in sentence(words, syllabic_mark=(m is ru)).replace('?', '.').split('.') if c.strip()]
        phs = [list(c) for c in chunks]
    else:
        phs = ru.phonemize(words)
    out = []
    for ph in phs:
        a = m.phoneme_ids_to_audio(ids(m, ph), cfg)
        a = a / max(1e-6, np.max(np.abs(a)))
        out += [a, np.zeros(int(m.config.sample_rate * 0.22), dtype=np.float32)]
    return np.concatenate(out), m.config.sample_rate

def wav(path, a, sr):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(a, -1, 1) * 32000).astype('<i2').tobytes())

T = json.loads(sys.argv[1]); man = {}
os.makedirs(D + 'sev', exist_ok=True)
for key, (text, v, parts) in T.items():
    h = hashlib.sha1(text.encode()).hexdigest()[:8]; man[key] = [text, v, h]
    out = D + f'sev/spoken_{v}_{h}.mp3'
    segs = []; sr = None
    for i, (kind, words) in enumerate(parts):
        a, sr = part(v, kind, words); segs.append(a)
        if i < len(parts) - 1: segs.append(np.zeros(int(sr * 0.7), dtype=np.float32))
    wav(D + 'sev/tmp.wav', np.concatenate(segs), sr)
    af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=90,loudnorm=I=-17:TP=-2:LRA=7'
    if v == 'sva':
        chime = D + 'sev/chime.wav'
        fc = '[0:a]' + af + ',highpass=f=300,lowpass=f=3400,aecho=0.8:0.6:60|120:0.25|0.15[v];' + ('[1:a][v]concat=n=2:v=0:a=1' if os.path.exists(chime) else '[v]anull')
        inp = ['-i', D + 'sev/tmp.wav'] + (['-i', chime] if os.path.exists(chime) else [])
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', fc, '-ac', '1', '-ar', '22050', '-b:a', '56k', out], check=True)
    else:
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', D + 'sev/tmp.wav', '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '56k', out], check=True)
    print(key, v, h, flush=True)
json.dump(man, open(D + 'sev/manifest2.json', 'w'), indent=1, ensure_ascii=False)

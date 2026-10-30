# (M6.18.3) Severian-accented staff voices: English written out in Cyrillic as a Severian would say it,
# phonemized by the Russian rules; inspectors (sv1, sv2) and the kiosk (sv3) on the Kazakh multi-speaker
# model's two men (Russian phonemes mapped to its own), the announcer (sva) on the Russian woman.
# arg: JSON {key: [text_for_subtitle_and_id, accented_cyrillic, [voices]]}
import json, hashlib, subprocess, wave, os, sys
import numpy as np
from piper import PiperVoice, SynthesisConfig
D = os.path.dirname(os.path.abspath(__file__)) + '/'
kk = PiperVoice.load(D + 'slav/kk-issai-high.onnx', config_path=D + 'slav/kk-issai-high.onnx.json')
ru = PiperVoice.load(D + 'slav/ru-irinia-medium.onnx', config_path=D + 'slav/ru-irinia-medium.onnx.json')
KK_INV = set([' ', '!', ',', '.', ';', '?', 'a', 'b', 'd', 'e', 'f', 'h', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 's', 't', 'u', 'v', 'w', 'x', 'z', 'æ', 'ŋ', 'ɑ', 'ə', 'ɡ', 'ɪ', 'ɫ', 'ɵ', 'ɾ', 'ʀ', 'ʃ', 'ʊ', 'ʒ', 'ˈ'])
MAP = {'ʲ': '', 'i': 'ɪ', 'ɭ': 'l', 'r': 'ɾ', 'ʑ': 'z', 'ɛ': 'e', 'ʌ': 'a', 'ɐ': 'a', 'ɕ': 'ʃ', 'ɨ': 'ɪ', 'ɔ': 'o', 'ː': '', 'ˌ': '', 'y': 'u', 'c': 'k', 'ç': 'x', 'ɣ': 'ɡ', 'ʂ': 'ʃ', 'ʐ': 'ʒ'}
# voice: (model, speaker, length_scale, pitch factor)
SPK = {'sv1': ('kk', 1, 1.0, 1.0), 'sv2': ('kk', 0, 1.03, 1.0), 'sv3': ('kk', 1, 1.08, 0.93), 'sva': ('ru', None, 1.05, 1.0)}
def audio(v, cyr):
    model, sp, ls, _ = SPK[v]
    cfg = SynthesisConfig(speaker_id=sp, length_scale=ls, noise_scale=0.6, noise_w_scale=0.7)
    out = []
    for ph in ru.phonemize(cyr):
        if model == 'kk':
            ph = [MAP.get(p, p) for p in ph]; ph = [p for p in ph if p]
            bad = [p for p in ph if p not in KK_INV]
            if bad: print('  unknown to kk:', bad, file=sys.stderr); ph = [p for p in ph if p in KK_INV]
            m = kk
        else: m = ru
        a = m.phoneme_ids_to_audio(m.phonemes_to_ids(ph), cfg)
        a = a / max(1e-6, np.max(np.abs(a)))
        out += [a, np.zeros(int(m.config.sample_rate * 0.18), dtype=np.float32)]
    return np.concatenate(out), (kk if model == 'kk' else ru).config.sample_rate
def wav(path, a, sr):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(a, -1, 1) * 32000).astype('<i2').tobytes())
T = json.loads(sys.argv[1]); man = {}
for key, (text, cyr, vs) in T.items():
    h = hashlib.sha1(text.encode()).hexdigest()[:8]; man[key] = [text, vs, h]
    for v in vs:
        out = D + f'sev/spoken_{v}_{h}.mp3'
        if os.path.exists(out): continue
        parts = cyr if isinstance(cyr, list) else [cyr]
        segs = []; sr = None
        for i, c in enumerate(parts):
            a, sr = audio(v, c); segs.append(a)
            if i < len(parts) - 1: segs.append(np.zeros(int(sr * 0.7), dtype=np.float32))
        a = np.concatenate(segs)
        wav(D + 'sev/tmp.wav', a, sr)
        pf = SPK[v][3]
        af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=90'
        if pf != 1.0: af = f'asetrate={int(sr * pf)},aresample={sr},atempo={1 / pf:.4f},' + af
        af += ',loudnorm=I=-17:TP=-2:LRA=7'
        inp = ['-i', D + 'sev/tmp.wav']
        if v == 'sva':
            # the station chime first, then the tannoy
            af = '[0:a]' + af + ',highpass=f=300,lowpass=f=3400,aecho=0.8:0.6:60|120:0.25|0.15[v];[1:a][v]concat=n=2:v=0:a=1'
            inp += ['-i', D + 'sev/chime.wav']
            inp = ['-i', D + 'sev/tmp.wav', '-i', D + 'sev/chime.wav']
            af = af.replace('[1:a][v]', '[1:a][v]')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-filter_complex', af, '-ac', '1', '-ar', '22050', '-b:a', '56k', out], check=True)
        else:
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + inp + ['-af', af, '-ac', '1', '-ar', '22050', '-b:a', '56k', out], check=True)
        print(key, v, h, flush=True)
json.dump(man, open(D + 'sev/manifest.json', 'w'), indent=1, ensure_ascii=False)

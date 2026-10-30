import json, hashlib, subprocess, wave, os, sys
sys.path.insert(0,'.')
from piper import PiperVoice, SynthesisConfig
voice = PiperVoice.load('en-us-libritts-high.onnx', config_path='en-us-libritts-high.onnx.json')
SPK = {'st1': (512, 1.0), 'st2': (300, 1.02), 'st3': (640, 1.0), 'pa1': (92, 1.05), 'st4': (846, 1.0), 'fm1': (182, 1.04), 'st5': (687, 1.05), 'st6': (296, 1.0)}
T = json.loads(sys.argv[1])            # {key: [text, [voices]]}
man = {}
for key, (text, vs) in T.items():
    h = hashlib.sha1(text.encode()).hexdigest()[:8]; man[text] = [vs, h]
    for v in vs:
        out = f'staff/spoken_{v}_{h}.mp3'
        if os.path.exists(out): continue
        sp, ls = SPK[v]
        with wave.open('staff/tmp.wav', 'wb') as wf:
            voice.synthesize_wav(text.replace(' - ', ', '), wf, syn_config=SynthesisConfig(speaker_id=sp, length_scale=ls, noise_scale=0.6, noise_w_scale=0.7))
        af = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,highpass=f=90,loudnorm=I=-17:TP=-2:LRA=7'
        if v in ('pa1', 'fm1'): af += ',highpass=f=300,lowpass=f=3400,aecho=0.8:0.6:60|120:0.25|0.15'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'staff/tmp.wav', '-af', af, '-ac', '1', '-ar', '22050', '-b:a', '56k', out], check=True)
json.dump(man, open('staff/manifest2.json', 'w'), indent=1)
print(len(man))

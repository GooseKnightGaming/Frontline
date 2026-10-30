# (M6.20.12) Severian written -> IPA, by Rhys's Alphabet, Romanisation & IPA reference and Severian.docx 2:
# seven vowels (о̏ /ɔ/ apart from о /o/), iotated vowels as /j/ + vowel with no palatalising, ԏ /tʲ/, the
# syllabic ѕ ѵ ԁ, ъ after a vowel lengthening it (silent elsewhere), stress penultimate unless an acute
# marks it. Џ's value is unresolved in his notes: read here as /dʒ/, like дж.
import unicodedata
V = {'а': 'a', 'е': 'ɛ', 'и': 'i', 'о': 'o', 'у': 'u', 'ы': 'ɨ'}
J = {'я': 'ja', 'ю': 'ju', 'ё': 'jo', 'є': 'jɛ', 'ї': 'ji'}
C = {'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'ж': 'ʒ', 'з': 'z', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
     'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'ԏ': 'tʲ', 'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'tʃ', 'ш': 'ʃ', 'џ': 'dʒ'}
SYL = {'ѕ': 'z', 'ѵ': 'v', 'ԁ': 'r'}

def word(w, syllabic_mark=True):
    """one word -> list of syllable nuclei-aware segments, then stressed"""
    # composed (й ї ё stay single letters); О̏ has no composed form, so it stays О + U+030F; a Latin ó (хóран) marks stress
    s = unicodedata.normalize('NFC', w.lower()).replace('ó', 'о\u0301')
    segs = []          # (ipa, is_nucleus)
    i = 0
    while i < len(s):
        ch = s[i]; nxt = s[i + 1] if i + 1 < len(s) else ''
        if ch == 'д' and nxt == 'ж': segs.append(('dʒ', False)); i += 2; continue
        if ch == 'о' and nxt == '̏': segs.append(('ɔ', True)); i += 2; continue
        if ch == '́':                                   # an acute: the vowel before it carries the stress
            for k in range(len(segs) - 1, -1, -1):
                if segs[k][1]: segs[k] = (segs[k][0], 'stress'); break
            i += 1; continue
        if unicodedata.combining(ch): i += 1; continue
        if ch == 'ъ':
            if segs and segs[-1][1]: segs[-1] = (segs[-1][0] + 'ː', segs[-1][1])
            i += 1; continue
        if ch in V: segs.append((V[ch], True))
        elif ch in J: segs.append(('j', False)); segs.append((J[ch][1:], True))
        elif ch in C: segs.append((C[ch], False))
        elif ch in SYL: segs.append((SYL[ch] + ('̩' if syllabic_mark else ''), True))
        i += 1
    nuc = [k for k, (_, n) in enumerate(segs) if n]
    if not nuc: return ''.join(p for p, _ in segs)
    marked = [k for k in nuc if segs[k][1] == 'stress']
    st = marked[0] if marked else (nuc[-2] if len(nuc) >= 2 else nuc[-1])
    # the stress mark goes before the syllable's onset: the consonants ahead of the nucleus - all of them at
    # the start of a word, all but the first after another vowel (that one closes the syllable before)
    at = st
    while at > 0 and not segs[at - 1][1]: at -= 1
    if at > 0 and st - at >= 2: at += 1
    out = [p for p, _ in segs]
    if len(nuc) > 1: out.insert(at, 'ˈ')
    return ''.join(out)

def sentence(text, syllabic_mark=True):
    out = []
    # a hyphen before a short ending (Беляорск-е) joins it to its word; between words (васдат-оден) it parts them
    import re
    text = re.sub(r'-(?=\w{1,3}\b)', '', text)
    text = text.replace('-', ' ')
    for tok in text.split():
        punct = ''
        while tok and tok[-1] in '.,?!;:': punct = tok[-1] + punct; tok = tok[:-1]
        if tok: out.append(word(tok, syllabic_mark) + punct)
    return ' '.join(out)

if __name__ == '__main__':
    import sys
    for line in sys.argv[1:]: print(line, '->', sentence(line))

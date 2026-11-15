import html
import re
import unicodedata

def normalisasi_teks(teks):
    if not isinstance(teks, str):
        raise TypeError('Teks harus berupa string.')
    teks = unicodedata.normalize('NFKC', html.unescape(teks)).lower()
    teks = teks.replace('\\n', ' ').replace('\\r', ' ').replace('\\t', ' ')
    teks = re.sub(r'<[^>]+>', ' ', teks)
    teks = re.sub(r'(?<!\w)c\+\+(?!\w)', ' cplusplus ', teks)
    teks = re.sub(r'(?<!\w)c#(?!\w)', ' csharp ', teks)
    teks = re.sub(r'(?<!\w)\.net\b', ' dotnet ', teks)
    teks = re.sub(r'[^\w\s]', ' ', teks, flags=re.UNICODE).replace('_', ' ')
    return re.sub(r'\s+', ' ', teks).strip()

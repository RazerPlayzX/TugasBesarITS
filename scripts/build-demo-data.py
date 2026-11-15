"""Ekstrak subset demonstrasi. Tidak memuat joblib atau menghitung rekomendasi."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'referensi/Hasil_ITS_Langkah_1_4/hasil_langkah_2_4'

def read_csv(name):
    with (SOURCE / name).open(encoding='utf-8-sig', newline='') as handle:
        return list(csv.DictReader(handle))

catalog = {row['course_id']: row for row in read_csv('mooc_clean.csv')}
evaluations = read_csv('evaluasi_relevansi_belum_dinilai.csv')
quest = read_csv('quest_aktif_simulasi.csv')
scenarios = []
for topic in ['python programming', 'machine learning', 'sql database']:
    rows = [row for row in evaluations if row['query'] == topic]
    if topic == 'python programming':
        rows += quest
    courses = {}
    for row in rows:
        source = catalog[row['course_id']]
        courses[row['course_id']] = {
            'course_id': row['course_id'],
            'title': source['Course Name'],
            'difficulty': source['Difficulty Level'] or None,
            'provider': source['University / Industry Partner Name'] or None,
            'description': source['Course Description'] or None,
            'url': source['Course URL'],
            'rating': float(source['rating_numeric']) if source['rating_numeric'] else None,
            'cosine_similarity': float(row['Skor Cosine Similarity']),
            'source': 'quest_aktif_simulasi.csv' if 'Quest' in row else 'evaluasi_relevansi_belum_dinilai.csv',
        }
    scenarios.append({'topic': topic, 'courses': sorted(courses.values(), key=lambda c: -c['cosine_similarity'])})

output = ROOT / 'frontend/assets/data/demo-scenarios.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({
    'schema_version': 1,
    'notice': 'Subset contoh ekspor Colab; bukan hasil pencarian model langsung atau seluruh katalog.',
    'scenarios': scenarios,
}, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(scenarios)} skenario ditulis ke {output}')

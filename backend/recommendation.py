import importlib.util
import json
import warnings
import joblib
import numpy as np
import pandas as pd
import sklearn
from scipy.sparse import issparse
from sklearn.metrics.pairwise import cosine_similarity
from .store import ROOT
from .rules import adapt

ARTIFACTS = ROOT / 'referensi/Hasil_ITS_Langkah_1_4/hasil_langkah_2_4'


class Recommender:
    def __init__(self):
        metadata = json.loads((ARTIFACTS / 'metadata.json').read_text(encoding='utf-8'))
        if sklearn.__version__ != metadata['sklearn'] or pd.__version__ != metadata['pandas']:
            raise RuntimeError('Versi model tidak cocok; pasang requirements.txt.')
        spec = importlib.util.spec_from_file_location('normalisasi_teks', ARTIFACTS / 'normalisasi_teks.py')
        normalizer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(normalizer)
        self.normalize = normalizer.normalisasi_teks
        # Only this trusted, repository-local artifact may be deserialized.
        with warnings.catch_warnings():
            warnings.simplefilter('error')
            bundle = joblib.load(ARTIFACTS / 'model_rekomendasi_mooc.joblib')
        self.vectorizer, self.matrix, self.courses = (bundle[k] for k in ['vectorizer', 'matrix', 'courses'])
        assert bundle['sklearn_version'] == metadata['sklearn']
        assert bundle['source_sha256'] == metadata['sha256']
        assert issparse(self.matrix) and self.matrix.shape == (metadata['jumlah_kursus'], metadata['fitur_tfidf'])
        assert len(self.vectorizer.get_feature_names_out()) == self.matrix.shape[1]
        catalog = pd.read_csv(ARTIFACTS / 'mooc_clean.csv')
        assert self.courses['course_id'].is_unique
        assert self.courses['course_id'].tolist() == catalog['course_id'].tolist()

    def recommend(self, request, completed):
        query = self.normalize(request.topic)
        adapted = adapt(request.score, request.ability)
        scores = cosine_similarity(self.vectorizer.transform([query]), self.matrix).ravel()
        mask = (scores > 0) & self.courses['Difficulty Level'].eq(adapted['target_level']).to_numpy() & ~self.courses['course_id'].isin(completed).to_numpy()
        indices = np.flatnonzero(mask)
        indices = indices[np.argsort(-scores[indices], kind='stable')][:request.limit]
        def value(row, key):
            v = row.get(key)
            return None if pd.isna(v) else v
        courses = []
        for i in indices:
            row = self.courses.iloc[i]
            courses.append({'course_id': str(row['course_id']), 'title': row['Course Name'], 'difficulty': row['Difficulty Level'],
                            'url': row['Course URL'], 'provider': value(row, 'University / Industry Partner Name'), 'description': value(row, 'Course Description'),
                            'rating': value(row, 'Course Rating'), 'cosine_similarity': float(scores[i])})
        return {'mode': 'model', 'request': request.model_dump(), 'adaptation': adapted, 'courses': courses,
                'status': 'success' if courses else 'empty',
                'message': 'Hasil model TF-IDF dan cosine similarity.' if courses else 'Tidak ada materi dengan kemiripan positif pada level sasaran. Coba topik bahasa Inggris yang lebih spesifik.'}

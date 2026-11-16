LEVELS = ['Beginner', 'Intermediate', 'Advanced']


def adapt(score, ability):
    delta = -1 if score < 60 else 1 if score >= 80 else 0
    return {'quest_type': 'Remedial' if delta < 0 else 'Mastery' if delta > 0 else 'Improvement',
            'target_level': LEVELS[max(0, min(2, LEVELS.index(ability) + delta))]}


def reward(score):
    badges = ['Learning Explorer']
    if score >= 90:
        badges.append('Quiz Master')
    if score >= 80:
        badges.append('Smart Learner')
    if score < 60:
        badges.append('Keep Learning')
    return 20 + (50 if score >= 90 else 30 if score >= 80 else 20 if score >= 60 else 10), badges


def level(xp):
    return 1 + sum(xp >= threshold for threshold in [100, 200, 300])


def snapshot(quest, history):
    xp = sum(item['xp'] for item in history)
    badges = list(dict.fromkeys(b for item in history for b in item['badges']))
    ids = [item['course_id'] for item in history]
    total = len(quest['courses']) if quest else 0
    done = sum(c['course_id'] in ids for c in quest['courses']) if quest else 0
    return {'schema_version': 1, 'quest': quest, 'history': history,
            'profile': {'xp': xp, 'badges': badges, 'completedIds': ids, 'level': level(xp)},
            'progress': {'total': total, 'completed': done, 'percent': round(done / total * 100, 2) if total else 0}}

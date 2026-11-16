import { api } from './api.js';

// Titik penggantian adapter pada langkah 6. UI hanya bergantung pada kontrak ini.
export const recommendationService = Object.freeze({
  recommend: (request) => api('recommend', request),
  complete: (state, completion) => api('complete', { ...completion, quest_id: state.quest.id }),
  start: (result, courses, replace) => api('quest', { recommendation_id: result.recommendation_id, course_ids: courses.map(c => c.course_id), replace }),
});

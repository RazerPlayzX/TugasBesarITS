import { mockRecommend, mockComplete } from "./mock-service.js";

// Titik penggantian adapter pada langkah 6. UI hanya bergantung pada kontrak ini.
export const recommendationService = Object.freeze({
  recommend: (request, options) => mockRecommend(request, options),
  complete: (state, completion) => mockComplete(state, completion),
});

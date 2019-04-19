import superagent from "superagent";
import { applyPatch } from "json-patch-es6";

// Helpers
export const SvcUrl = relativeUrl =>
  relativeUrl
    .replace(/^/, "https://api.themoviedb.org/3")
    .replace(/(\?|$)/, "?api_key=bf6b860ab05ac2d94054ba9ca96cf1fa&");

export function runMovieSearchQuery(query) {
  return superagent.get(SvcUrl(query)).then(res => {
    return res.body;
  });
}
export function runMovieDetailQuery(movieId) {
  return Promise.all([
    runMovieSearchQuery(`/movie/${movieId}`),
    runMovieSearchQuery(`/movie/${movieId}/credits`)
  ]);
}

export function makeQuerySlug(query) {
  return query.length === 0
    ? `/movie/popular?language=en-US&page=1`
    : `/search/movie?query=${query}`;
}

// Utils
export function destructureEvent(eventStruct) {
  return {
    rawEventName: eventStruct[0],
    rawEventData: eventStruct[1],
    ref: eventStruct[2]
  };
}

/**
 *
 * @param {ExtendedState} extendedState
 * @param {Operation[]} extendedStateUpdateOperations
 * @returns {ExtendedState}
 */
export function applyJSONpatch(extendedState, extendedStateUpdateOperations) {
  return applyPatch(
    extendedState,
    extendedStateUpdateOperations || [],
    false,
    false
  ).newDocument;
}

export const getEventEmitterAdapter = emitonoff => {
  const eventEmitter = emitonoff();
  const DUMMY_NAME_SPACE = "_";
  const subscribers = [];

  return {
    subjectFactory: () => ({
      next: x => eventEmitter.emit(DUMMY_NAME_SPACE, x),
      complete: () =>
        subscribers.forEach(f => eventEmitter.off(DUMMY_NAME_SPACE, f)),
      subscribe: ({ next: f, error: _, complete: __ }) => {
        return subscribers.push(f), eventEmitter.on(DUMMY_NAME_SPACE, f);
      }
    })
  };
};

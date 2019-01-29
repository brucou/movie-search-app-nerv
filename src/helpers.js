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

// outputSubject allows raising event which can be
export function makeWebComponentFromFsm({
  name,
  eventSubjectFactory,
  fsm,
  commandHandlers,
  effectHandlers,
  options
}) {
  class FsmComponent extends HTMLElement {
    static get observedAttributes() {
      return [];
    }

    constructor() {
      super();
      const el = this;
      this.eventSubject = eventSubjectFactory();
      this.outputSubject = eventSubjectFactory();
      this.options = Object.assign({}, options);
      const NO_ACTION = this.options.NO_ACTION || null;

      // Set up execution of commands
      this.eventSubject.subscribe(eventStruct => {
        const actions = fsm(eventStruct);

        if (actions === NO_ACTION) return;
        actions.forEach(action => {
          if (action === NO_ACTION) return;
          const { command, params } = action;
          commandHandlers[command](
            this.eventSubject.next,
            params,
            effectHandlers,
            el,
            this.outputSubject
          );
        });
      });
    }

    connectedCallback() {
      this.options.initialEvent &&
        this.eventSubject.next(this.options.initialEvent);
    }

    disconnectedCallback() {
      this.eventSubject.complete();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      // simulate a new creation every time an attribute is changed
      // i.e. they are not expected to change
      this.constructor();
      this.connectedCallback();
    }
  }

  return customElements.define(name, FsmComponent);
}

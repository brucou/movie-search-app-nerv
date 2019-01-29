import "./uikit.css";
import "./index.css";
import { render } from "nervjs";
import h from "nerv-hyperscript";
import { createStateMachine } from "state-transducer";
import emitonoff from "emitonoff";
import {
  movieSearchFsmDef,
  commandHandlers,
  effectHandlers,
  screens
} from "./fsm";
import { applyJSONpatch, makeWebComponentFromFsm } from "./helpers";
import { COMMAND_RENDER, events } from "./properties";

if (process.env.NODE_ENV !== 'production')  {
  require('nerv-devtools')
}

const fsm = createStateMachine(movieSearchFsmDef, {
  updateState: applyJSONpatch,
  debug: { console }
});

function subjectFromEventEmitterFactory() {
  const eventEmitter = emitonoff();
  const DUMMY_NAME_SPACE = "_";
  const _ = DUMMY_NAME_SPACE;
  const subscribers = [];

  return {
    next: x => eventEmitter.emit(_, x),
    complete: () => subscribers.forEach(f => eventEmitter.off(_, f)),
    subscribe: f => (subscribers.push(f), eventEmitter.on(_, f))
  };
}

const infernoRenderCommandHandler = {
  [COMMAND_RENDER]: (trigger, params, effectHandlers, el) => {
    const { screen, args } = params;
    render(screens(trigger)[screen](...args), el);
  }
};
const commandHandlersWithRender = Object.assign(
  {},
  commandHandlers,
  infernoRenderCommandHandler
);

const options = { initialEvent: { [events.USER_NAVIGATED_TO_APP]: void 0 } };

makeWebComponentFromFsm({
  name: "movie-search",
  eventSubjectFactory: subjectFromEventEmitterFactory,
  fsm,
  commandHandlers: commandHandlersWithRender,
  effectHandlers,
  options
});

render(h("movie-search"), document.getElementById("root"));

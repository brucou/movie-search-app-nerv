import { render } from "nervjs";
import h from "nerv-hyperscript";
import { createStateMachine, makeWebComponentFromFsm } from "state-transducer";
import emitonoff from "emitonoff";
import { movieSearchFsmDef, commandHandlers, effectHandlers } from "./fsm";
import { screens } from "./screens";
import { getEventEmitterAdapter } from "./helpers";
import { COMMAND_RENDER, events } from "./properties";
import "./uikit.css";
import "./index.css";

const fsm = createStateMachine(movieSearchFsmDef, {
  debug: { console }
});

const nervRenderCommandHandler = {
  [COMMAND_RENDER]: (next, params, effectHandlers, el) => {
    const { screen, query, results, title, details, cast } = params;
    const props = params;
    render(screens(next)[screen](props), el);
  }
};
const commandHandlersWithRender = Object.assign(
  {},
  commandHandlers,
  nervRenderCommandHandler
);

const options = { initialEvent: { [events.USER_NAVIGATED_TO_APP]: void 0 } };

makeWebComponentFromFsm({
  name: "movie-search",
  eventHandler: getEventEmitterAdapter(emitonoff),
  fsm,
  commandHandlers: commandHandlersWithRender,
  effectHandlers,
  options
});

render(h("movie-search"), document.getElementById("root"));

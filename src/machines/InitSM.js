import { GLOBAL_STATE_ATTR } from "../modules/Constant";
import {
  getAppModeFromURL,
  getPreprodFromURL,
  getBackgroundColorFromURL,
} from "../utils/urlParamUtils";

const registerListeners = (actions) => {
  actions.Listeners.addResizeListener(window, () => {
    actions.Web3DScene.windowResizeListener();
  });
};

const InitSM = (actions) => ({
  id: "INIT_ID",
  initial: "INITIAL",
  states: {
    INITIAL: {
      entry: [
        () => {
          registerListeners(actions);
          actions.GlobalState.setAttrs({
            [GLOBAL_STATE_ATTR.PREPROD]: getPreprodFromURL(window),
            [GLOBAL_STATE_ATTR.APP_MODE]: getAppModeFromURL(window),
            [GLOBAL_STATE_ATTR.BACKGROUND_COLOR]:
              getBackgroundColorFromURL(window),
          });
          actions.Event.sendSMEvent("INITIALIZED");
        },
      ],
      on: {
        INITIALIZED: "finalState",
      },
    },
    finalState: { type: "final" },
  },
});

export default InitSM;

import InitializeSM from "./InitSM";
import ViewerSM from "./ViewerSM";

export const APP_SM_CONST = {
  GLB_VIEWER: "GLB_VIEWER",
  APP_INITIAL: "APP_INITIAL",
  ID: "APP_SM",
};

export const APP_SM = (actions) => ({
  id: APP_SM_CONST.ID,
  initial: APP_SM_CONST.APP_INITIAL,
  states: {
    [APP_SM_CONST.APP_INITIAL]: {
      ...InitializeSM(actions),
      onDone: APP_SM_CONST.GLB_VIEWER,
    },
    [APP_SM_CONST.GLB_VIEWER]: {
      entry: [() => actions.RootStore().setAppMode("viewer")],
      ...ViewerSM(actions),
    },
  },
});

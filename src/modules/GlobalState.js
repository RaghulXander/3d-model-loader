const initGlobalState = () => {
  let globalState = {};
  return {
    setAttr: (key, value) => {
      globalState[key] = value;
    },
    getAttr: (key) => globalState[key],
    setAttrs: (config) => {
      globalState = { ...globalState, ...config };
    },
  };
};

const GlobalState = initGlobalState();
export default GlobalState;

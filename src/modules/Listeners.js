const mod = () => {
  const addBlurListener = (window, blurFn) => {
    window.addEventListener("blur", () => {
      blurFn();
    });
  };

  const addModeListener = (window, modeListenerFn) => {
    window.addEventListener("popstate", () => {
      modeListenerFn();
    });
  };
  const addResizeListener = (window, resizeFn) => {
    window.addEventListener("resize", () => {
      resizeFn();
    });
  };

  return {
    addBlurListener,
    addModeListener,
    addResizeListener,
  };
};

const Listners = mod();
export default Listners;

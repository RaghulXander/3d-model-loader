/**
 * getParamsFromURL
 *
 * @param {*} window
 * @param {*} queryParam
 * @returns {*}
 */
export const getParamsFromURL = (window, queryParam) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(queryParam) ? params.get(queryParam) : null;
};

/**
 * getGlbTypeFromURL
 *
 * @param {*} window
 * @returns {*}
 */
export const getGlbTypeFromURL = (window) => {
  const value = getParamsFromURL(window, "glbType");
  return value ? value : "ktx";
};

/**
 * Description placeholder
 *
 * @param {*} window
 * @returns {*}
 */
export const getEnvironmentFromURL = (window) => {
  let env = getParamsFromURL(window, "env");
  if (!env) env = "prod";
  return env;
};

/**
 * Description placeholder
 *
 * @param {*} window
 * @returns {*}
 */
export const getPreprodFromURL = (window) => {
  const preprodParam = getParamsFromURL(window, "preprod");
  return preprodParam ? preprodParam : "local";
};

/**
 * Description placeholder
 *
 * @param {*} window
 * @returns {*}
 */
export const getAppModeFromURL = (window) => {
  const modeParam = getParamsFromURL(window, "mode");
  return modeParam ? modeParam : "viewer";
};

/**
 * Description placeholder
 *
 * @param {*} window
 * @returns {*}
 */
export const getModelIdFromUrl = (window) => {
  const modelId = getParamsFromURL(window, "modelId");
  return modelId ?? null;
};

/**
 * getBackgroundColorFromURL
 *
 * @param {*} window
 * @returns {*}
 */
export const getBackgroundColorFromURL = (window) => {
  let backgroundColor = getParamsFromURL(window, "backgroundColor");
  backgroundColor = backgroundColor ? parseInt(backgroundColor, 16) : 0xffffff;
  return backgroundColor;
};

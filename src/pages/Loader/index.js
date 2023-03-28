import React from "react";
import PropTypes from "prop-types";

import "./index.scss";

const Loader = () => {
  return (
    <div className="loadingBar">
      <span className="segment-spinner segment-spinner--small" />
    </div>
  );
};
export default Loader;

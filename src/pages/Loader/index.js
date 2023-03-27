import React from "react";
import PropTypes from "prop-types";

import "./index.scss";

const Loader = ({ className, small, bttn, active, disabled }) => {
  return (
    <div className="loadingBar">
      <span className="segment-spinner segment-spinner--small" />
    </div>
  );
};

Loader.displayName = "Loader";

Loader.propTypes = {
  /** Display Active. */
  active: PropTypes.bool,
  /** For Loaders in Button. */
  bttn: PropTypes.bool,
  /** Extend Styles. */
  className: PropTypes.string,
  /** Display Disabled. */
  disabled: PropTypes.bool,
  /** Small Loader. */
  small: PropTypes.bool,
};

Loader.defaultProps = {
  active: true,
  bttn: false,
  className: null,
  disabled: false,
  small: false,
};

export default Loader;

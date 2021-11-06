import React from "react";
import { PropTypes } from "prop-types";
import "./common.css";

export default function Progressbar(props) {
  const { now } = props;
  const refThis = React.useRef();
  React.useEffect(() => {
    refThis.current.style.width = now + "%";
  }, [now]);
  return (
    <div className="progress">
      <div ref={refThis} className="bar">{`${now}%`}</div>
    </div>
  );
}

Progressbar.propTypes = {
  now: PropTypes.number.isRequired
};

Progressbar.defaultProps = {
  now: 0
};

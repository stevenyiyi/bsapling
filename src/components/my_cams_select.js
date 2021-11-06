import React from "react";
import PropTypes from "prop-types";
import CheckboxMultiSelect from "./multi_select";
import http from "../http_common";

export default function MyCamsSelect(props) {
  const { selectedItems, setSelectedItems } = props;
  const [myCameras, setMyCameras] = React.useState([]);

  React.useEffect(() => {
    http
      .post("/sapling/get_my_cameras")
      .then((response) => {
        setMyCameras(response.data.cameras);
      })
      .catch((e) => {
        console.error("error:", e);
      });
  }, []);

  return (
    <CheckboxMultiSelect
      title="选择摄像头"
      items={myCameras}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      kvmap={{ key: "deviceid", value: "name" }}
    />
  );
}

MyCamsSelect.propTypes = {
  selectedItems: PropTypes.array,
  setSelectedItems: PropTypes.func.isRequired
};

MyCamsSelect.defaultProps = {
  selectedItems: [],
  setSelectedItems: (cams) => {}
};

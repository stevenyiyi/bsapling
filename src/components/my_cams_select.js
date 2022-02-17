import React from "react";
import PropTypes from "prop-types";
import CheckboxMultiSelect from "./multi_select";
import http from "../http_common";

const MyCamsSelect = React.forwardRef((props, ref) => {
  const { selectedItems, setSelectedItems } = props;
  const [myCameras, setMyCameras] = React.useState([]);

  React.useImperativeHandle(ref, () => ({
    getDeviceName: (deviceid) => {
      let name = "";
      let found = false;
      for (const dev of myCameras) {
        if (dev.deviceid.substr(10, 3) === "111") {
          for (const cam of dev.cameras) {
            if (cam.deviceid === deviceid) {
              name = cam.name;
              found = true;
              break;
            }
          }
        } else {
          if (dev.deviceid === deviceid) {
            name = dev.name;
            found = true;
          }
        }
        if (found) break;
      }
      return name;
    }
  }));

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
});

MyCamsSelect.propTypes = {
  selectedItems: PropTypes.array,
  setSelectedItems: PropTypes.func.isRequired
};

MyCamsSelect.defaultProps = {
  selectedItems: [],
  setSelectedItems: (cams) => {}
};

export default MyCamsSelect;

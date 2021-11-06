import React from "react";
import PropTypes from "prop-types";
import CheckboxMultiSelect from "./multi_select";
import http from "../http_common";

export default function MyDevicesMultiSelect(props) {
  const { selectedItems, setSelectedItems } = props;
  const [registerDevices, setRegisterDevices] = React.useState([]);

  React.useEffect(() => {
    http
      .get("/sapling/get_device", { params: { type: 111, ts: Date.now() } })
      .then((response) => {
        setRegisterDevices(response.data.devices);
      })
      .catch((e) => {
        console.error("Error:", e);
        /// tester
        let devs = [
          { deviceid: "00000000000000000000", name: "所有子设备" },
          { deviceid: "11000000000000000001", name: "江东幼儿园" },
          { deviceid: "11000000000000000002", name: "南充中山幼儿园" }
        ];
        setRegisterDevices(devs);
      });
  }, []);

  return (
    <CheckboxMultiSelect
      title="选择录像机"
      items={registerDevices}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      kvmap={{ key: "deviceid", value: "name" }}
    />
  );
}

MyDevicesMultiSelect.propTypes = {
  selectedItems: PropTypes.array,
  setSelectedItems: PropTypes.func.isRequired
};

MyDevicesMultiSelect.defaultProps = {
  selectedItems: [],
  setSelectedItems: (cams) => {}
};

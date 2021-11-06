import React from "react";
import PropTypes from "prop-types";
import ASSelect from "./as_select";
import http from "../http_common";

export default function MyDevicesSelect(props) {
  const { value, onSelectChange } = props;
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
    <ASSelect
      title="选择录像机"
      items={registerDevices}
      kvmap={{ key: "deviceid", value: "name" }}
      selectedKey={value}
      onChange={onSelectChange}
    />
  );
}

MyDevicesSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onSelectChange: PropTypes.func.isRequired
};

MyDevicesSelect.defaultProps = {
  value: "",
  onSelectChange: (v) => {}
};

import React from "react";
import http from "../http_common";
import { useSnackbar } from "./use_snackbar";
import { FaPen, FaTimes, FaInfo } from "react-icons/fa";
import DeviceRegister from "./device_register";
import DeviceInfo from "./device_info";
import ModifyDevice from "./modify_device";
import "./common.css";
export default function MyDevices() {
  const [data, setData] = React.useState(null);
  const [showAddDevice, setShowAddDevice] = React.useState(false);
  const [openSnackbar] = useSnackbar();
  const [opdev, setOpdev] = React.useState({
    eshow: false,
    qshow: false,
    index: 0
  });
  const [sipServerInfo, setSipServerInfo] = React.useState({
    server_ip: "61.164.242.177",
    server_port: 31234,
    server_code: "50010900000000000000",
    domain: "anylooker.com"
  });
  React.useEffect(() => {
    /// 获取用户所拥有的设备信息
    http
      .get("/sapling/get_device")
      .then((response) => {
        if (response.data.result === 0) {
          setData(response.data.devices);
        } else {
          openSnackbar(`服务器返回错误代码:${response.data.result}`);
        }
      })
      .catch((e) => {
        openSnackbar(e.toJSON().message);
      });
    /// 获取SIP 服务器信息
    http
      .get("/sapling/get_sip_server_info")
      .then((response) => {
        if (response.data.result === 0) {
          setSipServerInfo(response.data.info);
        } else {
          openSnackbar(`服务器返回错误代码:${response.data.result}`);
        }
      })
      .catch((e) => {
        openSnackbar(e.toJSON().message);
      });
  }, []);

  /** 点击修改设备 */
  const handleEditClick = (idx) => {
    setOpdev({ ...opdev, eshow: true, index: idx });
  };

  /** 点击删除设备 */
  const handleDeleteClick = (idx) => {};

  /** 点击查询设备注册信息 */
  const handleQueryDevice = (idx) => {
    setOpdev({ ...opdev, qshow: true, index: idx });
  };

  /** 点击注册新设备 */
  const handleAddDeviceClick = () => {
    setShowAddDevice(true);
  };

  /** 注册新设备回调 */
  const onAddDevice = (dev) => {
    setData([...data, dev]);
  };

  /** 修改设备回调 */
  const onUpdateDevice = (dev) => {
    let cdata = [...data];
    cdata[opdev.index] = dev;
    setData(cdata);
  };

  return (
    <div className="formContainer">
      <table>
        <thead>
          <tr>
            <td>操作</td>
            <td>类型</td>
            <td>设备名称</td>
            <td>注册信息</td>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((dev, idx) => (
              <tr>
                <td>
                  <span
                    className="circle_span"
                    onClick={(e) => handleEditClick(idx)}
                  >
                    <FaPen />
                  </span>
                  <span
                    className="circle_span"
                    onClick={(e) => handleDeleteClick(idx)}
                  >
                    <FaTimes />
                  </span>
                </td>
                <td>
                  {dev.deviceid.substr(10, 3) === "111" ? "录像机" : "摄像头"}
                </td>
                <td>{dev.name}</td>
                <td>
                  <span
                    className="circle_span"
                    onClick={(e) => handleQueryDevice(idx)}
                  >
                    <FaInfo />
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <button onClick={handleAddDeviceClick}>注册新设备</button>
      <DeviceRegister
        show={showAddDevice}
        onClose={() => setShowAddDevice(false)}
        onChange={onAddDevice}
      />
      {data && data.length > 0 && (
        <ModifyDevice
          dev={data[opdev.index]}
          show={opdev.eshow}
          onClose={() => setOpdev({ ...opdev, eshow: false })}
          onChange={onUpdateDevice}
        />
      )}
      {data && data.length > 0 && (
        <DeviceInfo
          dev={data[opdev.index]}
          server={sipServerInfo}
          show={opdev.qshow}
          onClose={() => setOpdev({ ...opdev, qshow: false })}
          onChange={onUpdateDevice}
        />
      )}
    </div>
  );
}

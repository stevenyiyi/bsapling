import React from "react";
import Modal from "./modal";
import "./common.css";

export default function DeviceInfo(props) {
  const { dev, server, show, onClose } = props;
  const genChannelsInfo = () => {
    if (dev && dev.deviceid.substr(10, 3) === "111") {
      let ccode = dev.deviceid.substr(0, 10) + "132";
      let sn = dev.deviceid.substr(15);
      let channelNos = ccode + sn + "01--XX";
      return (
        <tr>
          <td>通道编码范围</td>
          <td>{channelNos}</td>
        </tr>
      );
    } else {
      return null;
    }
  };

  return (
    <Modal title="设备信息" show={show} onClose={onClose}>
      <table>
        <tbody>
          <tr>
            <td>设备编码</td>
            <td>{dev.deviceid}</td>
          </tr>
          <tr>
            <td>注册口令</td>
            <td>{dev.password}</td>
          </tr>
          <tr>
            <td>SIP服务器地址</td>
            <td>{server.server_ip}</td>
          </tr>
          <tr>
            <td>SIP服务器端口</td>
            <td>{server.server_port}</td>
          </tr>
          <tr>
            <td>SIP服务器编码</td>
            <td>{server.server_code}</td>
          </tr>
          <tr>
            <td>SIP服务器域</td>
            <td>{server.domain}</td>
          </tr>
          {genChannelsInfo()}
        </tbody>
      </table>
    </Modal>
  );
}

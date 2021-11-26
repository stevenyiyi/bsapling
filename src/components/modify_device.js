import React from "react";
import PropTypes from "prop-types";
import http from "../http_common";
import Modal from "./modal";
import "./common.css";
import "./floating_label.css";

export default function ModifyDevice(props) {
  const { dev, show, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [schedule, setSchedule] = React.useState("");
  const [channels, setChannels] = React.useState(null);
  const [changes, setChanges] = React.useState([]);

  React.useEffect(() => {
    setName(dev.name);
    if (dev.schedule) setSchedule(dev.schedule);
    if (dev.deviceid.substring(10, 13) === "111") {
      http
        .post("/sapling/get_device", [dev.deviceid])
        .then((response) => {
          if (response.data.result === 0) {
            setChannels(response.data.devices);
          } else {
            console.log(`Error code:${response.data.result}`);
          }
        })
        .catch((e) => {
          console.error("Error:", e);
        });
    }
  }, [dev]);

  const handleSubmit = (event) => {
    event.preventDefault();
    let f = false;
    let cdev = { deviceid: dev.deviceid, changes: [] };
    if (dev.name !== name) {
      if (dev.deviceid.substring(10, 13) === "111") {
        cdev.changes.push({ key: "nick_name", value: name });
      } else {
        cdev.changes.push({ key: "name", value: name });
      }
      dev.name = name;
      f = true;
    }
    if (schedule && dev.schedule !== schedule) {
      cdev.changes.push({ key: "schedule", value: schedule });
      dev.schedule = schedule;
      f = true;
    }

    if (cdev.changes.length > 0) {
      changes.unshift(cdev);
    }

    if (changes.length > 0) {
      http
        .post("/sapling/modify_devices", changes)
        .then((response) => {
          if (response.data.result === 0) {
            if (f) {
              onChange(dev);
            }
            onClose();
          } else {
            console.log(`Modify device error:${response.data.result}.`);
          }
        })
        .catch((e) => {
          console.error("Error", e);
        });
    }
  };

  const handleChange = (deviceid, event) => {
    const mcam = changes.find((cam) => cam.deviceid === deviceid);
    const key = event.target.name;
    const value = event.target.value.trim();
    if (mcam) {
      const mfield = mcam.changes.find((field) => field.key === key);
      if (mfield) {
        mfield.key = key;
        mfield.value = value;
      } else {
        mcam.changes.push({ key: key, value: value });
      }
    } else {
      setChanges([
        ...changes,
        {
          deviceid: deviceid,
          changes: [{ key: key, value: value }]
        }
      ]);
    }
  };
  return (
    <Modal title="修改设备" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <div className="form__div">
          <input
            className="form__input"
            type="text"
            id={dev.deviceid}
            placeholder=" "
            defaultValue={dev.deviceid}
            readOnly
          />
          <label htmlFor="deviceid" className="form__label">
            设备编码
          </label>
        </div>
        <div className="form__div">
          <input
            className="form__input"
            type="text"
            id={`${dev.deviceid}_name`}
            value={name}
            placeholder=" "
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_devname">
            设备名称
          </label>
        </div>
        {channels ? (
          <table>
            <thead>
              <tr>
                <td>通道</td>
                <td>摄像头编码</td>
                <td>摄像头名称</td>
                <td>开放时间段</td>
              </tr>
            </thead>
            <tbody>
              {channels &&
                channels.map((cam) => (
                  <tr>
                    <td>{cam.deviceid.substring(18)}</td>
                    <td>{cam.deviceid}</td>
                    <td>
                      <input
                        type="text"
                        className="inner_input"
                        id={`${cam.deviceid}_name`}
                        name="name"
                        defaultValue={cam.name}
                        onChange={(e) => handleChange(cam.deviceid, e)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        id={`${cam.deviceid}_schedule`}
                        name="schedule"
                        defaultValue={cam.schedule}
                        className="inner_input"
                        pattern="^((?:[01]\d:[0-5][0-9]|2[0-3]:[0-5][0-9])(?:\s?)-(?:\s?)(?:[01]\d:[0-5][0-9]|2[0-3]:[0-5][0-9])(?:\s?,\s?)?)+$"
                        onChange={(e) => handleChange(cam.deviceid, e)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="form__div">
            <input
              type="text"
              id={`${dev.deviceid}_schedule`}
              name="schedule"
              defaultValue={dev.schedule}
              className="form__input"
              placeholder=" "
              pattern="^((?:[01]\d:[0-5][0-9]|2[0-3]:[0-5][0-9])(?:\s?)-(?:\s?)(?:[01]\d:[0-5][0-9]|2[0-3]:[0-5][0-9])(?:\s?,\s?)?)+"
              onChange={(e) => setSchedule(e.target.value.trim())}
            />
            <label className="form__label" htmlFor={`${dev.deviceid}_schedule`}>
              开放时间段
            </label>
          </div>
        )}
        <button type="submit">确定</button>
      </form>
    </Modal>
  );
}

ModifyDevice.propTypes = {
  dev: PropTypes.object.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

ModifyDevice.defaultProps = {
  dev: { deviceid: "132431241241423", name: "中一班", schedule: "00:00-23:59" },
  show: true,
  onClose: () => {},
  onChange: (dev) => {}
};

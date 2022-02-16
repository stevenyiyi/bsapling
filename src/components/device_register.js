import React from "react";
import Data201907 from "../gbtloc/201907.json";
import GBT2260 from "../gbtloc/gbt2260.js";
import Modal from "./modal";
import ASSelect from "./as_select";
import ASTooltip from "./as_tootip";
import http from "../http_common";
import { getRandomInt } from "../utils/utils";
import "./common.css";
import "./floating_label.css";

export default function DeviceRegister(props) {
  const { show, onClose, onChange } = props;
  const [form, setForm] = React.useState({});
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const setField = (field, value) => {
    setForm({
      ...form,
      [field]: value
    });
  };
  const gb2260 = new GBT2260("201907", Data201907);

  const genPrefectures = (provinceCode) => {
    return provinceCode ? gb2260.prefectures(provinceCode) : [];
  };

  const genCounties = (prefectureCode) => {
    if (!prefectureCode || !prefectureCode.endsWith("00")) return [];
    return gb2260.counties(prefectureCode);
  };

  const handleChangeDeviceType = (value) => {
    setForm({ ...form, type: value, channels: 16 });
  };

  const formInvalidate = () => {
    if (!form.province) {
      setMessage({ ...message, show: true, text: "请选择省/直辖市" });
      return false;
    }

    if (!form.prefecture) {
      setMessage({ ...message, show: true, text: "请选择地区/市" });
      return false;
    }

    let hasCounty = form.prefecture.endsWith("00");
    if (hasCounty && !form.county) {
      setMessage({ ...message, show: true, text: "县/市/区 不能为空!" });
      return false;
    }

    if (!form.type) {
      setMessage({ ...message, show: true, text: "必须选择设备类型!" });
      return false;
    }

    if (!form.name) {
      setMessage({ ...message, show: true, text: "设备名称不能为空!" });
      return false;
    }

    if (form.type === "111" && form.channels <= 2) {
      setMessage({ ...message, show: true, text: "通道数必须大于2!" });
      return false;
    }

    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formInvalidate()) {
      return;
    }

    /// 产生设备编码
    let hasCounty = form.prefecture.endsWith("00");
    let deviceid = hasCounty ? form.county : form.prefecture;
    /** 基层接入单位编号(2)+行业编码(2) */
    deviceid += getRandomInt(0, 100).toString(10).padStart(2, "0") + "12";
    /** 设备类型编码(3) */
    deviceid += form.type;
    let isDvr = form.type === "111" ? true : false;
    /** devcice sequence number(7) */
    let sn = Math.floor(Math.random() * (isDvr ? 100000 : 10000000)).toString();
    sn = sn.padStart(7, "0");
    deviceid += sn;

    form.deviceid = deviceid;

    let rparams = {
      deviceid: deviceid,
      password: form.password,
      name: form.name,
      children: form.channels
    };

    http
      .post("/sapling/register_device", rparams)
      .then((response) => {
        if (response.data.result === 0) {
          setMessage({ ...message, show: true, text: "设备注册成功!" });
          onChange({
            deviceid: form.deviceid,
            name: form.name,
            password: form.password
          });
          onClose();
        } else {
          setMessage({
            ...message,
            show: true,
            text: `错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) =>
        setMessage({ ...message, show: true, text: e.toJSON().message })
      );
  };
  return (
    <Modal title="直播设备注册" show={show} onClose={onClose}>
      <form className="formContainer" onSubmit={handleSubmit}>
        <ASSelect
          title="选择省/直辖市"
          items={gb2260.provinces()}
          kvmap={{ key: "code", value: "name" }}
          selectedKey=""
          onChange={(value) => setField("province", value)}
        />

        <ASSelect
          title="选择地区/地级市"
          items={genPrefectures(form.province)}
          kvmap={{ key: "code", value: "name" }}
          selectedKey=""
          onChange={(value) => setField("prefecture", value)}
        />

        <ASSelect
          title="选择县/市/区"
          items={genCounties(form.prefecture)}
          kvmap={{ key: "code", value: "name" }}
          selectedKey=""
          onChange={(value) => setField("county", value)}
        />

        <ASSelect
          title="选择直播设备类型"
          items={[
            { type: "111", name: "NVR硬盘录像机" },
            { type: "132", name: "IPC网络摄像头" },
            { type: "139", name: "其它直播设备" }
          ]}
          kvmap={{ key: "type", value: "name" }}
          selectedKey=""
          onChange={handleChangeDeviceType}
        />
        <div className="form__div">
          <input
            id="add-device_edit_id"
            name="add-device_edit_id"
            type="text"
            className="form__input"
            required
            placeholder=" "
            onChange={(e) => setField("name", e.target.value)}
          />
          <label className="form__label" htmlFor="add-device_edit_id">
            请输入设备名称
          </label>
        </div>
        {form.type === "111" && (
          <div className="form__div">
            <input
              id="dev-channels_id"
              name="dev-channels_id"
              type="number"
              className="form__input"
              value={form.channels}
              min="1"
              max="32"
              required
              placeholder=" "
              onChange={(e) =>
                setField("channels", Number.parseInt(e.target.value, 10))
              }
            />
            <label className="form__label" htmlFor="dev-channels_id">
              请选择NVR通道数
            </label>
          </div>
        )}
        <div className="form__div">
          <input
            type="password"
            name="current-password"
            id="current-password"
            className="form__input"
            required
            pattern="^[0-9a-zA-Z]{6,22}"
            title="口令限制仅英文字母或数字组成，长度范围(6-22)个字符."
            placeholder=" "
            onChange={(e) => setField("password", e.target.value)}
          />
          <label className="form__label" htmlFor="current-password">
            请输入口令
          </label>
        </div>
        <button className="tooltip btn" type="submit">
          确定
          <ASTooltip
            show={message.show}
            delay={5000}
            onClose={() => setMessage({ ...message, show: false })}
          >
            {message.text}
          </ASTooltip>
        </button>
      </form>
    </Modal>
  );
}

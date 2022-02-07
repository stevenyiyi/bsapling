import React from "react";
import Data201907 from "../gbtloc/201907.json";
import GBT2260 from "../gbtloc/gbt2260.js";
import Modal from "./modal";
import ASSelect from "./as_select";
import ASTooltip from "./as_tootip";
import Progressbar from "./progressbar";
import http from "../http_common";
import { getRandomInt } from "../utils/utils";
import "./common.css";
import "./floating_label.css";
import "./school_pics.css";
const AddSchool = (props) => {
  const { show, onClose, onChange } = props;
  const [form, setForm] = React.useState({});
  const [selectFiles, setSelectFiles] = React.useState(new Array(4));
  const [isLoading, setIsLoading] = React.useState(false);
  const [percentage, setPercentage] = React.useState(0);
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const [refPics, setRefPics] = React.useState(new Array(4));
  const refConfirm = React.useRef(null);
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

    if (!form.name) {
      setMessage({ ...message, show: true, text: "幼儿园名称不能为空!" });
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    // add or remove refs
    setRefPics((elPicRefs) =>
      Array(4)
        .fill()
        .map((_, i) => elPicRefs[i] || React.createRef())
    );
  }, []);
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formInvalidate()) {
      event.stopPropagation();
    } else {
      handleNewSapling();
    }
  };

  const handleSelectFiles = (event) => {
    const selectFile = event.target.files[0];
    if (!selectFile) return;
    if (selectFile.size >= 1024 * 1024) {
      alert("选择的文件不能超过1MB,请调低图片的分辨率!");
      return;
    }
    let cfiles = [...selectFiles];
    let idx = parseInt(event.target.id.charAt(event.target.id.length - 1), 10);
    cfiles[idx - 1] = selectFile;
    setSelectFiles(cfiles);
    console.log(event.target.files);
    refPics[idx - 1].current.src = URL.createObjectURL(event.target.files[0]);
  };

  const generateSchoolid = () => {
    let hasCounty = form.prefecture.endsWith("00");
    /// 产生schoolid
    let uid = hasCounty ? form.county : form.prefecture;
    /** 基层接入单位编号(2)+行业编码(2) */
    uid += getRandomInt(0, 100).toString(10).padStart(2, "0") + "12";
    /** devcice sequence number(10) */
    let sn = Math.floor(Math.random() * 10000000000).toString();
    sn = sn.padStart(10, "0");
    uid += sn;
    return uid;
  };

  const handleNewSapling = () => {
    let schoolid = generateSchoolid();
    let formData = new FormData();
    formData.append("schoolid", schoolid);
    formData.append("name", form.name);
    formData.append("introduce", form.introduce);
    for (let i = 0; i < selectFiles.length; i++) {
      if (selectFiles[i]) {
        let ext = selectFiles[i].name.split(".").pop();
        formData.append(
          `image${i}`,
          selectFiles[i],
          `${schoolid}_image_${i}.${ext}`
        );
      }
    }
    setIsLoading(true);
    //Set up the config
    const config = {
      //Here is where I have the problem. This only works for the first file.
      onUploadProgress: function (progressEvent) {
        let percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setPercentage(percentCompleted);
      },
      headers: {
        "Content-Type": "multipart/form-data"
      }
    };
    http
      .post("/sapling/process_new_school", formData, config)
      .then((response) => {
        if (response.data.result === 0) {
          setIsLoading(false);
          setPercentage(0);
          onChange({
            schoolid: schoolid,
            name: form.name,
            introduce: form.introduce
          });
          onClose();
        } else {
          setIsLoading(false);
          setMessage({
            ...message,
            show: true,
            text: `错误代码：${response.data.result}`
          });
        }
      })
      .catch((e) => {
        setIsLoading(false);
        setPercentage(0);
        setMessage({ ...message, show: true, text: e.toJSON().message });
      });
  };

  return (
    <Modal title="新增幼儿园" show={show} onClose={onClose}>
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
        <div className="form__div">
          <input
            id="add-school_edit_id"
            name="add-school_edit_id"
            type="text"
            className="form__input"
            required
            placeholder=" "
            onChange={(e) => setField("name", e.target.value)}
          />
          <label className="form__label" htmlFor="add-school_edit_id">
            请输入幼儿园名称
          </label>
        </div>
        <label className="note" htmlFor="school_pics_container">
          注意：上传的图片文件必须是JPG或PNG格式，选择的文件数不能超过4个
        </label>
        <div className="school_pics_container">
          <div className="school_pic abs_1">
            <label htmlFor="school_pic_upload_1">
              <img
                ref={refPics[0]}
                src="https://localhost/imgs/16by9.png"
                alt="第一张图"
              />
            </label>
            <input
              type="file"
              id="school_pic_upload_1"
              accept="image/png, image/jpeg"
              onChange={handleSelectFiles}
            />
          </div>
          <div className="school_pic abs_2">
            <label htmlFor="school_pic_upload_2">
              <img
                ref={refPics[1]}
                src="https://localhost/imgs/16by9.png"
                alt="第二张图"
              />
            </label>
            <input
              type="file"
              id="school_pic_upload_2"
              accept="image/png, image/jpeg"
              onChange={handleSelectFiles}
            />
          </div>
          <div className="school_pic abs_3">
            <label htmlFor="school_pic_upload_3">
              <img
                ref={refPics[2]}
                src="https://localhost/imgs/16by9.png"
                alt="第三张图"
              />
            </label>
            <input
              type="file"
              id="school_pic_upload_3"
              accept="image/png, image/jpeg"
              onChange={handleSelectFiles}
            />
          </div>
          <div className="school_pic abs_4">
            <label htmlFor="school_pic_upload_4">
              <img
                ref={refPics[3]}
                src="https://localhost/imgs/16by9.png"
                alt="第四张图"
              />
            </label>
            <input
              type="file"
              id="school_pic_upload_4"
              accept="image/png, image/jpeg"
              onChange={handleSelectFiles}
            />
          </div>
        </div>

        <textarea
          as="textarea"
          placeholder="请输入幼儿园介绍说明"
          onChange={(e) => setField("introduce", e.target.value)}
        />

        {!isLoading ? (
          <button
            ref={refConfirm}
            type="submit"
            disabled={isLoading}
            className="tooltip"
          >
            确 认
            <ASTooltip
              placement="top"
              show={message.show}
              delay={5000}
              onClose={() => setMessage({ ...message, show: false })}
            >
              {message.text}
            </ASTooltip>
          </button>
        ) : (
          <Progressbar now={percentage} />
        )}
      </form>
    </Modal>
  );
};
export default AddSchool;

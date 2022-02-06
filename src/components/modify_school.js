import React from "react";
import http from "../http_common";
import Modal from "./modal";
import "./common.css";
import "./floating_label.css";
import "./school_pics.css";
export default function ModifySchool(props) {
  const { show, school, onClose, onChange } = props;
  const [name, setName] = React.useState("");
  const [introduce, setIntroduce] = React.useState("");
  const [selectFiles, setSelectFiles] = React.useState(new Array(4));
  const [refPics, setRefPics] = React.useState(new Array(4));
  React.useEffect(() => {
    if (school) {
      setName(school.name);
      setIntroduce(school.introduce);
      // add or remove refs
      setRefPics((elPicRefs) =>
        Array(4)
          .fill()
          .map((_, i) => elPicRefs[i] || React.createRef())
      );
    }
  }, [school]);

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
    console.log(idx - 1);
    refPics[idx - 1].current.src = URL.createObjectURL(selectFile);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let uschool = { ...school };
    let mfields = {};
    mfields.schoolid = school.schoolid;
    mfields.changes = [];
    if (school.name !== name) {
      mfields.changes.push({ name: "name", value: name });
      uschool.name = name;
    }
    if (school.introduce !== introduce) {
      mfields.changes.push({ name: "introduce", vlaue: introduce });
      uschool.introduce = introduce;
    }
    if (mfields.changes.length === 0) return;

    http
      .post("/sapling/modify_school", mfields)
      .then((response) => {
        if (response.data.result === 0) {
          /// Modify successed!
          onChange(uschool);
          onClose();
        }
      })
      .catch((e) => console.error("Error:", e));
  };
  return (
    <Modal title="修改幼儿园信息" show={show} onClose={onClose}>
      <div className="formContainer">
        <div className="form__div">
          <input
            type="text"
            id="edit_sapling_name"
            name="edit_sapling_name"
            className="form__input"
            value={name}
            placeholder=" "
            onChange={(e) => setName(e.target.value)}
          />
          <label className="form__label" htmlFor="edit_sapling_name">
            幼儿园名称
          </label>
        </div>
        <div className="school_pics_container">
          <div className="school_pic abs_1">
            <label for="school_pic_upload_1">
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
            <label for="school_pic_upload_2">
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
            <label for="school_pic_upload_3">
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
            <label for="school_pic_upload_4">
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
          value={introduce}
          placeholder="幼儿园介绍说明"
          onChange={(e) => setIntroduce(e.target.value)}
        />
        <button type="submit" onClick={handleSubmit}>
          修 改
        </button>
      </div>
    </Modal>
  );
}

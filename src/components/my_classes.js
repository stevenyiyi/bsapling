import React from "react";
import { FaPen, FaTimes, FaList } from "react-icons/fa";
import MySchoolsSelect from "./my_schools_select";
import http from "../http_common";
import ModifyClass from "./modify_class";
import AddClass from "./add_class";
import ASTooltip from "./as_tootip";
import "./common.css";
export default function MyClasses(props) {
  const [schoolid, setSchoolid] = React.useState("");
  const [data, setData] = React.useState(null);
  const [edClass, setEdclass] = React.useState({
    index: 0,
    show: false
  });
  const [addClassShow, setAddClassShow] = React.useState(false);
  const [message, setMessage] = React.useState({ show: false, text: "" });
  const [myCameras, setMyCameras] = React.useState([]);
  const refConfirm = React.useRef(null);
  React.useEffect(() => {
    if (schoolid) {
      http
        .get(`/sapling/get_classes?schoolid=${schoolid}`)
        .then((response) => {
          if (response.data.result === 0) {
            let mdata = response.data.classes.map((c) => ({
              ...c,
              openCamList: false
            }));
            setData(mdata);
          } else {
            setMessage({
              ...message,
              show: true,
              text: `服务器返回错误:${response.data.result}`
            });
          }
        })
        .catch((e) =>
          setMessage({ ...message, show: true, text: e.toJSON().message })
        );
    }
  }, [schoolid, message]);

  React.useEffect(() => {
    http
      .post("/sapling/get_my_cameras")
      .then((response) => {
        setMyCameras(response.data.cameras);
      })
      .catch((e) =>
        setMessage({ ...message, show: true, text: e.toJSON().message })
      );
  }, []);
  const handleEditClick = (idx) => {
    setEdclass({ ...edClass, index: idx, show: true });
  };

  const handleDeleteClick = (idx) => {};
  /// Click list owner cameras
  const handleListClick = (idx) => {
    if (data[idx].cameras) {
      let cdata = [...data];
      cdata[idx].openCamList = !cdata[idx].openCamList;
      setData(cdata);
    }
  };

  const genCamList = (idx) => {
    return (
      <ul>
        {data[idx].cameras &&
          data[idx].cameras.map((cam) => (
            <li key={cam.deviceid}>{cam.name}</li>
          ))}
      </ul>
    );
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    if (schoolid) {
      setAddClassShow(true);
    } else {
      setMessage({ ...message, show: true, text: "请选择学校!" });
    }
  };
  const handleAddClass = (adclass) => {
    setData([...data, adclass]);
  };
  const handleModifyClass = (edclass) => {
    let items = [...data];
    items[edClass.index] = edclass;
    setData(items);
  };

  return (
    <div className="tableContainer">
      <div className="tableHeader">
        <MySchoolsSelect value={schoolid} onSelectChange={setSchoolid} />
        <button
          className="tooltip normal_btn"
          type="submit"
          onClick={handleAddClick}
        >
          新 增
          <ASTooltip
            placement="bottom"
            delay={5000}
            show={message.show}
            onClose={() => setMessage({ ...message, show: false })}
          >
            {message.text}
          </ASTooltip>
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <td>操作</td>
            <td>班级名称</td>
            <td>关联摄像头</td>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((el, idx) => (
              <tr key={idx}>
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
                <td>{el.name}</td>
                <td>
                  <span
                    ref={refConfirm}
                    className="tooltip circle_span"
                    onClick={(e) => handleListClick(idx)}
                  >
                    <FaList />
                    <ASTooltip
                      placement="bottom"
                      delay={5000}
                      show={data[idx].openCamList}
                      onClose={() => {
                        let cdata = [...data];
                        cdata[idx] = { ...cdata[idx], openCamList: false };
                        setData(cdata);
                      }}
                    >
                      {genCamList(idx)}
                    </ASTooltip>
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {data && (
        <ModifyClass
          schoolid={schoolid}
          show={edClass.show}
          cameras={myCameras}
          classinfo={data[edClass.index]}
          onClose={() => setEdclass({ ...edClass, show: false })}
          onChange={handleModifyClass}
        />
      )}
      {schoolid && (
        <AddClass
          schoolid={schoolid}
          show={addClassShow}
          onClose={() => setAddClassShow(false)}
          onChange={handleAddClass}
        />
      )}
    </div>
  );
}

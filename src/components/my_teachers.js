import React from "react";
import { FaPen, FaTimes } from "react-icons/fa";
import MySchoolsSelect from "./my_schools_select";
import http from "../http_common";
import AddTeacher from "./add_teacher";
import ModifyTeacher from "./modify_teacher";
import ASTooltip from "./as_tootip";
import "./common.css";
export default function MyTeachers(props) {
  const [schoolid, setSchoolid] = React.useState("");
  const [data, setData] = React.useState(null);
  const [classes, setClasses] = React.useState([]);
  const [edTeacher, setEdTeacher] = React.useState({
    index: 0,
    show: false
  });
  const [addTeacherShow, setAddTeacherShow] = React.useState(false);
  const [message, setMessage] = React.useState({ show: false, text: "" });
  React.useEffect(() => {
    if (schoolid) {
      /// get teachers list
      http
        .get(`/sapling/get_teachers?schoolid=${schoolid}`)
        .then((response) => {
          if (response.data.result === 0) {
            setData(response.data.teachers);
          } else {
            console.log(`服务器返回错误:${response.data.result}`);
          }
        })
        .catch((e) => console.error("Error:", e));
      /// get classes list
      http
        .get("/sapling/get_classes", {
          params: { schoolid: schoolid, simple: true }
        })
        .then((reponse) => {
          setClasses(reponse.data.classes);
        })
        .catch((e) => {
          console.error("Error:", e);
        });
    }
  }, [schoolid]);

  const getDisplayName = (key) => {
    console.log(`getDisplayName, key:${key}`);
    let name = "";
    for (const cls of classes) {
      if (cls.classid === key) {
        name = cls.name;
        break;
      }
    }
    return name;
  };

  const genClassNames = (clss) => {
    let ids = clss.map((cls) => getDisplayName(cls));
    return ids.join();
  };

  const handleSchoolSelected = (value) => {
    console.log(value);
    setSchoolid(value);
  };

  const handleEditClick = (idx) => {
    setEdTeacher({ ...edTeacher, index: idx, show: true });
  };

  const handleDeleteClick = (idx) => {
    /// 删除教师信息
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    if (!schoolid) {
      setMessage({ ...message, show: true, text: "请选择学校和班级!" });
    } else {
      setAddTeacherShow(true);
    }
  };
  const handleAddTeacher = (adteacher) => {
    setData([...data, adteacher]);
  };
  const handleModifyTeacher = (edteacher) => {
    let items = [...data];
    items[edTeacher.index] = edteacher;
    setData(items);
  };
  return (
    <div className="tableContainer">
      <div className="tableHeader">
        <MySchoolsSelect
          value={schoolid}
          onSelectChange={handleSchoolSelected}
        />
        <button
          type="submit"
          className="tooltip normal_btn"
          onClick={handleAddClick}
        >
          新增
          <ASTooltip
            placement="bottom"
            show={message.show}
            delay={5000}
            onClose={() => setMessage({ ...message, show: false })}
          >
            {message.text}
          </ASTooltip>
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>操作</th>
            <th>姓名</th>
            <th>电话</th>
            <th>班级</th>
            <th>介绍</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((el, idx) => (
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
                <td>{el.nick_name}</td>
                <td>{el.username}</td>
                <td>{genClassNames(el["classes"])}</td>
                <td>{el.note}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {schoolid && (
        <AddTeacher
          classes={classes}
          placement="start"
          show={addTeacherShow}
          onClose={() => setAddTeacherShow(false)}
          onChange={handleAddTeacher}
        />
      )}
      {data && (
        <ModifyTeacher
          classes={classes}
          show={edTeacher.show}
          teacher={data[edTeacher.index]}
          onClose={() => setEdTeacher({ ...edTeacher, show: false })}
          onChange={handleModifyTeacher}
        />
      )}
    </div>
  );
}

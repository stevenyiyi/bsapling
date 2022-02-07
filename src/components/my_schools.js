import React from "react";
import { FaPen, FaFileExport } from "react-icons/fa";
import ModifySchool from "./modify_school";
import AddSchool from "./add_school";
import http from "../http_common";
import { useSnackbar } from "./use_snackbar";
import "./common.css";
export default function MySchools(props) {
  const [data, setData] = React.useState([]);
  const [edschool, setEdschool] = React.useState({
    index: 0,
    show: false
  });
  const [addSchoolShow, setAddSchoolShow] = React.useState(false);
  /// 导出用户状态参数
  const [exportState, setExportState] = React.useState({
    export: false,
    schoolid: ""
  });

  const refOpenSnackbar = React.useRef(useSnackbar()[0]);
  React.useEffect(() => {
    http
      .get("/sapling/get_schools")
      .then((response) => {
        if (response.data.result === 0) {
          setData(response.data.schools);
        } else {
          refOpenSnackbar.current(`服务器返回错误:${response.data.result}`);
        }
      })
      .catch((e) => refOpenSnackbar.current(e.toJSON().message));
  }, []);

  React.useEffect(() => {
    if (exportState.export) {
      http
        .get(`/sapling/export_school?schoolid=${exportState.schoolid}`)
        .then((response) => {
          if (response.data.result === 0) {
            /// 导出成功
            let a = document.createElement("a");
            a.href = response.data.furl;
            a.download = "download";
            a.click();
          } else {
            refOpenSnackbar.current(`服务器返回错误:${response.data.result}`);
          }
        })
        .catch((e) => refOpenSnackbar.current(e.toJSON().message));
    }
  }, [exportState]);
  /// 修改学校信息
  const handleEditClick = (idx) => {
    setEdschool({ ...edschool, index: idx, show: true });
  };

  /// 导出学校信息
  const handleExportClick = (idx) => {
    setExportState({
      ...exportState,
      export: true,
      schoolid: data[idx].schoolid
    });
  };

  const handleAddClick = (event) => {
    event.preventDefault();
    setAddSchoolShow(true);
  };

  const handleAddSchool = (adschool) => {
    setData([...data, adschool]);
  };

  const handleModifySchool = (editem) => {
    let items = [...data];
    items[edschool.index] = editem;
    setData(items);
  };

  return (
    <div className="formContainer">
      <table>
        <thead>
          <tr>
            <th>操作</th>
            <th>学校ID</th>
            <th>学校名称</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((el, idx) => (
              <tr key={el.schoolid}>
                <td>
                  <span
                    className="circle_span"
                    onClick={(e) => handleEditClick(idx)}
                  >
                    <FaPen />
                  </span>
                  <span
                    className="circle_span"
                    onClick={(e) => handleExportClick(idx)}
                  >
                    <FaFileExport />
                  </span>
                </td>
                <td>{el.schoolid}</td>
                <td>{el.name}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <button className="btn" type="submit" onClick={handleAddClick}>
        新 增
      </button>
      <ModifySchool
        show={edschool.show}
        school={data[edschool.index]}
        onClose={() => setEdschool({ ...edschool, show: false })}
        onChange={handleModifySchool}
      />
      <AddSchool
        show={addSchoolShow}
        onClose={() => setAddSchoolShow(false)}
        onChange={handleAddSchool}
      />
    </div>
  );
}

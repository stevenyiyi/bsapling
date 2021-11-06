import React from "react";
import PropTypes from "prop-types";
import http from "../http_common";
import ASSelect from "./as_select";
export default function MySchoolsSelect(props) {
  const { value, onSelectChange } = props;
  const [schools, setSchools] = React.useState([]);

  React.useEffect(() => {
    http
      .get("/sapling/get_schools")
      .then((response) => {
        if (response.data.result === 0) {
          setSchools(response.data.schools);
        } else {
          console.log(`服务器返回错误:${response.data.result}`);
        }
      })
      .catch((e) => {
        console.error("Error:", e);
        setSchools([
          { schoolid: "5234523452435234", name: "北部天天幼儿园" },
          { schoolid: "5234523452435235", name: "北部天天幼儿园" },
          { schoolid: "5234523452435236", name: "北部天天幼儿园" }
        ]);
      });
  }, []);

  return (
    <ASSelect
      title="选择幼儿园"
      items={schools}
      kvmap={{ key: "schoolid", value: "name" }}
      selectedKey={value}
      onChange={onSelectChange}
    />
  );
}
MySchoolsSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onSelectChange: PropTypes.func.isRequired
};
MySchoolsSelect.defaultProps = {
  value: "",
  onSelectChange: (v) => {}
};

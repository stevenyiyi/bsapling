import React from "react";
import PropTypes from "prop-types";
import ASSelect from "./as_select";
import http from "../http_common";
const MyClassSelect = React.forwardRef((props, ref) => {
  const { schoolid, value, onSelectChange } = props;
  const [classes, setClasses] = React.useState([]);

  React.useEffect(() => {
    console.log("useeffect");
    http
      .get("/sapling/get_classes", { params: { schoolid: schoolid } })
      .then((reponse) => {
        setClasses(reponse.data.classes);
      })
      .catch((e) => {
        console.error("Error:", e);
      });
  }, [schoolid]);

  /// expose function getDisplayName
  React.useImperativeHandle(ref, () => ({
    getDisplayName: (key) => {
      console.log(`getDisplayName, key:${key}`);
      let name = "";
      for (const cls of classes) {
        if (cls.classid === key) {
          name = cls.name;
          break;
        }
      }
      return name;
    }
  }));

  return (
    <ASSelect
      title="选择班级"
      kvmap={{ key: "classid", value: "name" }}
      items={classes}
      selectedKey={value}
      onChange={onSelectChange}
    />
  );
});

MyClassSelect.propTypes = {
  schoolid: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onSelectChange: PropTypes.func.isRequired
};
MyClassSelect.defaultProps = {
  schoolid: "",
  value: "",
  onSelectChange: (v) => {}
};

export default MyClassSelect;

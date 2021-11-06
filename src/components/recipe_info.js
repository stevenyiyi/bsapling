import React from "react";
import MySchoolsSelect from "./my_schools_select";
import http from "../http_common";
import ASTooltip from "./as_tootip";
import "./common.css";
export default function RecipeInfo() {
  const [schoolid, setSchoolid] = React.useState("");
  const [form, setForm] = React.useState({
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: ""
  });
  const [message, setMessage] = React.useState({
    show: false,
    text: ""
  });

  React.useEffect(() => {
    if (schoolid) {
      http
        .get(`/sapling/get_recipes?shcoolid=${schoolid}`)
        .then((response) => {
          if (response.data.result === 0) {
            if (response.data.recipes) {
              setForm(response.data.recipes);
            }
          } else {
            console.log(`Response error code:${response.data.result}`);
          }
        })
        .catch((e) => console.error("Error:", e));
    }
  }, [schoolid]);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = (event) => {
    event.defaultPrevent();
    let req = { shcoolid: schoolid, recipes: form };
    http
      .post("/sapling/post_recipes", req)
      .then((response) => {
        if (response.data.result === 0) {
          setMessage({ ...message, show: true, text: "添加或修改菜谱成功!" });
        } else {
          setMessage({
            ...message,
            show: true,
            text: `服务器返回错误代码:${response.data.result}`
          });
        }
      })
      .catch((e) => {
        setMessage({ ...message, show: true, text: e.toJSON().message });
      });
  };

  return (
    <form className="formContainer" onSubmit={handleSubmit}>
      <MySchoolsSelect value={schoolid} onSelectChange={setSchoolid} />
      <textarea
        id="monday"
        required
        placeholder="周一食谱"
        value={form.monday}
        onChange={handleChange}
      />
      <textarea
        id="tuesday"
        value={form.tuesday}
        required
        placeholder="周二食谱"
        onChange={handleChange}
      />
      <textarea
        id="wednesday"
        value={form.wednesday}
        required
        placeholder="周三食谱"
        onChange={handleChange}
      />
      <textarea
        id="thursday"
        value={form.thursday}
        required
        placeholder="周四食谱"
        onChange={handleChange}
      />
      <textarea
        id="friday"
        value={form.friday}
        required
        placeholder="周五食谱"
        onChange={handleChange}
      />
      <button className="tooltip btn" type="submit">
        确认
        <ASTooltip
          show={message.show}
          delay={5000}
          onClose={() => setMessage({ ...message, show: false })}
        >
          {message.text}
        </ASTooltip>
      </button>
    </form>
  );
}

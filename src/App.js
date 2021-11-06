import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Header from "./components/header";
import MyClasses from "./components/my_classes";
import MyTeachers from "./components/my_teachers";
import MyStudents from "./components/my_students";
import RecipeInfo from "./components/recipe_info";
import MyDevices from "./components/my_devices";
import MySubusers from "./components/my_subusers";
import Login from "./components/login";
import Registration from "./components/registration";
import MySchools from "./components/my_schools";
import { UserContext } from "./user_context";
const App = (props) => {
  const updateUser = (user) => {
    setCuser({ ...cuser, user: user });
  };
  const [cuser, setCuser] = React.useState({
    user: props.user,
    updateUser: updateUser
  });

  return (
    <Router>
      <UserContext.Provider value={cuser}>
        {cuser.user.username ? (
          <div>
            <Header />
            <div className="content">
              <Routes>
                <Route path="/" element={<Navigate to="/my_schools" />} />
                <Route path="/my_schools" element={<MySchools />} />
                <Route path="/my_teachers" element={<MyTeachers />} />
                <Route path="/my_classes" element={<MyClasses />} />
                <Route path="/my_students" element={<MyStudents />} />
                <Route path="/recipe_info" element={<RecipeInfo />} />
                <Route path="/my_devices" element={<MyDevices />} />
                <Route path="/my_subusers" element={<MySubusers />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registration" element={<Registration />} />
          </Routes>
        )}
      </UserContext.Provider>
    </Router>
  );
};
export default App;

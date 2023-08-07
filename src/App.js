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
import { default as SnackbarProvider } from "./components/snackbar";
import "./components/sidebar.css";
const App = (props) => {
  const updateUser = (user) => {
    setUserContext({ ...userContext, user: user });
  };

  const [userContext, setUserContext] = React.useState({
    user: props.userCookie,
    updateUser: updateUser
  });

  console.log(userContext);
  return (
    <Router>
      <UserContext.Provider value={userContext}>
        <SnackbarProvider>
          {userContext.user.is_login ? (
            <div>
              <Header />
              <div className="content">
                <Routes>
                  <Route path="/" element={<Navigate to="/my_devices" />} />
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
        </SnackbarProvider>
      </UserContext.Provider>
    </Router>
  );
};
export default App;

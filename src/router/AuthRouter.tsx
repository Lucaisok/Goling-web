import { Route, Routes } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import ResetPassword from "../components/ResetPassword";
import SelectLanguage from "../components/SelectLanguage";

export default function AuthRouter() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset_password" element={<ResetPassword />} />
            {/* <Route path="/select-language" element={<SelectLanguage />} /> */}
        </Routes>
    );
}
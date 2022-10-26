import { Route, Routes } from "react-router-dom";
import Home from "../components/Home";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    );
}
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import NoMatch from "../pages/NoMatch";
import HomePage from "../pages/HomePage";
import Dashboard from "../pages/Dashboard"
import GameDetail from "../pages/GameDetail";
import Profile from "../pages/Profile";

export default function Router() {
    return (
    <BrowserRouter>
        <Routes>
            <Route path="/p79">
                <Route index element={<HomePage />} />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="gamedetail/:id" element={<GameDetail />} />
                <Route path="profile" element={<Profile />} />
                <Route path="*" element={<NoMatch />} />
            </Route>
        </Routes>
    </BrowserRouter>
    );
}

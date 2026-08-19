import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Skills from "../pages/Skills";
import Projects from "../pages/Projects";
import DailyLogs from "../pages/DailyLogs";
import Notes from "../pages/Notes";
import Milestones from "../pages/Milestones";

import ProtectedRoute from "./ProtectedRoute";


function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ================================================= */}
                {/* PUBLIC ROUTES */}
                {/* ================================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ================================================= */}
                {/* PROTECTED ROUTES */}
                {/* ================================================= */}

                <Route
                    element={<ProtectedRoute />}
                >

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/skills"
                        element={<Skills />}
                    />

                    <Route
                        path="/projects"
                        element={<Projects />}
                    />

                    <Route
                        path="/projects/:projectId/milestones"
                        element={<Milestones />}
                    />

                    <Route
                        path="/daily-logs"
                        element={<DailyLogs />}
                    />

                    <Route
                        path="/notes"
                        element={<Notes />}
                    />

                </Route>


                {/* ================================================= */}
                {/* DEFAULT */}
                {/* ================================================= */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />


                {/* ================================================= */}
                {/* UNKNOWN ROUTE */}
                {/* ================================================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default AppRoutes;
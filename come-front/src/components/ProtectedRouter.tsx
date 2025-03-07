// src/components/ProtectedRouter.tsx

import { UserRole } from "../constants/roles";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouter = ({ requiredRole }: { requiredRole? : UserRole }) => {
    console.log("C");
    const token = localStorage.getItem("token");
    const userRole = Number(localStorage.getItem("role")) as UserRole;

    if (!token || requiredRole !== undefined && userRole !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />
}

export default ProtectedRouter;

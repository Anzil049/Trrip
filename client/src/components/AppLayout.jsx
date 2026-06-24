import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../state/AuthContext";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <TopBar user={user} onLogout={handleLogout} onMenuClick={() => setOpen(true)} />
      <Sidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
      <main className="container" style={{ padding: "28px 0 56px" }}>
        <Outlet />
      </main>
    </div>
  );
};

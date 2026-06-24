import { FileText, LayoutDashboard, LogOut, Settings, Share2, Upload } from "lucide-react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "Create Itinerary", icon: Upload },
  { to: "/itineraries", label: "My Itineraries", icon: FileText },
  { to: "/shared", label: "Shared", icon: Share2 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ onLogout, open, onClose }) => {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-overlay" onClick={onClose} />
      <div className="sidebar-panel glass">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <strong>Trrip AI</strong>
          <button className="icon-btn mobile-only" onClick={onClose} type="button" aria-label="Close menu">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onClose}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <button 
            className="sidebar-link" 
            onClick={() => {
              toast((t) => (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <span style={{ fontWeight: 500 }}>Are you sure you want to log out?</span>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                      onClick={() => toast.dismiss(t.id)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: "4px 8px", fontSize: "0.85rem", background: "#ef4444", color: "white", borderColor: "#ef4444" }}
                      onClick={() => {
                        toast.dismiss(t.id);
                        onLogout();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ), { duration: 5000 });
            }} 
            type="button" 
            style={{ width: "100%", border: 0, background: "transparent" }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

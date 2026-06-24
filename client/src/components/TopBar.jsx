import { Bell, Menu, Search, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { api } from "../utils/api";
import logo from "../images/logo.png";
import toast from "react-hot-toast";

export const TopBar = ({ onMenuClick, user, onLogout }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await api.get(`/itineraries/search?q=${encodeURIComponent(query)}`);
        setResults(data.itineraries || []);
      } catch (err) {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <header className="glass" style={{ position: "sticky", top: 0, zIndex: 20 }}>
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
        <Link to="/" className="brand-mark" style={{ flexShrink: 0 }}>
          <img className="brand-logo" src={logo} alt="Trrip" style={{ height: 48 }} />
        </Link>

        <div style={{ position: "relative", flex: 1, maxWidth: 400, margin: "0 20px" }} ref={dropdownRef}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: 12 }} />
            <input 
              type="text" 
              placeholder="Search destinations or creators..." 
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 20,
                border: "1px solid #e2e8f0",
                fontSize: "0.9rem",
                outline: "none",
                background: "rgba(255,255,255,0.8)",
                color: "#1e293b",
              }}
            />
          </div>
          {showDropdown && (query.trim() !== "") && (
            <div className="card panel" style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: 8, padding: 8, zIndex: 100, maxHeight: 300, overflowY: "auto", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
              {results.length === 0 ? (
                <div style={{ padding: 12, color: "#64748b", fontSize: "0.9rem", textAlign: "center" }}>No itineraries found</div>
              ) : (
                results.map(itinerary => (
                  <div 
                    key={itinerary._id}
                    onClick={() => {
                      navigate(`/itineraries/${itinerary._id}`);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "background 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ background: "#e2e8f0", padding: 8, borderRadius: 8 }}>
                      <MapPin size={16} color="#475569" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#334155" }}>{itinerary.destination}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>by {itinerary.user?.name || "Unknown"}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <Link 
            to="/#builder" 
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            style={{ background: "white", color: "#2563eb", padding: "6px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.9rem", border: "1px solid #e2e8f0", textDecoration: "none", transition: "all 0.2s" }} 
            onMouseOver={(e) => e.currentTarget.style.borderColor = "#2563eb"} 
            onMouseOut={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
          >
            Create Itinerary
          </Link>
          {user ? (
            <button 
              className="btn btn-ghost" 
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
              style={{ padding: "6px 16px", height: "auto", fontSize: "0.9rem", borderRadius: "8px", fontWeight: 600 }}
            >
              Logout
            </button>
          ) : (
            <Link className="btn btn-primary" to="/login" style={{ padding: "6px 16px", height: "auto", fontSize: "0.9rem", borderRadius: "8px", fontWeight: 600 }}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

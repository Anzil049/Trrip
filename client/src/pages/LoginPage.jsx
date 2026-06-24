import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../state/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/login", form);
      setUser(data.user);
      navigate(location.state?.from || "/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="eyebrow">Welcome back</div>
      <h2 className="title-lg" style={{ marginTop: 16 }}>
        Sign in to your itinerary workspace
      </h2>
      <p className="muted" style={{ marginTop: 8 }}>
        Access your generated itineraries and create new trip plans.
      </p>
      <form onSubmit={submit} style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="name@company.com"
            required
          />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="label" htmlFor="password" style={{ marginBottom: 0 }}>
              Password
            </label>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative", marginTop: 8 }}>
            <input
              id="password"
              className="input"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              style={{ paddingRight: 40 }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                color: "#64748b"
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error ? (
          <div className="panel" style={{ borderColor: "rgba(184, 43, 43, 0.22)", color: "#b82b2b", background: "rgba(184, 43, 43, 0.05)" }}>
            {error}
          </div>
        ) : null}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 18 }}>
        No account yet? <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700 }}>Create one</Link>
      </p>
    </>
  );
};

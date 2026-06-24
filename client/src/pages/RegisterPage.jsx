import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../state/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [step, setStep] = useState("details");
  const [verificationId, setVerificationId] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/register", form);
      setVerificationId(data.verificationId);
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/verify-otp", {
        verificationId,
        otp: otp.join(""),
      });
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
      <div className="eyebrow">Create account</div>
      <h2 className="title-lg" style={{ marginTop: 16 }}>
        Start with your travel planner
      </h2>
      <p className="muted" style={{ marginTop: 8 }}>
        Create your account, verify your email, and begin generating itineraries.
      </p>

      {step === "details" ? (
        <form onSubmit={submitDetails} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ramandeep Singh"
              required
            />
          </div>
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
            <label className="label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="At least 6 characters"
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
            {loading ? "Sending code..." : "Send verification code"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitOtp} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div className="panel" style={{ background: "rgba(0,97,163,0.04)" }}>
            We sent a 6-digit code to <strong>{form.email}</strong>.
          </div>
          <div>
            <label className="label">
              Verification code
            </label>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 8 }}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  className="input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  style={{ width: "48px", height: "54px", textAlign: "center", fontSize: "1.2rem", padding: 0 }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length > 1) {
                      const pasted = val.slice(0, 6).split("");
                      const newOtp = [...otp];
                      pasted.forEach((c, i) => newOtp[i] = c);
                      setOtp(newOtp);
                      const focusIdx = Math.min(5, pasted.length);
                      document.getElementById(`otp-${focusIdx}`)?.focus();
                      return;
                    }
                    const newOtp = [...otp];
                    newOtp[idx] = val.slice(-1);
                    setOtp(newOtp);
                    if (val && idx < 5) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  required
                />
              ))}
            </div>
          </div>
          {error ? (
            <div className="panel" style={{ borderColor: "rgba(184, 43, 43, 0.22)", color: "#b82b2b", background: "rgba(184, 43, 43, 0.05)" }}>
              {error}
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify and continue"}
          </button>
        </form>
      )}

      <p className="muted" style={{ marginTop: 18 }}>
        Already registered? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
      </p>
    </>
  );
};

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../state/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [step, setStep] = useState("email"); // 'email' | 'otp' | 'password'
  const [email, setEmail] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/forgot-password", { email });
      setVerificationId(data.verificationId);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/verify-reset-otp", {
        verificationId,
        otp: otp.join(""),
      });
      setStep("password");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.post("/auth/reset-password", {
        verificationId,
        password: newPassword,
      });
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="eyebrow">Account recovery</div>
      <h2 className="title-lg" style={{ marginTop: 16 }}>
        Reset your password
      </h2>
      <p className="muted" style={{ marginTop: 8 }}>
        {step === "email" && "Enter your email address to receive a verification code."}
        {step === "otp" && "Enter the 6-digit verification code sent to your email."}
        {step === "password" && "Enter your new password to regain access to your account."}
      </p>

      {step === "email" && (
        <form onSubmit={requestReset} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
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
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div className="panel" style={{ background: "rgba(0,97,163,0.04)" }}>
            We sent a 6-digit code to <strong>{email}</strong>.
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
            {loading ? "Verifying..." : "Verify code"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={resetPassword} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div>
            <label className="label" htmlFor="password">
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                className="input"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            {loading ? "Updating password..." : "Reset password & Sign in"}
          </button>
        </form>
      )}

      <p className="muted" style={{ marginTop: 18 }}>
        Remembered your password? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>Sign in</Link>
      </p>
    </>
  );
};

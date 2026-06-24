import { Outlet, Link } from "react-router-dom";
import logo from "../images/logo.png";

export const AuthLayout = () => {
  return (
    <div className="app-shell" style={{ padding: 16 }}>
      <div className="container" style={{ minHeight: "calc(100vh - 32px)", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18, alignItems: "stretch" }}>
        <section className="hero-frame" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="brand-mark" style={{ color: "#fff" }}>
            <Link to="/">
              <img className="brand-logo" src={logo} alt="Trrip" style={{ height: 64, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
            </Link>
          </div>
          <div style={{ position: "relative", zIndex: 1, maxWidth: 540 }}>
            <div className="eyebrow" style={{ background: "rgba(255,255,255,0.14)", color: "#fff" }}>
              Smart travel planning
            </div>
            <h1 className="title-xl" style={{ marginTop: 18 }}>
              Your next itinerary, organized in one place.
            </h1>
            <p style={{ maxWidth: 500, fontSize: "1.03rem", lineHeight: 1.7, opacity: 0.92 }}>
              Upload travel details, capture the important information, and turn them into a polished itinerary you can share or revisit anytime.
            </p>
          </div>
          <div style={{ display: "grid", gap: 12, position: "relative", zIndex: 1 }}>
            <div className="glass" style={{ borderRadius: 18, padding: 16, color: "#fff", background: "rgba(255,255,255,0.12)" }}>
              Built for planning trips, organizing details, and sharing trip plans with ease.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <span className="chip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                Auth
              </span>
              <span className="chip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                Uploads
              </span>
              <span className="chip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                Itineraries
              </span>
            </div>
          </div>
        </section>
        <section className="card" style={{ padding: 28, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Outlet />
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <Link to="/" className="btn btn-link">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

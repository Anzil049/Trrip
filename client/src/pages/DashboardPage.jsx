import { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext";
import { api } from "../utils/api";
import { StatsStrip } from "../components/StatsStrip";
import { ItineraryCard } from "../components/ItineraryCard";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/itineraries")
      .then((data) => {
        if (active) setItineraries(data.itineraries || []);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: "Itineraries", value: itineraries.length, help: "Saved trips" },
    { label: "Shared", value: itineraries.filter((item) => item.isPublic).length, help: "Public share links" },
    { label: "Traveler", value: user?.name || "Guest", help: "Logged in session" },
  ];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this itinerary?")) {
      try {
        await api.delete(`/itineraries/${id}`);
        setItineraries(prev => prev.filter(i => i._id !== id));
      } catch (err) {
        console.error("Failed to delete itinerary:", err);
      }
    }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section className="panel card" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18, alignItems: "center" }}>
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="title-xl" style={{ fontSize: "clamp(2rem, 2.4vw, 3.4rem)", marginTop: 14 }}>
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.
          </h1>
          <p className="muted" style={{ marginTop: 12, maxWidth: 620 }}>
            Review previous itineraries, upload new bookings, or turn a trip into a shareable plan in a single flow.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" to="/upload">
              Create itinerary
            </Link>
            <Link className="btn btn-ghost" to="/itineraries">
              Browse history
            </Link>
          </div>
        </div>
        <div className="card panel" style={{ background: "linear-gradient(145deg, rgba(0,97,163,0.12), rgba(240,184,75,0.12))" }}>
          <strong className="chip">Trip workspace</strong>
          <p style={{ marginTop: 14, marginBottom: 0 }}>
            Your personal travel hub. Easily organize, review, and share all your upcoming itineraries in one convenient place.
          </p>
        </div>
      </section>

      <StatsStrip stats={stats} />

      <section className="grid-bento grid-bento-12">
        <div className="card panel" style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div className="eyebrow">Your Trips</div>
              <h2 className="title-lg" style={{ marginTop: 14 }}>
                Generated itineraries
              </h2>
            </div>
            <Link className="btn btn-link" to="/upload">
              New upload
            </Link>
          </div>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 16 }}>
            {loading ? <p className="muted">Loading itineraries...</p> : null}
            {!loading && itineraries.length === 0 ? (
              <div className="upload-zone" style={{ textAlign: "left", gridColumn: "1 / -1" }}>
                <h3 className="title-md">No itineraries yet</h3>
                <p className="muted">Upload a booking document to generate your first AI itinerary.</p>
              </div>
            ) : null}
            {itineraries.slice(0, 6).map((itinerary) => (
              <ItineraryCard itinerary={itinerary} key={itinerary._id} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

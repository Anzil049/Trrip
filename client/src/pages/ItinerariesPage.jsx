import { useEffect, useState } from "react";
import { api } from "../utils/api";
import { ItineraryCard } from "../components/ItineraryCard";

export const ItinerariesPage = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    api.get("/itineraries").then((data) => setItineraries(data.itineraries || []));
  }, []);

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
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">History</div>
        <h1 className="title-lg" style={{ marginTop: 12 }}>
          Saved itineraries
        </h1>
      </div>
      <div className="grid-bento grid-bento-3">
        {itineraries.map((itinerary) => (
          <ItineraryCard itinerary={itinerary} key={itinerary._id} onDelete={handleDelete} />
        ))}
      </div>
      {!itineraries.length ? <p className="muted">No itineraries yet.</p> : null}
    </section>
  );
};

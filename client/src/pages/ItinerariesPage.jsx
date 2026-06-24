import { useEffect, useState } from "react";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import { ItineraryCard } from "../components/ItineraryCard";

export const ItinerariesPage = () => {
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    api.get("/itineraries").then((data) => setItineraries(data.itineraries || []));
  }, []);

  const handleDelete = (id) => {
    toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontWeight: 500 }}>Are you sure you want to delete this itinerary?</span>
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
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await api.delete(`/itineraries/${id}`);
                setItineraries(prev => prev.filter(i => i._id !== id));
                toast.success("Itinerary deleted");
              } catch (err) {
                console.error("Failed to delete itinerary:", err);
                toast.error("Failed to delete itinerary");
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ), { duration: 5000 });
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

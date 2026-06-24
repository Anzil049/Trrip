import { ChevronRight, Share2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../utils/api";

export const ItineraryCard = ({ itinerary, onDelete }) => {
  const handleShare = async () => {
    try {
      const data = await api.post(`/itineraries/${itinerary._id}/share`, {});
      await navigator.clipboard?.writeText(data.shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to share itinerary:", err);
      toast.error("Failed to share itinerary. Please try again.");
    }
  };
  return (
    <div className="card panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <h3 className="title-md">
            {itinerary.destination}
          </h3>
          <p className="muted" style={{ marginTop: 8 }}>
            {itinerary.durationDays || itinerary.itineraryDays?.length || 0} days
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" type="button" aria-label="Share itinerary" onClick={handleShare}>
            <Share2 size={16} />
          </button>
          {onDelete && (
            <button className="icon-btn" type="button" aria-label="Delete itinerary" onClick={() => onDelete(itinerary._id)}>
              <Trash2 size={16} color="#ef4444" />
            </button>
          )}
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: "0.86rem" }}>
          Created {new Date(itinerary.createdAt).toLocaleDateString()}
        </span>
        <Link className="btn btn-link" to={`/itineraries/${itinerary._id}`}>
          View <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

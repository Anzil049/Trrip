import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import { Copy, Share2 } from "lucide-react";

export const ItineraryDetailPage = () => {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get(`/itineraries/${id}`).then((data) => {
      if (active) setItinerary(data.itinerary);
    }).finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const share = async () => {
    const data = await api.post(`/itineraries/${id}/share`, {});
    setShareUrl(data.shareUrl);
    await navigator.clipboard?.writeText(data.shareUrl).catch(() => {});
  };

  if (loading) {
    return <p className="muted">Loading itinerary...</p>;
  }

  if (!itinerary) {
    return <p className="muted">Itinerary not found.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section className="card panel" style={{ display: "grid", gap: 16 }}>
        <div className="stack" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="eyebrow">{itinerary.destination}</div>
            <h1 className="title-lg" style={{ marginTop: 12 }}>
              {itinerary.title}
            </h1>
          </div>
          <button className="btn btn-primary" type="button" onClick={share}>
            <Share2 size={16} />
            Create share link
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          {itinerary.summary}
        </p>
        {shareUrl ? (
          <div className="panel" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{shareUrl}</span>
            <button className="icon-btn" type="button" onClick={() => navigator.clipboard?.writeText(shareUrl)}>
              <Copy size={16} />
            </button>
          </div>
        ) : null}
      </section>
      <ItineraryTimeline days={itinerary.itineraryDays || []} />
    </div>
  );
};

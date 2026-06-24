import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../utils/api";
import { ItineraryTimeline } from "../components/ItineraryTimeline";

export const SharedItineraryPage = () => {
  const { shareToken } = useParams();
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => {
    api.get(`/share/${shareToken}`).then((data) => setItinerary(data.itinerary));
  }, [shareToken]);

  if (!itinerary) {
    return <p className="muted">Loading shared itinerary...</p>;
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section className="card panel">
        <div className="eyebrow">Shared itinerary</div>
        <h1 className="title-lg" style={{ marginTop: 12 }}>
          {itinerary.title}
        </h1>
        <p className="muted">{itinerary.summary}</p>
      </section>
      <ItineraryTimeline days={itinerary.itineraryDays || []} />
    </div>
  );
};

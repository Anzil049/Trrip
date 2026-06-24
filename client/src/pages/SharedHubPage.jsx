import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

export const SharedHubPage = () => {
  const [shared, setShared] = useState([]);

  useEffect(() => {
    api.get("/itineraries").then((data) => setShared((data.itineraries || []).filter((item) => item.isPublic)));
  }, []);

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Shared trips</div>
        <h1 className="title-lg" style={{ marginTop: 12 }}>
          Public itineraries
        </h1>
      </div>
      <div className="grid-bento grid-bento-3">
        {shared.map((item) => (
          <div key={item._id} className="card panel">
            <div className="chip">Public</div>
            <h3 className="title-md" style={{ marginTop: 12 }}>
              {item.title}
            </h3>
            <p className="muted">{item.destination}</p>
            <Link className="btn btn-link" to={`/share/${item.shareToken}`}>
              Open shared view
            </Link>
          </div>
        ))}
      </div>
      {!shared.length ? <p className="muted">No public itineraries yet. Share one from the itinerary detail page.</p> : null}
    </section>
  );
};

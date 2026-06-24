import { MapPin, UtensilsCrossed, BusFront, Compass } from "lucide-react";

const icons = [Compass, MapPin, BusFront, UtensilsCrossed];

export const ItineraryTimeline = ({ days = [] }) => {
  return (
    <div className="timeline">
      {days.map((day, index) => {
        const Icon = icons[index % icons.length];
        return (
          <article className="timeline-item card panel" key={`${day.day}-${day.title}`}>
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div className="icon-btn" style={{ background: "rgba(0, 97, 163, 0.08)", border: 0 }}>
                  <Icon size={18} color="#0061a3" />
                </div>
                <div>
                  <div className="chip">Day {day.day}</div>
                  <h3 className="title-md" style={{ marginTop: 8 }}>
                    {day.title}
                  </h3>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {((day.activities && day.activities.length > 0) || (day.highlights && day.highlights.length > 0)) && (
                <div className="card panel" style={{ padding: 16, background: "var(--background)", border: "1px solid var(--border)" }}>
                  {day.activities && day.activities.length > 0 ? (
                    <>
                      <h4 style={{ margin: "0 0 12px", fontSize: "1rem" }}>Daily Schedule</h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {day.activities.map((act, i) => (
                          <div key={i} style={{ display: "flex", gap: 8 }}>
                            <div style={{ fontWeight: 600, color: "var(--text)", width: 85, flexShrink: 0 }}>{act.time}</div>
                            <div style={{ color: "var(--muted)" }}>{act.details}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h4 style={{ margin: "0 0 8px", fontSize: "0.95rem" }}>Highlights</h4>
                      <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
                        {Array.isArray(day.highlights) ? (
                          day.highlights.map((item, i) => (
                            <li key={i} style={{ marginBottom: 6 }}>
                              {item}
                            </li>
                          ))
                        ) : (
                          <li>{day.highlights}</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {day.meals && day.meals.length > 0 && (
                  <div className="card panel" style={{ padding: 14 }}>
                    <strong>Meals</strong>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 16, color: "var(--muted)", lineHeight: 1.5 }}>
                      {Array.isArray(day.meals) ? day.meals.map((m, i) => <li key={i}>{m}</li>) : <li>{day.meals}</li>}
                    </ul>
                  </div>
                )}
                {day.transport && day.transport.length > 0 && (
                  <div className="card panel" style={{ padding: 14 }}>
                    <strong>Transport</strong>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 16, color: "var(--muted)", lineHeight: 1.5 }}>
                      {Array.isArray(day.transport) ? day.transport.map((t, i) => <li key={i}>{t}</li>) : <li>{day.transport}</li>}
                    </ul>
                  </div>
                )}
                {day.notes && day.notes.length > 0 && (
                  <div className="card panel" style={{ padding: 14, gridColumn: "1 / -1" }}>
                    <strong>Notes & Deep Dives</strong>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 16, color: "var(--muted)", lineHeight: 1.6 }}>
                      {Array.isArray(day.notes) ? day.notes.map((n, i) => <li key={i} style={{ marginBottom: 6 }}>{n}</li>) : <li style={{ whiteSpace: "pre-wrap" }}>{day.notes}</li>}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

import { useAuth } from "../state/AuthContext";

export const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Settings</div>
        <h1 className="title-lg" style={{ marginTop: 12 }}>
          Account preferences
        </h1>
      </div>
      <div className="grid-bento grid-bento-2">
        <div className="card panel">
          <label className="label">Full name</label>
          <input className="input" defaultValue={user?.name || ""} />
          <label className="label" style={{ marginTop: 16 }}>
            Email
          </label>
          <input className="input" defaultValue={user?.email || ""} />
        </div>
        <div className="card panel">
          <h2 className="title-md">Account notes</h2>
          <p className="muted">
            This page exists to round out the product with a realistic account area.
          </p>
        </div>
      </div>
    </section>
  );
};

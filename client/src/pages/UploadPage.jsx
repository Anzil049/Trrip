import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UploadDropzone } from "../components/UploadDropzone";
import { useAuth } from "../state/AuthContext";
import { api } from "../utils/api";

export const UploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState(location.state?.initialNotes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Choose a PDF or image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!user) {
        navigate("/login");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      formData.append("notes", notes);
      const data = await api.upload("/uploads/analyze", formData);
      navigate(`/itineraries/${data.itinerary._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 20 }}>
      <div>
        <div className="eyebrow">Create itinerary</div>
        <h1 className="title-lg" style={{ marginTop: 14 }}>
          Upload travel details and let AI draft the trip plan.
        </h1>
        <p className="muted" style={{ marginTop: 10, maxWidth: 760 }}>
          Upload a travel document, add a note if needed, and generate a trip plan from the details inside the document.
        </p>
      </div>

      <form onSubmit={submit} className="grid-bento grid-bento-12">
        <div style={{ gridColumn: "span 7" }}>
          <UploadDropzone file={file} onFileChange={(e) => setFile(e.target.files?.[0] || null)} notes={notes} onNotesChange={setNotes} />
        </div>
        <div style={{ gridColumn: "span 5" }} className="card panel">
          <h2 className="title-md">Workflow</h2>
          <ol className="muted" style={{ marginTop: 12, lineHeight: 1.7, paddingLeft: 18 }}>
            <li>Select a PDF or image travel document.</li>
            <li>Add trip context if the document is sparse.</li>
            <li>Submit to extract data and generate the itinerary.</li>
            <li>Review the generated trip and share it when ready.</li>
          </ol>
          {error ? (
            <div className="panel" style={{ marginTop: 16, color: "#b82b2b", background: "rgba(184, 43, 43, 0.05)" }}>
              {error}
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" style={{ width: "100%", marginTop: 18 }} disabled={loading}>
            {loading ? "Generating..." : "Generate itinerary"}
          </button>
        </div>
      </form>
    </section>
  );
};

import { Paperclip, Upload } from "lucide-react";

export const UploadDropzone = ({ file, onFileChange, notes, onNotesChange }) => {
  return (
    <div className="card panel">
      <div className="upload-zone">
        <Upload size={24} />
        <h3 className="title-md" style={{ marginTop: 12 }}>
          Upload travel bookings
        </h3>
        <p className="muted" style={{ marginTop: 8, marginBottom: 18 }}>
          PDFs work best for extraction. Images are supported too, and the backend is structured for OCR or AI-based parsing.
        </p>
        <label className="btn btn-primary" style={{ position: "relative", overflow: "hidden" }}>
          <Paperclip size={16} />
          Choose file
          <input type="file" accept=".pdf,image/*" onChange={onFileChange} style={{ position: "absolute", inset: 0, opacity: 0 }} />
        </label>
        {file ? <p style={{ marginTop: 14, fontWeight: 700 }}>{file.name}</p> : null}
      </div>

      <div style={{ marginTop: 18 }}>
        <label className="label" htmlFor="notes">
          Booking notes
        </label>
        <textarea
          id="notes"
          className="textarea"
          rows={5}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add context like destination, preferences, or anything the document does not clearly show."
        />
      </div>
    </div>
  );
};

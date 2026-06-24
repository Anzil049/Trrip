import "./config/env.js";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const port = process.env.PORT || 5000;

await connectDb();

app.listen(port, "0.0.0.0", () => {
  console.log(`Trrip API listening on port ${port}`);
});


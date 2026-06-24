import "./config/env.js";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const port = process.env.PORT || 5000;

await connectDb();

app.listen(port, () => {
  console.log(`Trrip API listening on http://localhost:${port}`);
});


import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Skribbl Clone Backend is running!",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
  });
});

export default app;
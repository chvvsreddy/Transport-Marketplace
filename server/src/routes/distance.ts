// routes/distance.ts
import express, { Request, Response } from "express";

import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("map hitted !!!");
    const { origin, destinations } = req.body;

    if (!origin || !destinations || destinations.length === 0) {
      res.status(400).json({ error: "Origin and destinations are required." });
      return;
    }

    const destString = destinations
      .map((d: any) => `${d.lat},${d.lng}`)
      .join("|");

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origin}&destinations=${destString}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.status(200).json(data);
    return;
  } catch (error) {
    console.error("Google Maps API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

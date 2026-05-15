import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const carData = req.body;
  return res.status(200).json({ price: 500000 });
});

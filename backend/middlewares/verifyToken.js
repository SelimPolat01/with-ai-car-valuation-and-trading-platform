import jwt from "jsonwebtoken";

const SECRET = process.env.SECRET;

export default function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Authorization header yok." });

  const token = req.headers.authorization.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token yok." });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token geçersiz." });
  }
}

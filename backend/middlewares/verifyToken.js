import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Yetkilendirme reddedildi. Token bulunamadı." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Token geçersiz veya süresi dolmuş." });
  }
}

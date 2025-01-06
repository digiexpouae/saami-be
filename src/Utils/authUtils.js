import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {
  const token = req.headers.authtoken; // Assuming token is passed as "Bearer <token>"

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
export const verifyUser = (req, res, next) => {
  const token = req.headers.authtoken;


  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.body.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};



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


export function  calculateDistance(userCoords, warehouseCoords) {
    const { userLatitude: lat1, userLongitude: lon1 } = userCoords;
    const { latitude: lat2, longitude: lon2 } = warehouseCoords;
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      return -1; // Handle invalid input types
    }

    const R = 6371; // Radius of the Earth in kilometers

    const radLat1 = (Math.PI / 180) * lat1;
    const radLon1 = (Math.PI / 180) * lon1;
    const radLat2 = (Math.PI / 180) * lat2;
    const radLon2 = (Math.PI / 180) * lon2;

    const dLon = radLon2 - radLon1;
    const dLat = radLat2 - radLat1;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    const distance = R * c;

    return distance;
  }


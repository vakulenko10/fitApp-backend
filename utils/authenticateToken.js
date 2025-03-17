import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables!");
  process.exit(1); 
}
export const authenticateToken = (req, res, next) => {
  console.log('here we are, req.headers:', req.headers)
  const authHeader = req.headers.authorization;
  console.log("authHeader:", authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log('token:', token)
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('there is an error:', err)
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }
    console.log('decoded:', decoded)
    req.userId = decoded.userId?decoded.userId:undefined
    req.email = decoded.email?decoded.email:undefined;
    req.profileImageURL = decoded.picture?decoded.picture:''; 
    console.log('req.userId:', req.email)
    next();
  });
};
import jwt from "jsonwebtoken";

export const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.sendStatus(403);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(403);
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      console.log("verifying");
      if (err) {
        return res.sendStatus(403);
      }
      req.userId = decoded.userId;
      req.role = decoded.role;
      console.log(req.userId);
      next();
    }
  );
};

export const checkRole = (roles) => async (req, res, next) => {
    console.log(req.role);
    !roles.includes(req.role)
      ? res.status(401).json("Sorry you are not authorized to perform this action")
      : next();
  };
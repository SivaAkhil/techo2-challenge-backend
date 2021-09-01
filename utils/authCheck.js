const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1];

    console.log(token, "token");

    if (!token) {
      return next(new Error("authentication of user failed"));
    }

    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

    req.userData = { userid: decodedToken.userid };

    next();
  } catch (err) {
    console.log(err);
    return next(new Error("authentication of user failed"));
  }
};

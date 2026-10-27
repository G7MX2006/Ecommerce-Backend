const jwt = require("jsonwebtoken");
const util = require("util");

async function auth(req, res, next) {
  let { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      message: "you must be login first",
    });
  }

  try {
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;

    let decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET,
    );

    req.id = decoded.id;
    req.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
}

module.exports = { auth };

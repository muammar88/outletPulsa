const jwt = require("jsonwebtoken");
const helper = {};

helper.jwt_value = async (req) => {
  const token_web = req.query.token;
  return jwt.verify(
    token_web,
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return {};
      } else {
        return { kode: decoded.kode, name: decoded.name };
      }
    }
  );
};

module.exports = helper;

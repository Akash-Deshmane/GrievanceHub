const jwt = require("jsonwebtoken");

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      _id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

module.exports = generateToken;
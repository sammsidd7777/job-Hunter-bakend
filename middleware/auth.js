const express = require("express");

// Middleware to protect routes

const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    // ✅ Use `req.cookies` (not req.cookie)
    if (!req.cookies || !req.cookies.jwt) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in or authenticated",
      });
    }

    // ✅ Verify JWT token
    const payload = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET || "siddarth"
    );

    // ✅ Find user in DB
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User not found. Token invalid.",
      });
    }

    // ✅ Attach user to request
    req.user = user;

    next();
  } catch (error) {

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        status: "fail",
        message: error,
      });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({
        status: "fail",
        message: "Token expired. Please log in again.",
      });
    } else {
      res.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  }
};




// Middleware to authorize specific roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}


module.exports = { protect, authorize };

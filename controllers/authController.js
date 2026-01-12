const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");

// 🔐 Generate JWT Token
const generateToken = (user, req, res) => {
  try {
    const token = jwt.sign({ id: user._id }, "siddarth", {
      expiresIn: "90d",
    });

    // ✅ Set cookie with secure settings
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      httpOnly: true,
      secure: req.secure || req.headers["x-forwarded-proto"] === "https",
      sameSite: "Lax", // Lax for cross-origin cookies (good for localhost:5173)
    });

    // ✅ Send response with both message + token + user info
    return res.status(200).json({
      success: true,
      message: "Login successful 🎉",
      token, // optional for frontend localStorage if needed
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Token generation failed" });
  }
};

// 📝 Register User / HR / Admin
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, company } = req.body;

    // 1️⃣ Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2️⃣ Validate role
    const allowedRoles = ["user", "hr"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Only user/hr allowed" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let selectedCompany = null;

    // ⭐ 4️⃣ HR MUST belong to an existing company
    if (role === "hr") {
      if (!company) {
        return res.status(400).json({
          message: "Company is required when registering as HR",
        });
      }

      selectedCompany = await Company.findById(company);

      if (!selectedCompany) {
        return res.status(404).json({ message: "Selected company not found" });
      }
    }

    // 5️⃣ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      company: selectedCompany ? selectedCompany._id : null,
    });

    // 6️⃣ Add HR user to company's hrUsers array
    if (role === "hr") {
      await Company.findByIdAndUpdate(selectedCompany._id, {
        $push: { hrUsers: user._id },
      });
    }

    // 7️⃣ Success
    return res.status(201).json({
      success: true,
      message: "Registration successful 🎉",
      user,
    });

  } catch (err) {
    next(err);
  }
};



// 🔑 Login Controller
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    // 3️⃣ Generate token + cookie
    if (isMatch) {
      return generateToken(user, req, res);
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    next(err);
  }
};

// 🧼 Logout Controller
const logout = (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "Lax",
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  res.status(200).json({ success: true, message: "Logged out successfully 🚪" });
};

module.exports = { register, login, logout, generateToken };

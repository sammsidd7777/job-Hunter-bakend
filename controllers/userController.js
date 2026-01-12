
const multer = require("multer");
const User = require("../models/User");
const Application = require("../models/Application");
const Job = require("../models/Job");

exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;

    let profileScore = 0;
    const thingsToUpdate = [];

    // Name
    if (user?.name) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add your name");
    }

    // Email
    if (user?.email) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add your email");
    }

    // Phone
    if (user?.phone) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add your phone number");
    }

    // Bio
    if (user?.bio && user.bio.trim()) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add a bio");
    }

    // Skills
    if (user?.skills?.length > 0) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add skills");
    }

    // Resume
    if (user?.resume) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Upload your resume");
    }

    // Education
    if (user?.educations?.length > 0) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Add education details");
    }

    // Profile Picture
    if (user?.profilePic) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Upload a profile picture");
    }

    // Role
    if (user?.role) {
      profileScore += 10;
    } else {
      thingsToUpdate.push("Select your role");
    }

    res.status(200).json({
      user,
      profileScore,
      isProfileComplete: profileScore === 100,
      thingsToUpdate,
    });
  } catch (err) {
    next(err);
  }
};



exports.addEducation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const educationData = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // push single education object
    user.educations.push(educationData);

    await user.save();

    res.status(201).json({
      message: "Education added successfully",
      educations: user.educations,
    });

  } catch (error) {
    next(error);
  }
};

exports.userDashboard = async (req, res, next) => {
  try {
    const userId = req?.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Fetch ALL required fields
    const user = await User.findById(userId).select(
      `
      name email phone bio skills resume educations
      profilePic role profileViews savedJob
      `
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Dashboard counts
    const totalApplication = await Application.countDocuments({
      applicant: userId,
    });

    const totalInterview = await Application.countDocuments({
      applicant: userId,
      status: "Interview",
    });

    // ✅ Profile score calculation
    let profileScore = 0;
    const thingsToUpdate = [];

    const scoreRules = [
      { check: user.name, msg: "Add your name" },
      { check: user.email, msg: "Add your email" },
      { check: user.phone, msg: "Add your phone number" },
      { check: user.bio?.trim(), msg: "Add a bio" },
      { check: user.skills?.length > 0, msg: "Add skills" },
      { check: user.resume, msg: "Upload your resume" },
      { check: user.educations?.length > 0, msg: "Add education details" },
      { check: user.profilePic, msg: "Upload a profile picture" },
      { check: user.role, msg: "Select your role" },
    ];

    scoreRules.forEach((rule) => {
      if (rule.check) {
        profileScore += 10;
      } else {
        thingsToUpdate.push(rule.msg);
      }
    });

    // ✅ Cap score at 100
    profileScore = Math.min(profileScore, 100);

    // ✅ Similar jobs (SAFE)
    let similarJobs = [];
    if (user.skills?.length > 0) {
      similarJobs = await Job.find({
        skills: { $in: user.skills },
      })
        .limit(5)
        .select("title company location jobType salaryRange employmentType");
    }

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      data: {
        userName: user.name,
        totalApplication,
        totalInterview,
        totalProfileView: user.profileViews?.length || 0,
        totalSavedJob: user.savedJob?.length || 0,
        profileScore,
        thingsToUpdate,
        similarJobs, // ✅ optional
      },
    });
  } catch (error) {
    next(error);
  }
};


exports.updateProfile = async (req, res, next) => {

  try {
    const user = await User.findById(req.user._id);
    const { name, company,phone,bio,skills } = req.body;
    if (name) user.name = name;
     if(phone)user.phone=phone;
      if(bio)user.bio=bio;
      if(skills) user.skills =skills;

    if (user.role === 'hr' && company) user.company = company;
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
};




// Multer config
const storage = multer.diskStorage({
  destination: (_, __, cb) =>
    cb(null, "uploads/resumes"),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage }).single("resume");

exports.uploadResume = async (req, res) => {
  upload(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message });

      if (!req.file) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const userId = req.user._id;

      // Save file path
        const filePath = req.file.path.replace(/\\/g, "/");

         const publicUrl = `${req.protocol}://${req.get("host")}/${filePath}`;

      const user = await User.findByIdAndUpdate(
        userId,
        { resume: filePath },
        { new: true }
      );

      if (!user) return res.status(404).json({ message: "User not found" });


      res.status(201).json({
        message: "Resume uploaded successfully",
        resumePath: publicUrl,
      });

    } catch (error) {
     next(error);  
    }
  });
};



exports.viewCandidateProfile = async (req, res, next) => {
  try {
    const candidateId = req.params.id;
    
    console.log(candidateId,"candiadte id ")// fixed 'param' -> 'params'
    const viewId = req?.user?._id;

    const candidate = await User.findById(candidateId).select("-password");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Avoid duplicate views
    if (!candidate.profileViews.includes(viewId)) {
      candidate.profileViews.push(viewId);
      await candidate.save();
    }

    res.status(200).json({ message: "Profile viewed", candidate });
  } catch (error) {
    next(error);
  }
};
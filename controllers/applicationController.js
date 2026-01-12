const Application = require('../models/Application');
const Job = require('../models/Job');
const transporter = require('../config/mailer');
const User = require('../models/User');
const Company = require('../models/Company');
const nodemailer = require("nodemailer");

exports.apply = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // ✅ Find Job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // ✅ Prevent duplicate application
    const alreadyApplied = await Application.findOne({
      job: job._id,
      applicant: req.user._id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    // ✅ Create Application
    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter || "",
      resumeUrl: req.user.resume || "",
    });

    // ✅ Push application ID into job (not user id)
    job?.appliations.push(application._id);
    await job.save();

    // ✅ Fetch company correctly
    const company = await Company.findById(job.company);

    // ✅ Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: `Application Submitted: ${job.title}`,
      text: `You have successfully applied for ${job.title} at ${company?.companyName || "Company"}.`,
    });

    res.status(201).json({
      message: "Applied successfully",
      application,
    });

  } catch (error) {
    next(error);
  }
};


exports.getMyApplications = async (req, res, next) => {

  try {
    const apps = await Application.find({ applicant: req.user._id }).populate('job');
    res.json(apps);
  } catch (err) { next(err); }
};

exports. getApplicationsForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (!job.recruiter.equals(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    const apps = await Application.find({ job: job._id }).populate('applicant', 'name email');
    res.json({application:apps});
  } catch (err) { next(err); }
};

exports. updateStatus = async (req, res, next) => {
  try {
    // Populate both job and applicant
    const app = await Application.findById(req.params.id)
    .populate("job")
    .populate("applicant");
    
    console.log(app,"req.params.id")
    if (!app)
      return res.status(404).json({ message: "Application not found" });

    // Check recruiter or admin
    if (!app.job.recruiter.equals(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update status
    app.status = req.body.status;
    await app.save();

    // // 🟦 Nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.MAIL_USER,
    //     pass: process.env.MAIL_PASS,
    //   },
    // });

    // // Send email to applicant
    // await transporter.sendMail({
    //   from: process.env.MAIL_USER,
    //   to: app.applicant.email,
    //   subject: `Application Update - ${app.job.title}`,
    //   text: `Your application status has been updated to: ${app.status}`,
    // });

    res.json(app);

  } catch (err) {
    next(err);
  }
};



 
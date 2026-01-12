const Application = require('../models/Application');
const Company = require('../models/Company');
const Job = require('../models/Job');
const User = require('../models/User');

// Create a new job
exports.createJob = async (req, res, next) => {
  try {
    const hrId = req.user.id; // logged-in HR ID

    // 1️⃣ Check HR exists
    const hr = await User.findById(hrId).populate("company");
    if (!hr) return res.status(404).json({ message: "HR not found" });

    if (!hr.company) {
      return res.status(400).json({ message: "HR has no company assigned" });
    }

    const companyId = hr.company._id;

    // 2️⃣ Create Job
    const jobData = {
      ...req.body,
      recruiter: hrId,
      company: companyId,
    };

    const savedJob = await Job.create(jobData);

    // 3️⃣ Add job to HR's uploadedJobs
    await User.findByIdAndUpdate(hrId, {
      $push: { uploadedJobs: savedJob._id },
    });

    // 4️⃣ Add job to Company.jobs
    await Company.findByIdAndUpdate(companyId, {
      $push: { jobs: savedJob._id },
    });

    // 5️⃣ Auto-update job counts (totalJobs + openJobs)
    await Company.findByIdAndUpdate(companyId, {
      totalJobs: await Job.countDocuments({ company: companyId }),
      openJobs: await Job.countDocuments({
        company: companyId,
        status: true,
      }),
    });


    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: savedJob,
    });

  } catch (error) {
    next(error);
  }
};


// Get all jobs (with optional filters, e.g., active only)
exports.getJobs = async (req, res) => {
  try {
    const { isActive, company, recruiter, employmentType, skill, location } = req.query;

    const filter = {};

    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (company) filter.company = company; 
    if (recruiter) filter.recruiter = recruiter;
    if (employmentType) filter.employmentType = employmentType;
    if (skill) filter.skills = skill;  // Assumes skill is a string, adjust if array
    if (location) filter.location = location;

    const jobs = await Job.find(filter)
      .populate('company')  // if you want to populate company document
      .populate('recruiter');

    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get a single job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id)
      .populate('company')
      .populate('recruiter');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update a job by ID
exports.updateJobActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true, runValidators: true } // return updated doc + validate
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({
      message: "Job status updated successfully",
      job: updatedJob
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};


// Delete (or soft delete) a job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Option A: Hard delete
    const deletedJob = await Job.findByIdAndDelete(id);


    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({ message: 'Job deleted', job: deletedJob });
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Search jobs by text (title + description) using text index
exports.searchJobs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Query param `q` is required for search' });
    }

    const jobs = await Job.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .exec();

    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.getJobByHr = async (req, res, next) => {
  try {
    const hrId = req.user.id;

    const hr = await User.findById(hrId).select("uploadedJobs");

    if (!hr || !hr.uploadedJobs.length) {
      return res.status(200).json({ jobs: [] });
    }

    const jobs = await Job.find({ _id: { $in: hr.uploadedJobs } });
    const jobsLenght =  jobs?.length;

    // const appliationLenght = await Application.find()
    

  const applicationNumber = jobs.reduce(
  (total, job) => total + (job.appliations?.length || 0),
  0
);


  const  data={jobs,jobsLenght,applicationNumber}


    res.status(200).json({
      status: 200,
      data
      
    });

  } catch (error) {
    next(error);
  }
};


exports.savedJob = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Prevent duplicate saved jobs
    if (user.savedJob.includes(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Job already saved",
      });
    }

    // ✅ Save job
    user.savedJob.push(jobId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getSavedJobs = async (req, res, next) => {
  try {
    console.log("hyeee")
   
    const userId = req?.user?._id;

    console.log(userId,"userId")
const user = await User.findById(userId).populate('savedJob', 'title company location');

;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.savedJob.length,
      savedJobs: user.savedJob, // ✅ FULL job objects
    });
  } catch (error) {
  res.status(400).json({
    message:error
  })
  }
};


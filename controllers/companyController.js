const Company = require("../models/Company");

// CREATE NEW COMPANY
exports.createCompany = async (req, res, next) => {
  try {
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name required" });
    }

    // Check company already exists
    const exists = await Company.findOne({ companyName: companyName.trim() });
    if (exists) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Create new company
    const company = await Company.create({
      ...req.body,
      totalJobs: 0,  // initialize
      openJobs: 0,   // initialize
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company,
    });

  } catch (error) {
    next(error);
  }
};



// GET ALL COMPANIES
exports.getCompany = async (req, res,next) => {
  try {
    const companies = await Company.find();
    res.status(200).json({ companies });
  } catch (error) {
  next(error);  
  }
};

exports.getHrCompany = async (req, res, next) => {
  try {
    const companyId = req.user.company;

    if (!companyId) {
      return res.status(404).json({
        success: false,
        message: "Company not assigned to HR",
      });
    }

    const company = await Company.findById(companyId)
      .populate("hrUsers", "name email")
      .populate("jobs");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    res.status(200).json({
      success: true,
      company,
    });
  } catch (error) {
    next(error);
  }
};


exports.updateCompany = async (req, res, next) => {
  try {
    const companyId  = req?.user?.company; // or req.params.id
    const { companyName } = req.body;

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check duplicate name (exclude same company)
    const exists = await Company.findOne({
      companyName: companyName.trim(),
      _id: { $ne: companyId },
    });

    if (exists) {
      return res.status(400).json({ message: "Company name already exists" });
    }

    Object.assign(company, req.body);
    await company.save();

    res.status(200).json({
      success: true,
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCompanyLogo = async (req, res, next) => {
  try {
    const { companyId } = req.user;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "Logo URL is required" });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.companyLogo = url;
    await company.save();

    res.status(200).json({
      success: true,
      message: "Company logo updated successfully",
      logoUrl: company.companyLogo,
    });
  } catch (error) {
    next(error);
  }
};



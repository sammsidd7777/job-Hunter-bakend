const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    industry: {
      type: String,
      default: "",
    },

    companyLogo: {
      type: String,
      default: "",
    },

    founded: {
      type: Number,     // Example: 2014
      default: null,
    },

    // COUNT fields
    totalJobs: {
      type: Number,
      default: 0,
    },

    openJobs: {
      type: Number,
      default: 0,       // ← Based on job status === active
    },

    // All job references
    jobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],

    // All HR users for this company
    hrUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    text: true 
  },

  description: { 
    type: String, 
    required: true, 
    text: true 
  },


  location: { 
    type: String 
  },

  employmentType: {
    type: String,
    enum: ["Full-time", "Part-time", "Internship", "Contract"],
    required: true,
  },

  salaryRange: {
    min: { type: Number },
    max: { type: Number },
  },

  skills: [String],

  // HR who created this job
  recruiter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  appliations:{
    type:Array,
  },
  jobCategory:{
    type:String,
  },
  

  // Company to which the job belongs
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },

  isActive: { 
    type: Boolean, 
    default: true 
  },

}, { timestamps: true });

// Text search index
jobSchema.index({ 
  title: 'text', 
  description: 'text' 
});

module.exports = mongoose.model('Job', jobSchema);

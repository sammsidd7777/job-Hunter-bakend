const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: String,
  resumeUrl: {
    type:String
  },
  status: { 
    type: String,  
    enum: ['applied', 'shortlist', 'reject', 'interview'], 
    default: 'applied' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);

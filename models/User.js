const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["user", "hr", "admin"],
      default: "user",
    },

    // HR → belongs to which company
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },

    phone: {
      type: String
    },

    bio: {
      type: String
    },

    // Skills in array form
    skills: [String],
    savedJob: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      }   ],
      profileViews:[
        {type:mongoose.Schema.Types.ObjectId,
          ref:'User'
        }
      ],
 


    resume: {
      type: String, // File URL or path
      default: null
    },
    profilePic:{
      type:String,
      default:null
    },

    educations: [
      {
        degree: {
          type: String,
          required: true,
        },
        institute: {
          type: String,
          required: true,
        },
       
        completeYear : Number,
      
      },
    ],

    // HR → jobs created by user
    uploadedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
      }
    ]
  },
  { timestamps: true }
);

// Hide password
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);

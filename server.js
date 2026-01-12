const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const Job = require('./models/Job');
const app = express();

// ✅ Load environment variables
dotenv.config();

// ✅ Connect to MongoDB
connectDB(process.env.MONGO_URI);

app.use(cookieParser());

// ✅ Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // 👈 your frontend URL
    credentials: true,               // 👈 allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);


app.use(express.json());


const resumePath = process.env.RESUME_UPLOAD_DIR || 'uploads/resumes';
const imagePath = process.env.IMAGE_UPLOAD_DIR || 'uploads/images';

app.use(
  '/uploads/resumes',
  express.static(path.join(__dirname, resumePath))
);

app.use(
  '/uploads/images',
  express.static(path.join(__dirname, imagePath))
);




// ✅ Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/jobs', require('./routes/jobs'));
app.use('/applications', require('./routes/applications'));
app.use('/img',require('./routes/Img'));
app.use('/company',require('./routes/company'));

// ✅ Error handling middleware
app.use(errorHandler);

// ✅ Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running on port ${PORT}`));

const express = require('express');
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, uploadResume, userDashboard, viewCandidateProfile, addEducation } = require('../controllers/userController');
const { addProfileImg } = require('../controllers/ImageController');
const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profilePic',protect,addProfileImg);
router.post('/post',protect,uploadResume)
router.get("/dashboad",protect,userDashboard);
router.get(`/candidate/:id`,protect,viewCandidateProfile);
router.post('/addEducation',protect,addEducation);
 

module.exports = router;
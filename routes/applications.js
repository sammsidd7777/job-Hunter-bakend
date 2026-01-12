const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { apply, getMyApplications, getApplicationsForJob, updateStatus } = require('../controllers/applicationController');

const router = express.Router();

router.post('/:jobId', protect, authorize('user'),  apply);

router.get('/my', protect, authorize('user'), getMyApplications);
router.get('/job/:jobId', protect, authorize('hr', 'admin'), getApplicationsForJob);
router.patch('/:id/status', protect, authorize('hr', 'admin'), updateStatus);

module.exports = router;

const express = require('express');
const { createJob, getJobs, searchJobs, getJobById,  deleteJob, getJobByHr, updateJobActiveStatus, savedJob, getSavedJobs } = require('../controllers/jobController');
const { authorize, protect } = require('../middleware/auth');
const router = express.Router();
router.get('/', getJobs);




router.post('/',protect,authorize("hr"), createJob);
router.get('/',getJobs);
router.get('/search', searchJobs);
router.get("/hr/",protect,authorize('hr'),getJobByHr);

router.get("/saved-jobs", protect, getSavedJobs);
router.post("/saved-jobs/:id", protect, savedJob);


router.get('/:id', getJobById);
router.patch('/:id',protect,authorize("hr"), updateJobActiveStatus);
router.delete('/:id',protect,authorize("hr"),deleteJob);


// ✅ POST save


module.exports = router;

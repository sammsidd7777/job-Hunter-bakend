const express = require("express");
const { createCompany, getCompany, updateCompany, updateCompanyLogo, getHrCompany,  } = require("../controllers/companyController");
const { authorize, protect } = require("../middleware/auth");

const router = express.Router();

router.post('/',createCompany);
router.get('/',getCompany);
router.put("/",protect,updateCompany);
router.post('/updateLogo',protect,updateCompanyLogo);
router.get('/hrCompany',protect,getHrCompany)

module.exports = router;
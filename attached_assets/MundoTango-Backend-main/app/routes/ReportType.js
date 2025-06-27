const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const ReportTypeController = require("../Controllers/Api/User/ReportTypeController");

// report-type
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new ReportTypeController()).addReportType({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new ReportTypeController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportTypeController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportTypeController()).delete({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportTypeController()).update({request: req, response: res})))

module.exports = router;
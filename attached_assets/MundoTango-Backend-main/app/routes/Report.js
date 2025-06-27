const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const ReportController = require("../Controllers/Api/User/ReportController");

// report-type
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new ReportController()).store({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new ReportController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportController()).destroy({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new ReportController()).update({request: req, response: res})))

module.exports = router;
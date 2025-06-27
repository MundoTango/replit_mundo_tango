const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const UserTravellingController = require("../Controllers/Api/User/UserTravellingController");

// report-type
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new UserTravellingController()).store({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new UserTravellingController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new UserTravellingController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new UserTravellingController()).destroy({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new UserTravellingController()).update({request: req, response: res})))

module.exports = router;
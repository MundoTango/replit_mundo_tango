const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const ActivityController = require("../Controllers/Api/User/ActivityController");

// activity
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new ActivityController()).addActivity({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new ActivityController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new ActivityController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new ActivityController()).delete({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new ActivityController()).update({request: req, response: res})))

module.exports = router;
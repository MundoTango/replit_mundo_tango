const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const GroupActivityController = require("../Controllers/Api/User/GroupActivityController");

// activity
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new GroupActivityController()).store({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new GroupActivityController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupActivityController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupActivityController()).destroy({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupActivityController()).update({request: req, response: res})))

module.exports = router;
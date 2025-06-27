const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const BlockedUserController = require("../Controllers/Api/User/BlockedUserController");

// report-type
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new BlockedUserController()).store({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new BlockedUserController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new BlockedUserController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new BlockedUserController()).destroy({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new BlockedUserController()).update({request: req, response: res})))

module.exports = router;
const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const LanguageController = require("../Controllers/Api/User/LanguageController");

// post-like
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new LanguageController()).store({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new LanguageController()).index({request: req, response: res})))

module.exports = router;
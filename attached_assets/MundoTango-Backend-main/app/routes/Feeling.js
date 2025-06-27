const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const FeelingController = require("../Controllers/Api/User/FeelingController");

// activity
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new FeelingController()).addFeeling({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new FeelingController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new FeelingController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new FeelingController()).delete({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new FeelingController()).update({request: req, response: res})))

module.exports = router;
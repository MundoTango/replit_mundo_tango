const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const PageController = require("../Controllers/Api/User/PageController");

// page
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new PageController()).store({request: req, response: res})))
router.get('/get', checkApiToken, (req, res) =>((new PageController()).index({request: req, response: res})))
router.get('/get-content-slug/:slug', checkApiToken, (req, res) =>((new PageController()).getContentBySlug({request: req, response: res})))
router.get('/get/:id', checkApiToken, (req, res) =>((new PageController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, (req, res) =>((new PageController()).destroy({request: req, response: res})))
router.patch('/update/:id', checkApiToken, (req, res) =>((new PageController()).update({request: req, response: res})))

module.exports = router;
const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const PostLikeController = require("../Controllers/Api/User/PostLikeController");

// post-like
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new PostLikeController()).likePost({request: req, response: res})))
router.delete('/delete/:post_id', checkApiToken, apiAuthentication, (req, res) =>((new PostLikeController()).delete({request: req, response: res})))
// router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new NonTangoActivityController()).index({request: req, response: res})))
// router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new NonTangoActivityController()).show({request: req, response: res})))
// router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new NonTangoActivityController()).delete({request: req, response: res})))
// router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new NonTangoActivityController()).update({request: req, response: res})))

module.exports = router;
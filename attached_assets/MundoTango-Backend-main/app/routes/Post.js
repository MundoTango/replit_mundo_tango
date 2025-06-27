const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const PostController = require("../Controllers/Api/User/PostController");

// performer-experience
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).createPost({request: req, response: res})))
router.post('/create-event-post', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).createEventPost({request: req, response: res})))
router.put('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).updatePost({request: req, response: res})))
router.get('/get-my-post', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).index({request: req, response: res})))
router.get('/get-all-post', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).getAllPosts({request: req, response: res})))
router.get('/get-post/:id', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).destroy({request: req, response: res})))
router.delete('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new PostController()).destroy({request: req, response: res})))
// router.get('/performer-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new PerformerExperienceController()).getPerformerExperience({request: req, response: res})))
// router.get('/performer-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new PerformerExperienceController()).show({params: req?.params,request: req, response: res})))

module.exports = router;
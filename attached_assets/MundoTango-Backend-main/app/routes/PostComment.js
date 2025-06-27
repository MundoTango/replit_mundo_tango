const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const PostCommentController = require("../Controllers/Api/User/PostCommentController");

// post-comment
router.post('/store', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).commentOnPost({
    request: req,
    response: res
})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).index({
    request: req,
    response: res
})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).show({
    request: req,
    response: res
})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).destroy({
    request: req,
    response: res
})))
router.put('/update/:id', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).update({
    request: req,
    response: res
})))

router.get('/get-comments-by-post/:id', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentController()).getCommentByPostId({
    request: req,
    response: res
})))
module.exports = router;
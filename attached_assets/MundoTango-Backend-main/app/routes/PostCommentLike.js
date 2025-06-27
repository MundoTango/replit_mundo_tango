const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const PostCommentLikeController = require("../Controllers/Api/User/PostCommentLikeController");

// post-comment
router.post('/store', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentLikeController()).likeComment({
    request: req,
    response: res
})))
router.delete('/delete/:comment_id', checkApiToken, apiAuthentication, (req, res) => ((new PostCommentLikeController()).delete({
    request: req,
    response: res
})))
module.exports = router;
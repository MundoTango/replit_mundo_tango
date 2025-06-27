const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const FriendController = require("../Controllers/Api/User/FriendController");

// activity
router.post('/send-friend-request', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).sendFriendRequest({request: req, response: res})))
router.get('/get-friend-request', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).getConnectionRequest({request: req, response: res})))
router.get('/get-friendship-card/:id', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).getFriendshipCard({request: req, response: res})))
router.put('/update-friend-request/:id', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).updateStatus({request: req, response: res})))
router.get('/get-my-friends', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).getMyFriends({request: req, response: res})))
router.get('/get-common-things/:friend_id', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).getCommonThings({request: req, response: res})))
router.delete('/destroy/:id', checkApiToken, apiAuthentication, (req, res) =>((new FriendController()).destroy({request: req, response: res})))

module.exports = router;
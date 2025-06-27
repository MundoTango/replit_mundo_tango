const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const GroupController = require("../Controllers/Api/User/GroupController");
const PinGroupController = require("../Controllers/Api/User/PinGroupController");
const GroupVisitorController = require("../Controllers/Api/User/GroupVisitorController");

// groups
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).createGroup({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).updateGroup({request: req, response: res})))
router.post('/request-join-group', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).requestToJoinGroup({request: req, response: res})))
router.post('/group-invitation', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).inviteToJoinGroup({request: req, response: res})))
router.put('/update-request/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).updateRequestStatus({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).index({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).destroy({request: req, response: res})))
router.get('/get-invitations/', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getInvitation({request: req, response: res})))
router.get('/get-group-request/:group_id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getGroupRequest({request: req, response: res})))
router.get('/get-group-members/:group_id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getGroupMembers({request: req, response: res})))
router.get('/get-city-group/:city', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getCityGroup({request: req, response: res})))
router.post('/pin-group', checkApiToken, apiAuthentication, (req, res) =>((new PinGroupController()).store({request: req, response: res})))
router.get('/chart-data/:group_id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getGroupChart({request: req, response: res})))
router.get('/group-timeline/:group_id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).getGroupTimeLine({request: req, response: res})))
router.post('/leave-group/:id', checkApiToken, apiAuthentication, (req, res) =>((new GroupController()).leaveGroup({request: req, response: res})))
router.post('/visit-group', checkApiToken, apiAuthentication, (req, res) =>((new GroupVisitorController()).store({request: req, response: res})))
router.get('/group-visitors/:group_id', checkApiToken, apiAuthentication, (req, res) =>((new GroupVisitorController()).index({request: req, response: res})))

module.exports = router;
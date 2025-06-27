const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const EventController = require("../Controllers/Api/User/EventController");
const GroupController = require("../Controllers/Api/User/GroupController");

// activity
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).addEvent({request: req, response: res})))
router.put('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).updateEvent({request: req, response: res})))
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).showAllEvents({request: req, response: res})))
router.get('/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).show({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).delete({request: req, response: res})))
router.patch('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).update({request: req, response: res})))
router.post('/event-invitation', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).inviteToEvent({request: req, response: res})))
router.get('/event-invitation', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).getInvitation({request: req, response: res})))
router.put('/event-invitation-request/:id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).updateRequestStatus({request: req, response: res})))
router.get('/upcoming-event', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).upcomingEvent({request: req, response: res})))
router.post('/interested-event', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).interestedEvent({request: req, response: res})))
router.post('/going-event', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).goingEvent({request: req, response: res})))
router.get('/get-event-members/:event_id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).eventMembers({request: req, response: res})))
router.get('/chart-data/:event_id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).getEventChart({request: req, response: res})))
router.get('/event-timeline/:event_id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).getEventTimeLine({request: req, response: res})))
router.get('/event-we-meet/:friend_id', checkApiToken, apiAuthentication, (req, res) =>((new EventController()).eventWeMeet({request: req, response: res})))

module.exports = router;
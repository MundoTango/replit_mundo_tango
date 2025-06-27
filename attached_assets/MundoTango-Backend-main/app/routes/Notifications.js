const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const NotificationController = require("../Controllers/Api/User/NotificationController");

// page
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new NotificationController()).notificationListing({request: req, response: res})))
router.put('/read-all-notification', checkApiToken, apiAuthentication, (req, res) =>((new NotificationController()).readAllNotification({request: req, response: res})))
router.put('/read-notification/:id', checkApiToken, apiAuthentication, (req, res) =>((new NotificationController()).readNotificationById({request: req, response: res})))
router.post('/test-notification/', checkApiToken, apiAuthentication, (req, res) =>((new NotificationController()).testNotification({request: req, response: res})))

module.exports = router;
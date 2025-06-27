
const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const UserSubscriptionController = require("../Controllers/Api/User/UserSubscriptionController");

// page
router.get("/user-subscription", apiAuthentication, (req, res) => (new UserSubscriptionController()).index({ request: req, response: res }))
router.post("/cancel-subscription", apiAuthentication, (req, res) => (new UserSubscriptionController()).cancelSubscription({ request: req, response: res }))
router.get("/active-subscription", apiAuthentication, (req, res) => (new UserSubscriptionController()).getActiveSubscription({ request: req, response: res }))

module.exports = router;
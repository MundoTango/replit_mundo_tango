const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const SubscriptionController = require("../Controllers/Api/User/SubscriptionController");

// page
router.get('/get', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).index({request: req, response: res})))
router.post('/create-session-checkout', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).sessionCheckout({request: req, response: res})))
router.get('/get-subscription-status', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).getIsPlanSubscribed({request: req, response: res})))
router.post('/store', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).store({request: req, response: res})))
router.put('/update/:id', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).update({request: req, response: res})))
router.delete('/delete/:id', checkApiToken, apiAuthentication, (req, res) =>((new SubscriptionController()).destroy({request: req, response: res})))

module.exports = router;
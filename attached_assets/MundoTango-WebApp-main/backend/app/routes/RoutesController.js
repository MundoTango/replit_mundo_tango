const express = require("express")
const router = express.Router();

const checkApiToken = require('../Middleware/CheckApiToken');

const UserController = require("../Controllers/Api/UserController");
const UploadController = require("../Controllers/UploadController");


router.get("/", (req, res) => {
    res.send("hello world from test");
})


/* User Configure Account Routes */
router.get('/reset-password/:resetPasswordToken', (req, res) => (new UserController()).resetPassword({ request: req, response: res }))
router.post('/reset-password', (req, res) => (new UserController()).resetPasswordSubmit({ request: req, response: res }))
router.post('/upload', checkApiToken, (req, res) => (new UploadController()).uploadMedia({ request: req, response: res }))


module.exports = router;
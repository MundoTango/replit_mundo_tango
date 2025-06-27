const express = require("express")
const router = express.Router();
const checkApiToken = require('../Middleware/CheckApiToken');
const UserController = require("../Controllers/Api/User/UserController");
const apiAuthentication = require("../Middleware/ApiAuthentication");
const UserOTPController = require("../Controllers/Api/User/UserOTPController");
const OTPTokenAuthentication = require("../Middleware/OTPTokenAuthentication");
const SettingController = require("../Controllers/Api/User/SettingController")



/*----------------------------------   OTP Routes  ------------------------------*/
router.post('/send-otp/mail', checkApiToken, (req, res) => (new UserOTPController()).store({ request: req, response: res }))
router.post('/verify-otp/register', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPRegister({ request: req, response: res }))
router.post('/verify-otp/forgot-password', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPForgotPassword({ request: req, response: res }))


router.post("/content/create-static-content", apiAuthentication, (request, response) => (new SettingController()).createcontent({ request, response }))
router.get("/content/get-static-content/:type", (request, response) => (new SettingController()).getcontent({ request, response }))


/*----------------------------------   User Configure Account Routes  ------------------------------*/
router.post('/', checkApiToken, (req, res) => (new UserController()).store({ request: req, response: res }))
router.delete('/', apiAuthentication, (req, res) => (new UserController()).destroy({ request: req, response: res }))
router.get('/', apiAuthentication, (req, res) => (new UserController()).getMyProfile({ request: req, response: res }))
router.get('/search', apiAuthentication, (req, res) => (new UserController()).getSearchUser({ request: req, response: res }))
router.patch('/', apiAuthentication, (req, res) => (new UserController()).update({ request: req, response: res }))
router.post('/login', checkApiToken, (req, res) => (new UserController()).login({ request: req, response: res }))
router.post('/social-login', checkApiToken, (req, res) => (new UserController()).socialLogin({ request: req, response: res }))
router.post('/update-pushnotification', apiAuthentication, (req, res) => (new UserController()).pushNotification({ request: req, response: res }))
router.post('/update-fcmtoken', apiAuthentication, (req, res) => (new UserController()).updateNotificationToken({ request: req, response: res }))
router.post('/get-pushnotification-status', apiAuthentication, (req, res) => (new UserController()).getPushNotificationStatus({ request: req, response: res }))
router.get('/:id', apiAuthentication, (req, res) => (new UserController()).show({ request: req, response: res }))

// router.post('/forgot-password', checkApiToken, (req, res) => (new UserController()).forgotPassword({ request: req, response: res }))
router.post('/set-password', OTPTokenAuthentication.authenticate, (req, res) => (new UserController()).setNewPassword({ request: req, response: res }))
router.post('/change-password', apiAuthentication, (req, res) => (new UserController()).changePassword({ request: req, response: res }))
router.post('/logout', apiAuthentication, (req, res) => (new UserController()).logout({ request: req, response: res }))


module.exports = router;
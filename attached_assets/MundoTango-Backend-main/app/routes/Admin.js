const express = require("express");
const router = express.Router();

const CheckApiToken = require("../Middleware/CheckApiToken");
const AdminApiAuthentication = require("../Middleware/AdminApiAuthentication");

const UserController = require("../Controllers/Api/Admin/UserController");
const LookupController = require("../Controllers/Api/Admin/LookupController");
const LookupDataController = require("../Controllers/Api/Admin/LookupDataController");
const checkApiToken = require("../Middleware/CheckApiToken");
const apiAuthentication = require("../Middleware/ApiAuthentication");
const NonTangoActivityController = require("../Controllers/Api/User/NonTangoActivityController");
const ReportTypeController = require("../Controllers/Api/User/ReportTypeController");
const ReportController = require("../Controllers/Api/User/ReportController");
const PostController = require("../Controllers/Api/User/PostController");
const PostCommentController = require("../Controllers/Api/User/PostCommentController");
const GroupController = require("../Controllers/Api/User/GroupController");
const PageController = require("../Controllers/Api/User/PageController");
const FaqsController = require("../Controllers/Api/User/FaqsController");
const HelpSupportController = require("../Controllers/Api/User/HelpSupportController");
const NotificationController = require("../Controllers/Api/User/NotificationController");
const SubscriptionController = require("../Controllers/Api/User/SubscriptionController");
const UserSubscriptionController = require("../Controllers/Api/User/UserSubscriptionController");
const EventController = require("../Controllers/Api/User/EventController");

/*----------------------------------   Lookups Routes  ------------------------------*/
router.get('/lookup', AdminApiAuthentication.authenticate, (req, res) => (new LookupController()).index({ request: req, response: res }))
router.post('/lookup/:id', AdminApiAuthentication.authenticate, (req, res) => (new LookupDataController()).store({ request: req, response: res }))

/*----------------------------------   Account Routes  ------------------------------*/
router.post('/login', CheckApiToken, (req, res) => (new UserController()).login({ request: req, response: res }))
router.patch('/', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).update({ request: req, response: res }))
router.post('/forgot-password', CheckApiToken, (req, res) => (new UserController()).forgotPassword({ request: req, response: res }))
router.post('/change-password', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).changePassword({ request: req, response: res }))
router.post('/logout', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).logout({ request: req, response: res }))
router.get('/', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).getMyProfile({ request: req, response: res }))

router.get('/get-dashboard-data', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).getDashboardData({ request: req, response: res }))
router.get("/get-all-users", AdminApiAuthentication.authenticate, (req, res) => (new UserController()).getAllUsers({ request: req, response: res }))
router.get("/get-users-details/:id", AdminApiAuthentication.authenticate, (req, res) => (new UserController()).getUserDetail({ request: req, response: res }))
router.put("/block-user/:id", AdminApiAuthentication.authenticate, (req, res) => (new UserController()).blockedUser({ request: req, response: res }))
router.post("/change-user-password/:id", AdminApiAuthentication.authenticate, (req, res) => (new UserController()).changePasswordForUser({ request: req, response: res }))
router.delete('/delete-user/:id', AdminApiAuthentication.authenticate, (req, res) => (new UserController()).destroy({ request: req, response: res }))

/* Non Tango Activities*/
router.post('/non-tango-activity/store', AdminApiAuthentication.authenticate, (req, res) =>((new NonTangoActivityController()).addNonTangoActivity({request: req, response: res})))
router.get('/non-tango-activity/get', AdminApiAuthentication.authenticate, (req, res) =>((new NonTangoActivityController()).index({request: req, response: res})))
router.get('/non-tango-activity/get/:id', AdminApiAuthentication.authenticate, (req, res) =>((new NonTangoActivityController()).show({request: req, response: res})))
router.delete('/non-tango-activity/delete/:id', AdminApiAuthentication.authenticate, (req, res) =>((new NonTangoActivityController()).delete({request: req, response: res})))
router.patch('/non-tango-activity/update/:id', AdminApiAuthentication.authenticate, (req, res) =>((new NonTangoActivityController()).update({request: req, response: res})))

/* Report Types*/
router.get("/report-types", AdminApiAuthentication.authenticate, (req, res) => (new ReportTypeController()).index({ request: req, response: res }))
router.get("/report-types/:id", AdminApiAuthentication.authenticate, (req, res) => (new ReportTypeController()).show({ request: req, response: res }))
router.post("/report-types", AdminApiAuthentication.authenticate, (req, res) => (new ReportTypeController()).addReportType({ request: req, response: res }))
router.patch("/report-types/:id", AdminApiAuthentication.authenticate, (req, res) => (new ReportTypeController()).update({ request: req, response: res }))
router.delete("/report-types/:id", AdminApiAuthentication.authenticate, (req, res) => (new ReportTypeController()).destroy({ request: req, response: res }))

/* Reports */
router.get("/reports", AdminApiAuthentication.authenticate, (req, res) => (new ReportController()).index({ request: req, response: res }))
router.put("/reports/:id", AdminApiAuthentication.authenticate, (req, res) => (new ReportController()).update({ request: req, response: res }))

/*Post */

router.get("/posts", AdminApiAuthentication.authenticate, (req, res) => (new PostController()).getPosts({ request: req, response: res }))
router.put("/posts/status/:id", AdminApiAuthentication.authenticate, (req, res) => (new PostController()).activeStatusGroup({ request: req, response: res }))
router.get("/posts/:id", AdminApiAuthentication.authenticate, (req, res) => (new PostController()).show({params: req.params, request: req, response: res }))

/* Post Comments */
router.get("/post-comments/post/:id", AdminApiAuthentication.authenticate, (req, res) => (new PostCommentController()).getCommentByPostId({ request: req, response: res }))
router.delete("/post-comments/post/:id", AdminApiAuthentication.authenticate, (req, res) => (new PostCommentController()).destroy({ request: req, response: res }))

/* Groups */
router.get("/groups", AdminApiAuthentication.authenticate, (req, res) => (new GroupController()).getGroups({ request: req, response: res }))
router.put("/groups/status/:id", AdminApiAuthentication.authenticate, (req, res) => (new GroupController()).activeStatusGroup({ request: req, response: res }))
router.get("/groups/:id", AdminApiAuthentication.authenticate, (req, res) => (new GroupController()).getGroupDetails({ request: req, response: res }))

/*---------------------------------- Page ROUTES ------------------------------*/
router.get("/page", AdminApiAuthentication.authenticate, (req, res) => (new PageController()).index({ request: req, response: res }))
router.get("/page/:id", AdminApiAuthentication.authenticate, (req, res) => (new PageController()).show({ request: req, response: res }))
router.post("/page", AdminApiAuthentication.authenticate, (req, res) => (new PageController()).store({ request: req, response: res }))
router.patch("/page/:id", AdminApiAuthentication.authenticate, (req, res) => (new PageController()).update({ request: req, response: res }))
router.delete("/page/:id", AdminApiAuthentication.authenticate, (req, res) => (new PageController()).destroy({ request: req, response: res }))

router.post('/faqs', AdminApiAuthentication.authenticate, (req, res) =>((new FaqsController()).store({params: req?.params,request: req, response: res})))
router.get('/faqs', AdminApiAuthentication.authenticate, (req, res) =>((new FaqsController()).index({params: req?.params,request: req, response: res})))
router.get('/faqs/:id', AdminApiAuthentication.authenticate, (req, res) =>((new FaqsController()).show({params: req?.params,request: req, response: res})))
router.put('/faqs/:id', AdminApiAuthentication.authenticate, (req, res) =>((new FaqsController()).update({params: req?.params,request: req, response: res})))
router.delete('/faqs/:id', AdminApiAuthentication.authenticate, (req, res) =>((new FaqsController()).destroy({params: req?.params,request: req, response: res})))
router.get('/help-support', AdminApiAuthentication.authenticate, (req, res) =>((new HelpSupportController()).index({params: req?.params,request: req, response: res})))

/* Notifications */
router.post("/notifications/push-specific-user", AdminApiAuthentication.authenticate, (req, res) => (new NotificationController()).sendNotificationToSpecificUsers({ request: req, response: res }))
router.post("/notifications/push-all-user", AdminApiAuthentication.authenticate, (req, res) => (new NotificationController()).sendNotificationToAllUsers({ request: req, response: res }))

/* subscriptions */
router.get('/subscriptions', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).index({request: req, response: res})))
router.get('/subscriptions/:id', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).show({request: req, response: res})))
router.post('/subscriptions', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).store({request: req, response: res})))
router.put('/subscriptions/:id', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).update({request: req, response: res})))
router.delete('/subscriptions/:id', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).destroy({request: req, response: res})))
router.put('/subscriptions/status/:id', AdminApiAuthentication.authenticate, (req, res) =>((new SubscriptionController()).subscriptionStatusActive({request: req, response: res})))
router.get('/user-subscriptions', AdminApiAuthentication.authenticate, (req, res) =>((new UserSubscriptionController()).index({request: req, response: res})))

/* Event Management */
router.get('/events', AdminApiAuthentication.authenticate, (req, res) =>((new EventController()).getEvents({request: req, response: res})))
router.get('/events/:id', AdminApiAuthentication.authenticate, (req, res) =>((new EventController()).getEventDetails({request: req, response: res})))

/* Help and Support */
router.get('/help-support', checkApiToken, apiAuthentication, (req, res) =>((new HelpSupportController()).index({params: req?.params,request: req, response: res})))

module.exports = router
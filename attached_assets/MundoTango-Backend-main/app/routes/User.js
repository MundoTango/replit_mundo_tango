const express = require("express")
const router = express.Router();
const multer = require("multer");
const upload = multer()

const checkApiToken = require('../Middleware/CheckApiToken');
const apiAuthentication = require("../Middleware/ApiAuthentication");

const UserOTPController = require("../Controllers/Api/User/UserOTPController");
const OTPTokenAuthentication = require("../Middleware/OTPTokenAuthentication");


const SettingController = require("../Controllers/Api/User/SettingController");
const LookupController = require("../Controllers/Api/User/LookupController");
const UserController = require("../Controllers/Api/User/UserController");
const UserQuestionController = require('../Controllers/Api/User/UserQuestionController')
const CreatorExperienceController = require('../Controllers/Api/User/CreatorExperienceController')
const DanceExperienceController = require('../Controllers/Api/User/DanceExperienceController')
const DjExperienceController = require('../Controllers/Api/User/DjExperienceController')
const HostExperienceController = require('../Controllers/Api/User/HostExperienceController')
const LearningSourceController = require('../Controllers/Api/User/LearningSourceController')
const OrganizerExperienceController = require('../Controllers/Api/User/OrganizerExperienceController')
const TourOperatorExperienceController = require('../Controllers/Api/User/TourOperatorExperienceController')
const TeachingExperienceController = require('../Controllers/Api/User/TeachingExperienceController')
const TangoActivitiesController = require('../Controllers/Api/User/TangoActivitiesController')
const PhotographerExperienceController = require('../Controllers/Api/User/PhotographerExperienceController')
const PerformerExperienceController = require('../Controllers/Api/User/PerformerExperienceController')
const SavePostController = require('../Controllers/Api/User/SavePostController')
const HidePostController = require('../Controllers/Api/User/HidePostController')
const HelpSupportController = require('../Controllers/Api/User/HelpSupportController')
const FaqsController = require('../Controllers/Api/User/FaqsController')

/*----------------------------------   Lookups Routes  ------------------------------*/
router.get('/lookup', (req, res) => (new LookupController()).index({ request: req, response: res }))


/*----------------------------------   Setting Routes  ------------------------------*/
router.get('/setting/:type', checkApiToken, (req, res) => (new SettingController()).show({ request: req, response: res }))


/*----------------------------------   OTP Routes  ------------------------------*/
router.post('/send-otp/mail', checkApiToken, (req, res) => (new UserOTPController()).store({ request: req, response: res }))
router.post('/verify-otp/register', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPRegister({ request: req, response: res }))
router.post('/verify-otp/forgot-password', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPForgotPassword({ request: req, response: res }))


/* User Configure Account Routes */
router.post('/', checkApiToken, upload.any(), (req, res) => (new UserController()).store({ request: req, response: res }))
router.post('/login', checkApiToken, (req, res) => (new UserController()).login({ request: req, response: res }))
router.post('/social-login', checkApiToken, (req, res) => (new UserController()).socialLogin({ request: req, response: res }))
router.patch('/', apiAuthentication, (req, res) => (new UserController()).update({ request: req, response: res }))
router.patch('/notification', apiAuthentication, (req, res) => (new UserController()).toggleNotification({ request: req, response: res }))
router.patch('/privacy', apiAuthentication, (req, res) => (new UserController()).toggleUpdatePrivacy({ request: req, response: res }))
router.get('/', apiAuthentication, (req, res) => (new UserController()).getMyProfile({ request: req, response: res }))
router.post('/forgot-password', checkApiToken, (req, res) => (new UserController()).forgotPassword({ request: req, response: res }))
router.post('/change-password', apiAuthentication, (req, res) => (new UserController()).changePassword({ request: req, response: res }))
router.post('/set-password', OTPTokenAuthentication.authenticate, (req, res) => (new UserController()).setNewPassword({ request: req, response: res }))
router.post('/logout', apiAuthentication, (req, res) => (new UserController()).logout({ request: req, response: res }))
router.delete('/', checkApiToken, apiAuthentication, (req, res) => (new UserController()).destroy({ request: req, response: res }))
router.post('/add-user-images', checkApiToken, apiAuthentication, (req, res) => (new UserController()).addUserImages({ request: req, response: res }))
router.get('/get-user-images', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getUserImages({ request: req, response: res }))
router.put('/set-default-images/:image_id', checkApiToken, apiAuthentication, (req, res) => (new UserController()).changeDefaultImage({ request: req, response: res }))
router.patch('/accept-guideline', checkApiToken, apiAuthentication, (req, res) => (new UserController()).guideLineAccept({ request: req, response: res }))
router.get('/get-user-media', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getUserMedia({ request: req, response: res }))
router.get('/get-city-members', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getMemberInCity({ request: req, response: res }))
router.get('/get-all-users', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getAllUsers({ request: req, response: res }))
router.get('/get-user-timeline/:user_id', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getUserTimeLine({ request: req, response: res }))
router.get('/get-user-profile/:id', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getUserProfile({ request: req, response: res }))
router.get('/get-user-about/:id', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getUserAbout({ request: req, response: res }))
router.get('/get-city-about/:id', checkApiToken, apiAuthentication, (req, res) => (new UserController()).getCityAbout({ request: req, response: res }))
router.get('/mundotango-details/', checkApiToken, apiAuthentication, (req, res) => (new UserController()).mundoTangoDetails({ request: req, response: res }))
router.post('/add-media', checkApiToken, apiAuthentication,(req, res) => (new UserController()).addMedia({ request: req, response: res }))
router.get('/global-search', checkApiToken, apiAuthentication,(req, res) => (new UserController()).globalSearch({ request: req, response: res }))
router.post('/update-fcm-token', checkApiToken, apiAuthentication,(req, res) => (new UserController()).updateFCMToken({ request: req, response: res }))
router.post('/code-of-conduct', checkApiToken, apiAuthentication,(req, res) => (new UserController()).codeOfConduct({ request: req, response: res }))

// user-questions
router.post('/user-questions/store', checkApiToken, apiAuthentication, (req, res) =>((new UserQuestionController()).addUserQuestions({request: req, response: res})))
router.get('/user-questions/get', checkApiToken, apiAuthentication, (req, res) =>((new UserQuestionController()).getUserQuestions({request: req, response: res})))
router.get('/user-questions/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new UserQuestionController()).show({params: req?.params,request: req, response: res})))
router.delete('/user-questions/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new UserQuestionController()).delete({params: req?.params,request: req, response: res})))


// creator-experience
router.post('/creator-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new CreatorExperienceController()).addCreatorExperience({request: req, response: res})))
router.get('/creator-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new CreatorExperienceController()).getCreatorExperience({request: req, response: res})))
router.get('/creator-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new CreatorExperienceController()).show({params: req?.params,request: req, response: res})))
router.delete('/creator-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new CreatorExperienceController()).delete({params: req?.params,request: req, response: res})))

// dance-experience
router.post('/dance-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new DanceExperienceController()).addDanceExperience({request: req, response: res})))
router.get('/dance-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new DanceExperienceController()).getDanceExperience({request: req, response: res})))
router.get('/dance-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new DanceExperienceController()).show({params: req?.params,request: req, response: res})))

// dj-experience
router.post('/dj-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new DjExperienceController()).addDjExperience({request: req, response: res})))
router.get('/dj-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new DjExperienceController()).getDjExperience({request: req, response: res})))
router.get('/dj-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new DjExperienceController()).show({params: req?.params,request: req, response: res})))

// host-experience
router.post('/host-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new HostExperienceController()).addHostExperience({request: req, response: res})))
router.get('/host-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new HostExperienceController()).getHostExperience({request: req, response: res})))
router.get('/host-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new HostExperienceController()).show({params: req?.params,request: req, response: res})))
router.post('/host-experience/add-attachments', checkApiToken, apiAuthentication, (req, res) =>((new HostExperienceController()).addAttachments({params: req?.params,request: req, response: res})))

// learning-source
router.post('/learning-source/store', checkApiToken, apiAuthentication, (req, res) =>((new LearningSourceController()).addLearningSource({request: req, response: res})))
router.get('/learning-source/get', checkApiToken, apiAuthentication, (req, res) =>((new LearningSourceController()).getLearningSource({request: req, response: res})))
router.get('/learning-source/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new LearningSourceController()).show({params: req?.params,request: req, response: res})))

// organizer-experience
router.post('/organizer-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new OrganizerExperienceController()).addOrganizerExperience({request: req, response: res})))
router.get('/organizer-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new OrganizerExperienceController()).getOrganizerExperience({request: req, response: res})))
router.get('/organizer-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new OrganizerExperienceController()).show({params: req?.params,request: req, response: res})))

// tour-operator-experience
router.post('/tour-operator-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new TourOperatorExperienceController()).addTourOperatorExperience({request: req, response: res})))
router.get('/tour-operator-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new TourOperatorExperienceController()).getTourOperatorExperience({request: req, response: res})))
router.get('/tour-operator-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new TourOperatorExperienceController()).show({params: req?.params,request: req, response: res})))

// teaching-experience
router.post('/teaching-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new TeachingExperienceController()).addTeachingExperience({request: req, response: res})))
router.get('/teaching-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new TeachingExperienceController()).getTeachingExperience({request: req, response: res})))
router.get('/teaching-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new TeachingExperienceController()).show({params: req?.params,request: req, response: res})))

// tango-activities
router.post('/tango-activities/store', checkApiToken, apiAuthentication, (req, res) =>((new TangoActivitiesController()).addTangoActivities({request: req, response: res})))
router.get('/tango-activities/get', checkApiToken, apiAuthentication, (req, res) =>((new TangoActivitiesController()).getTangoActivities({request: req, response: res})))
router.get('/tango-activities/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new TangoActivitiesController()).show({params: req?.params,request: req, response: res})))

// photographer-experience
router.post('/photographer-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new PhotographerExperienceController()).addPhotographerExperience({request: req, response: res})))
router.get('/photographer-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new PhotographerExperienceController()).getPhotographerExperience({request: req, response: res})))
router.get('/photographer-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new PhotographerExperienceController()).show({params: req?.params,request: req, response: res})))

// performer-experience
router.post('/performer-experience/store', checkApiToken, apiAuthentication, (req, res) =>((new PerformerExperienceController()).addPerformerExperience({request: req, response: res})))
router.get('/performer-experience/get', checkApiToken, apiAuthentication, (req, res) =>((new PerformerExperienceController()).getPerformerExperience({request: req, response: res})))
router.get('/performer-experience/get/:id', checkApiToken, apiAuthentication, (req, res) =>((new PerformerExperienceController()).show({params: req?.params,request: req, response: res})))
// save post
router.post('/save-post', checkApiToken, apiAuthentication, (req, res) =>((new SavePostController()).store({params: req?.params,request: req, response: res})))
router.get('/save-post', checkApiToken, apiAuthentication, (req, res) =>((new SavePostController()).index({params: req?.params,request: req, response: res})))
router.delete('/save-post/:id', checkApiToken, apiAuthentication, (req, res) =>((new SavePostController()).destroy({params: req?.params,request: req, response: res})))
router.post('/help-support', checkApiToken, apiAuthentication, (req, res) =>((new HelpSupportController()).store({params: req?.params,request: req, response: res})))
router.get('/faqs', checkApiToken, apiAuthentication, (req, res) =>((new FaqsController()).index({params: req?.params,request: req, response: res})))

router.post('/hide-post', checkApiToken, apiAuthentication, (req, res) =>((new HidePostController()).store({params: req?.params,request: req, response: res})))
router.get('/hide-post', checkApiToken, apiAuthentication, (req, res) =>((new HidePostController()).index({params: req?.params,request: req, response: res})))
router.delete('/hide-post/:id', checkApiToken, apiAuthentication, (req, res) =>((new HidePostController()).destroy({params: req?.params,request: req, response: res})))


module.exports = router;
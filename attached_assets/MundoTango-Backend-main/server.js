const express = require("express");
const http = require('http');
const path = require('path');
const cors = require("cors");
const bodyParser = require('body-parser');
const multer = require('multer');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const upload = multer();
const {v4: uuidv4} = require('uuid');
const process = require('process');

require('dotenv').config();
const app = express();
const {sequelize, user_groups, settings, users} = require("./app/Database/index")

const {
    testRouter, userRoutes, controllerRoutes, adminRoutes, postRoutes, activityRoutes, feelingRoutes,
    nonTangoActivityRoutes, postLikeRoutes, friendRoutes, reportTypeRoutes, eventTypeRoutes, postCommentRoutes,
    groupRoutes, pageRoutes, postShareRoutes, groupActivityRoutes, eventRoutes, postCommentLikeRoutes,
    notificationRoutes, subscriptionRoutes, userTravellingRoutes, reportRoutes, blockedUserRoutes, languageRoutes,
} = require('./app/routes');
const {ROLES, UPLOAD_DIRECTORY_MAPPING, UPLOAD_DIRECTORY, SETTING_ENUM,} = require("./app/config/enum");
const FileHandler = require("./app/Libraries/FileHandler/FileHandler");
const {getUserDirectory, generateHash} = require("./app/Helper");
const stripe = require('stripe')(process.env.STRIPE_SECRET);

const SettingController = require("./app/Controllers/Api/User/SettingController");
const Socket = require("./socket.js");
const UserSubscriptionController = require("./app/Controllers/Api/User/UserSubscriptionController");


/**App Setup */
app.use(upload.any());
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/templates"));
app.use('/', express.static('upload'));


// Set Cookie Parser, sessions and flash
app.use(cookieParser('NotSoSecret'));
app.use(session({
    secret: 'something',
    cookie: {maxAge: 60000},
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(function (req, res, next) {
    res.locals.message = req.flash();
    next();
});


/**All Route */

app.use('/test', testRouter)
app.use('/api/user', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', controllerRoutes)
app.use('/api/post', postRoutes)
app.use('/api/activity', activityRoutes)
app.use('/api/feeling', feelingRoutes)
app.use('/api/non-tango-activity', nonTangoActivityRoutes)
app.use('/api/post-like', postLikeRoutes)
app.use('/api/post-share', postShareRoutes)
app.use('/api/friend', friendRoutes)
app.use('/api/report-type', reportTypeRoutes)
app.use('/api/event-type', eventTypeRoutes)
app.use('/api/post-comment', postCommentRoutes)
app.use('/api/group', groupRoutes)
app.use('/api/page', pageRoutes)
app.use('/api/group-activity', groupActivityRoutes)
app.use('/api/event', eventRoutes)
app.use('/api/comment-like', postCommentLikeRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/user-travels', userTravellingRoutes)
app.use('/api/report', reportRoutes)
app.use('/api/block-user', blockedUserRoutes)
app.use('/api/language', languageRoutes)


app.get("/", (req, res) => res.render("welcome"))
app.get("/success", (req, res) => res.render("success-page"))
app.get("/test-socket", (req, res) => {
    res.render('socket-template');
})
app.get('/page/:type', (req, res) => (new SettingController()).getPage({request: req, response: res}))

//stripe webhook
app.post('/stripe-subscription-webhook', (req, res) => (new UserSubscriptionController()).handleWebhook({ request: req, response: res }))



/**Server Starting */
const force = process.argv[2] === '--force'
// const force = false
const alter = process.argv[2] === '--alter';
// const alter = false;
const httpServer = http.createServer(app)
Socket.instance(httpServer)

httpServer.listen(process.env.BACKEND_PORT, () => {
    console.log("Server is running on PORT : ", process.env.BACKEND_PORT)
    sequelize.sync({force, alter, logging: false}).then(async () => {
        console.log("Drop and re-sync db.");

        if (force) {
            await FileHandler.makeDirectory(getUserDirectory());

            const obj = [{
                id: 1,
                title: "Super Admin",
                slug: "super-admin",
                type: ROLES.ADMIN,
                createdAt: new Date(),
                updatedAt: new Date()
            },
                {
                    id: 2,
                    title: "App User",
                    slug: "app-user",
                    type: ROLES.USER,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ]
            const record = await user_groups.bulkCreate(obj)
            console.log("User Groups Records Created ! ")


            const admin_data = {
                slug: uuidv4(),
                user_type: ROLES.ADMIN,
                name: "Admin",
                email: "laa@yopmail.com",
                password: generateHash("test@123"),
                device_type: "web",
                device_token: "123123123"
            }

            const admin_record = await users.create(admin_data)
            console.log("Admin Record Created ! ")


            const settings_data = [
                {
                    title: "Privacy Policy",
                    type: SETTING_ENUM.PRIVACY_POLICY,
                    text: "Lorem epsum",
                    createdAt: new Date()
                },
                {
                    title: "Terms And Conditions",
                    type: SETTING_ENUM.TERMS_AND_CONDITION,
                    text: "Lorem epsum",
                    createdAt: new Date()

                }
            ]


            await settings.bulkCreate(settings_data);
            console.log("Settings Records Created ! ")


            // const lookups_type_data = []


            // await lookups.bulkCreate(lookups_type_data);
            // console.log("Lookups Records Created ! ")

        }

        require("./app/config/validator");
    });

})

const dbConfig = require("../config/db.js");
const ChatAssociation = require("./Associations/Chat");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.DIALECT,
    operatorsAliases: 0,

    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.Op = Sequelize.Op;
db.QueryTypes = Sequelize.QueryTypes;


/**Import All Models */
db.user_groups = require("./UserGroups.js")(sequelize, Sequelize);
db.users = require("./User.js")(sequelize, Sequelize);
db.user_api_tokens = require("./UserApiTokens.js")(sequelize, Sequelize);
db.user_otp = require("./UserOTP.js")(sequelize, Sequelize);
db.social_user = require("./SocialUser.js")(sequelize, Sequelize);
db.reset_passwords = require("./ResetPasswords.js")(sequelize, Sequelize);
db.user_questions = require("./UserQuestions.js")(sequelize, Sequelize);
db.tango_activities = require("./TangoActivities.js")(sequelize, Sequelize);
db.teaching_experience = require("./TeachingExperience.js")(sequelize, Sequelize);
db.dj_experience = require("./DJExperience.js")(sequelize, Sequelize);
db.organizer_experience = require("./OrganizerExperience.js")(sequelize, Sequelize);
db.performer_experience = require("./PerformerExperience.js")(sequelize, Sequelize);
db.host_experience = require("./HostExperience.js")(sequelize, Sequelize);
db.creator_experience = require("./CreatorExperience.js")(sequelize, Sequelize);
db.photographer_experience = require("./PhotographerExperience.js")(sequelize, Sequelize);
db.tour_operator_experience = require("./TourOperatorExperience.js")(sequelize, Sequelize);
db.dance_experience = require("./DanceExperience.js")(sequelize, Sequelize);
db.learning_sources = require("./LearningSources.js")(sequelize, Sequelize);
db.user_images = require("./UserImages.js")(sequelize, Sequelize);
db.attachments = require("./Attachment.js")(sequelize, Sequelize);
db.activities = require("./Activity.js")(sequelize, Sequelize);
db.events = require("./Event.js")(sequelize, Sequelize);
db.event_types = require("./EventType.js")(sequelize, Sequelize);
db.non_tango_activities = require("./NonTangoActivity.js")(sequelize, Sequelize);
db.event_activities = require("./EventActivity.js")(sequelize, Sequelize);
db.event_participants = require("./EventParticipant.js")(sequelize, Sequelize);
db.feelings = require("./Feeling.js")(sequelize, Sequelize);
db.friends = require("./Friend.js")(sequelize, Sequelize);
db.group_activities = require("./GroupActivity.js")(sequelize, Sequelize);
db.groups = require("./Group.js")(sequelize, Sequelize);
db.invites = require("./Invite.js")(sequelize, Sequelize);
db.notifications = require("./Notification.js")(sequelize, Sequelize);
db.pages = require("./Page.js")(sequelize, Sequelize);
db.blocked_users = require("./BlockedUser.js")(sequelize, Sequelize);
db.report_types = require("./ReportType.js")(sequelize, Sequelize);
db.reports = require("./Report.js")(sequelize, Sequelize);
db.subscriptions = require("./Subscription.js")(sequelize, Sequelize);
db.transactions = require("./Transaction.js")(sequelize, Sequelize);
db.user_subscriptions = require("./UserSubscription.js")(sequelize, Sequelize);
db.user_travels = require("./UserTravel.js")(sequelize, Sequelize);
db.posts = require("./Post.js")(sequelize, Sequelize);
db.post_comments = require("./PostComment.js")(sequelize, Sequelize);
db.post_comment_likes = require("./PostCommentLike")(sequelize, Sequelize);
db.post_likes = require("./PostLike.js")(sequelize, Sequelize);
db.post_shares = require("./PostShare.js")(sequelize, Sequelize);
db.group_members = require("./GroupMember.js")(sequelize, Sequelize);
db.notifications = require("./Notification.js")(sequelize, Sequelize);
db.event_participants = require("./EventParticipant.js")(sequelize, Sequelize);

db.settings = require("./Setting.js")(sequelize, Sequelize);
db.lookups = require("./Lookup.js")(sequelize, Sequelize);
db.lookup_data = require("./LookupData.js")(sequelize, Sequelize);


db.chat_rooms = require('./ChatRooms.js')(sequelize, Sequelize)
db.chat_room_users = require('./ChatRoomUsers.js')(sequelize, Sequelize)
db.chat_messages = require('./ChatMessages.js')(sequelize, Sequelize)
db.chat_message_status = require('./ChatMessageStatus.js')(sequelize, Sequelize)

db.save_posts = require('./SavePost.js')(sequelize, Sequelize)
db.hide_posts = require('./HidePost.js')(sequelize, Sequelize)
db.pin_groups = require('./PinGroup.js')(sequelize, Sequelize)
db.languages = require('./Language.js')(sequelize, Sequelize)
db.group_visitors = require('./GroupVisitor.js')(sequelize, Sequelize)
db.help_supports = require('./HelpSupport.js')(sequelize, Sequelize)
db.faqs = require('./Faqs.js')(sequelize, Sequelize)

db.webhook_logs = require("./WebhookLog.js")(sequelize, Sequelize);


/**User Api Token Models Relationships Or Association */
db.users.hasOne(db.user_api_tokens, {foreignKey: "user_id", sourceKey: 'id', as: "UserApiToken_Slug_Single"});
db.users.hasMany(db.user_api_tokens, {foreignKey: "user_id", sourceKey: 'id'});
db.user_api_tokens.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

db.users.hasMany(db.user_images, {foreignKey: "user_id", sourceKey: 'id'});
db.user_images.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// User and their questions associations
db.users.hasOne(db.user_questions, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "user_questions"
})
db.user_questions.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// User and their tango activities associations
db.users.hasOne(db.tango_activities, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "tango_activities"
})
db.tango_activities.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// teaching_experience
db.users.hasOne(db.teaching_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "teaching_experiences"
})
db.teaching_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// dj_experience
db.users.hasOne(db.dj_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "dj_experiences"
})
db.dj_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// organizer_experience
db.users.hasOne(db.organizer_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "organizer_experiences"
})
db.organizer_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// performer_experience
db.users.hasOne(db.performer_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "performer_experiences"
})
db.performer_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// host_experience
db.users.hasMany(db.host_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "host_experiences"
})
db.host_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// creator_experience
db.users.hasOne(db.creator_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "creator_experiences"
})
db.creator_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// photographer_experience
db.users.hasOne(db.photographer_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "photographer_experiences"
})
db.photographer_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// tour_operator_experience
db.users.hasOne(db.tour_operator_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "tour_operator_experiences"
})
db.tour_operator_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});


// dance_experience
db.users.hasOne(db.dance_experience, {
    foreignKey: "user_id",
    sourceKey: 'id',
    as: "dance_experiences"
})
db.dance_experience.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

// learning_sources
db.users.hasMany(db.learning_sources, {
    foreignKey: "user_id",
    sourceKey: 'id'
})
db.learning_sources.belongsTo(db.users, {
    foreignKey: "user_id",
    targetKey: 'id'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
})

/*User Groups Model Relation */
db.user_groups.hasMany(db.users, {foreignKey: "user_type", sourceKey: 'type'});
db.users.belongsTo(db.user_groups, {
    foreignKey: "user_type",
    targetKey: 'type'
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});


/*Lookup Data Model Relation */
db.lookups.hasMany(db.lookup_data, {foreignKey: "lookup_id", sourceKey: 'id', as: "LookupData_LookupSlug"});
db.lookup_data.belongsTo(db.lookups, {
    foreignKey: "lookup_id",
    targetKey: 'id',
    as: "LookupData_LookupSlug"
}, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
});

db.activities.hasMany(db.activities, {
    foreignKey: "parent_id",
    targetKey: "id",
    as: "parent_activity_fk"
})

db.users.hasMany(db.events, {foreignKey: 'user_id'});
db.events.belongsTo(db.users, {foreignKey: 'user_id', as: 'user'});
db.event_participants.belongsTo(db.event_participants, {foreignKey: 'event_id', as: "mutual_event", onDelete: 'CASCADE', onUpdate: 'CASCADE'});

db.groups.hasMany(db.events, {foreignKey: 'event_type_id'})
db.events.belongsTo(db.groups, {foreignKey: 'event_type_id', as: 'city_group'})
// db.non_tango_activities.belongsTo(db.event_activities, {foreignKey: 'event_type_id', as: 'city_group'})

db.users.hasMany(db.event_participants, {foreignKey: 'user_id'});
db.event_participants.belongsTo(db.users, {foreignKey: 'user_id'});

db.event_types.hasMany(db.events, {foreignKey: 'event_type_id'});
db.events.belongsTo(db.event_types, {foreignKey: 'event_type_id'});

db.events.hasMany(db.event_activities, {foreignKey: 'event_id'});
db.event_activities.belongsTo(db.events, {foreignKey: 'event_id'});

db.event_activities.belongsTo(db.non_tango_activities, {foreignKey: 'non_tango_activity_id'});

db.events.hasMany(db.event_activities, {foreignKey: 'event_id'});
db.event_activities.belongsTo(db.events, {foreignKey: 'event_id'});

db.events.hasMany(db.event_participants, {foreignKey: 'event_id'});
db.event_participants.belongsTo(db.events, {foreignKey: 'event_id'});

db.users.hasMany(db.event_participants, {foreignKey: 'user_id'});
db.event_participants.belongsTo(db.users, {foreignKey: 'user_id'});

db.invites.belongsTo(db.users, {foreignKey: 'invite_from_id', as: 'InviteFromUser'});
db.invites.belongsTo(db.users, {foreignKey: 'invite_to_id', as: 'InviteToUser'});
db.users.hasMany(db.invites, {foreignKey: 'invite_from_id', as: 'InvitesSent'});
db.users.hasMany(db.invites, {foreignKey: 'invite_to_id', as: 'InvitesReceived'});

db.groups.belongsTo(db.users, {foreignKey: 'user_id'});
db.groups.hasMany(db.group_activities, {foreignKey: 'group_id'});
db.groups.hasMany(db.group_members, {foreignKey: 'group_id'});

// GroupActivity associations
db.group_activities.belongsTo(db.users, {foreignKey: 'group_id'});
db.group_activities.belongsTo(db.non_tango_activities, {foreignKey: 'non_tango_activity_id'});

// GroupMember associations
db.group_members.belongsTo(db.groups, {foreignKey: 'group_id'});
db.group_members.belongsTo(db.users, {foreignKey: 'user_id'});
db.group_members.belongsTo(db.group_members, {foreignKey: 'group_id', as: "mutual_group", onDelete: 'CASCADE', onUpdate: 'CASCADE'});

// User associations (if not already defined)
db.users.hasMany(db.groups, {foreignKey: 'user_id'});
db.users.hasMany(db.group_members, {foreignKey: 'user_id'});

// User associations (if not already defined)
db.users.hasMany(db.posts, {foreignKey: 'user_id'});
db.users.hasMany(db.posts, {foreignKey: 'shared_by'});
db.users.hasMany(db.post_comments, {foreignKey: 'user_id'});
db.users.hasMany(db.post_likes, {foreignKey: 'user_id'});
db.users.hasMany(db.post_comment_likes, {foreignKey: 'user_id'});
db.users.hasMany(db.post_shares, {foreignKey: 'user_id'});

db.posts.belongsTo(db.users, {foreignKey: 'user_id'});
db.posts.belongsTo(db.users, {foreignKey: 'shared_by', as: 'shared_by_user'});
db.posts.belongsTo(db.groups, {foreignKey: 'group_id', as: 'post_group'});
db.posts.belongsTo(db.events, {foreignKey: 'event_id', as: 'post_event'});
db.posts.belongsTo(db.activities, {foreignKey: 'activity_id'});
db.posts.belongsTo(db.feelings, {foreignKey: 'feeling_id'});

db.posts.hasMany(db.post_comments, {foreignKey: 'post_id'});
db.posts.hasMany(db.post_likes, {foreignKey: 'post_id'});
db.posts.hasMany(db.post_shares, {foreignKey: 'post_id'});

// postComment associations
db.post_comments.belongsTo(db.posts, {foreignKey: 'post_id'});
db.post_comments.belongsTo(db.users, {foreignKey: 'user_id'});
db.post_comments.belongsTo(db.post_comments, {as: 'parentComment', foreignKey: 'parent_id'});

db.post_comments.hasMany(db.post_comments, {as: 'replies', foreignKey: 'parent_id'});
db.post_comments.hasMany(db.post_comment_likes, {as: 'comment_likes', foreignKey: 'comment_id'});

db.post_comment_likes.belongsTo(db.post_comments, {foreignKey: 'comment_id'})
db.post_comment_likes.belongsTo(db.users, {foreignKey: 'user_id'});

// postLike associations
db.post_likes.belongsTo(db.posts, {foreignKey: 'post_id'});
db.post_likes.belongsTo(db.users, {foreignKey: 'user_id'});

// postShare associations
db.post_shares.belongsTo(db.posts, {foreignKey: 'post_id'});
db.post_shares.belongsTo(db.users, {foreignKey: 'user_id'});


db.report_types.belongsTo(db.report_types, {as: 'parentType', foreignKey: 'parent_id'});
db.report_types.hasMany(db.report_types, {as: 'childTypes', foreignKey: 'parent_id'});

// Report associations
db.reports.belongsTo(db.users, {foreignKey: 'user_id', as: "reporter_user"});
db.reports.belongsTo(db.report_types, {foreignKey: 'report_type_id'});

// User associations (if not already defined)
db.users.hasMany(db.reports, {foreignKey: 'user_id'});

// UserTravels Model
db.user_travels.belongsTo(db.users, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.user_travels.belongsTo(db.event_types, {foreignKey: 'event_type_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.user_travels.belongsTo(db.user_travels, {foreignKey: 'user_id', as: "mutual_travel", onDelete: 'CASCADE', onUpdate: 'CASCADE'});

// Transactions Model
db.transactions.belongsTo(db.users, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

// UserSubscriptions Model
db.user_subscriptions.belongsTo(db.users, {foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.user_subscriptions.belongsTo(db.subscriptions, {
    foreignKey: 'subscription_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Friends Model
db.friends.belongsTo(db.users, {foreignKey: 'user_id', as: "friend_user", onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.friends.belongsTo(db.users, {foreignKey: 'friend_id', as: "friend", onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.friends.belongsTo(db.friends, {foreignKey: 'friend_id', as: "mutual_friend", onDelete: 'CASCADE', onUpdate: 'CASCADE'});

// BlockedUsers Model
db.blocked_users.belongsTo(db.users, {foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
db.blocked_users.belongsTo(db.users, {foreignKey: 'blocked_user_id', as: 'blocked_user', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

db.posts.hasMany(db.save_posts, {
    foreignKey: 'post_id',
    as: 'saved_posts'
});

db.save_posts.belongsTo(db.posts, {
    foreignKey: 'post_id',
    as: 'post'
});


db.save_posts.belongsTo(db.users, {
    foreignKey: 'user_id',
    as: 'user'
});

db.posts.hasMany(db.hide_posts, {
    foreignKey: 'post_id',
    as: 'hide_post'
});

db.hide_posts.belongsTo(db.posts, {
    foreignKey: 'post_id',
    as: 'post'
});


db.hide_posts.belongsTo(db.users, {
    foreignKey: 'user_id',
    as: 'user'
});

db.group_visitors.belongsTo(db.users, {
    foreignKey: 'user_id',
    as: 'user'
});
db.group_visitors.belongsTo(db.groups, {
    foreignKey: 'group_id',
    as: 'group'
});


// checking association

// db.posts.hasMany(db.attachments, {
//     foreignKey: 'instance_id',
//     constraints: false,
//     scope: {
//         instance_type: 'post'
//     }
// });
// //
// db.attachments.belongsTo(db.posts, {
//     foreignKey: 'instance_id',
//     constraints: false
// });
// //
// db.host_experience.hasMany(db.attachments, {
//     foreignKey: 'instance_id',
//     constraints: false,
//     scope: {
//         instance_type: 'housing-host'
//     }
// });
// //
// db.attachments.belongsTo(db.host_experience, {
//     foreignKey: 'instance_id',
//     constraints: false
// });
ChatAssociation(db);

module.exports = db;

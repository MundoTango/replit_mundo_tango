import { useReadNotificationMutation } from "@/data/services/notificationApi";
import { PATH_DASHBOARD } from "@/routes/paths";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const NotificationList = ({
  setShowNotificationPopup,
  notificationListing,
  refetch,
  setActiveTab,
  activeTab,
}) => {
  const { push } = useRouter();

  const [readNotification] = useReadNotificationMutation();

  const notificationsAll = [
    {
      id: "today",
      day: "TODAY",
      data: [
        {
          id: 1,
          name: "Bessie Cooper",
          type: "Message",
          time: "08:15",
          unread: true,
          date: "Today",
        },
        {
          id: 2,
          name: "Update",
          type: "Update your Platform",
          time: "08:15",
          unread: true,
          date: "Today",
        },
        {
          id: 3,
          name: "Courtney Henry",
          type: "Post an Ad",
          time: "08:15",
          unread: false,
          date: "Today",
        },
      ],
    },
    {
      day: "YESTERDAY",
      data: [
        {
          id: 4,
          name: "Esther Howard",
          type: "Saved Your Ad",
          time: "08:15",
          unread: false,
          date: "Yesterday",
        },
        {
          id: 5,
          name: "Kathryn Murphy",
          type: "Saved Your Ad",
          time: "08:15",
          unread: false,
          date: "Yesterday",
        },
      ],
    },
  ];

  const formatNotifications = (data) => {
    const notifications = [];

    const formatTime = (dateString) => {
      const date = new Date(dateString);
      return `${date.getHours()}:${
        date.getMinutes() < 10 ? "0" : ""
      }${date.getMinutes()}`;
    };

    const getDayLabel = (createdAt) => {
      const today = new Date();
      const createdDate = new Date(createdAt);
      if (
        createdDate.getDate() === today.getDate() &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      ) {
        return "Today";
      } else if (
        createdDate.getDate() === today.getDate() - 1 &&
        createdDate.getMonth() === today.getMonth() &&
        createdDate.getFullYear() === today.getFullYear()
      ) {
        return "Yesterday";
      } else {
        return createdDate.toLocaleDateString();
      }
    };

    const groupedNotifications = data?.reduce((acc, item) => {
      const dayLabel = getDayLabel(item.createdAt);
      const formattedNotification = {
        // id: item.id,
        // name: item.title,
        // type: item.type,
        ...item,
        unread: true,
        time: formatTime(item.createdAt),
        date: dayLabel,
      };

      if (!acc[dayLabel]) {
        acc[dayLabel] = [];
      }
      acc[dayLabel].push(formattedNotification);
      return acc;
    }, {});

    const result = Object.keys(groupedNotifications).map((day) => ({
      day: day.toUpperCase(),
      data: groupedNotifications[day],
    }));

    return result;
  };

  const record = formatNotifications(notificationListing);

  const ReadNotification = async (id, index) => {
    try {
      const result = await readNotification(id);

      if (result?.error?.data?.code === 400) {
        toast.error(result?.error?.data?.message);
        return;
      }

      if (result?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      const { code, data } = result?.data;

      if (code === 200) {
        console.log("Notification read successfully");
        refetch();
        record[index].data.forEach((notification) => {
          if (notification.id === id) {
            notification.unread = false;
          }
        });
        //  setShowNotificationPopup(false);
      }
    } catch (error) {}
  };

  return (
    <div className={`rounded-lg shadow-lg p-5 bg-white text-black mt-3`}>
      <div className="flex justify-between border-b-2 border-gray-200 pb-2">
        <p className="font-bold text-lg">Notification</p>
        <button
          className="rounded-full p-1 bg-transparent border-none"
          onClick={() => setShowNotificationPopup(false)}
        >
          ✕
        </button>
      </div>
      <div className="flex mt-4 mb-2">
        <button
          className={`flex items-center justify-center px-3 py-1 rounded-full ${activeTab === 0 ? "bg-btn-color text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setActiveTab(0)}
        >
          Unread
        </button>
        <button
          className={`flex items-center justify-center px-3 py-1 ml-2 rounded-full ${activeTab === 1 ? "bg-btn-color text-white" : "bg-gray-200 text-gray-600"}`}
          onClick={() => setActiveTab(1)}
        >
          Viewed
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {!!record?.length ? (
          record.map(({ data, day }, index) => (
            <div className="mb-4" key={index}>
              <div className="font-semibold text-gray-500 mb-2">{day}</div>
              {!!data?.length &&
                data.map((value, i) => (
                  <div
                    className={`flex items-center p-3 mb-3 rounded-lg bg-gray-100 border border-gray-200 ${value?.type == "admin" ? "" : "cursor-pointer"}`}
                    key={i}
                    onClick={() => {
                      ReadNotification(value?.id, index);
                      if (value?.type == "friend-request") {
                        push(
                          PATH_DASHBOARD.profile.userProfile(value?.instance_id)
                        );
                      } else if (value?.type == "invite-event") {
                        push(
                          PATH_DASHBOARD.event.eventDetail(value?.instance_id)
                        );
                      } else if (value?.type == "join-group") {
                        push(
                          PATH_DASHBOARD.group.groupDetail(value?.instance_id)
                        );
                      } else if (value?.type == "request-group") {
                        push(
                          PATH_DASHBOARD.group.groupDetail(value?.instance_id)
                        );
                      } else if (value?.type == "request-group-update") {
                        push(
                          PATH_DASHBOARD.group.groupDetail(value?.instance_id)
                        );
                      } else if (value?.type == "post-comment") {
                        push(
                          PATH_DASHBOARD.post.postDetail(value?.instance_id)
                        );
                      } else if (value?.type == "post-share") {
                        push(
                          PATH_DASHBOARD.post.postDetail(value?.instance_id)
                        );
                      } else if (value?.type == "post-like") {
                        push(
                          PATH_DASHBOARD.post.postDetail(value?.instance_id)
                        );
                      }
                    }}
                  >
                    <div className="mr-3">
                      <img
                        src={value?.image_url}
                        alt="Avatar"
                        className="object-cover w-12 h-12 rounded-full"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className={`font-semibold text-gray-800`}>
                        {value.title}
                      </h3>
                      <p className={`text-sm text-gray-600`}>{value.type}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className={`text-xs ${value.unread ? "font-semibold" : "text-gray-500"}`}
                      >
                        {value.time}
                      </div>
                      {!value.is_read && (
                        <div className="w-2 h-2 bg-btn-color rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))
        ) : (
          <p className="w-full text-center text-gray-text-color text-sm">
            Notification Not Available
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationList;

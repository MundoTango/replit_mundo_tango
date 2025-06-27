"use client";

import SpinnerLoading from "@/components/Loadings/Spinner";
import React, { useEffect, useRef, useState } from "react";
import { Friend1, Friend2, FriendOne } from "@/utils/Images";
import RHFTextField from "@/components/FORMs/RHFTextField";
import EmojIcon from "@/components/SVGs/EmojIcon";
import LinkIcon from "@/components/SVGs/LinkIcon";
import { useForm } from "react-hook-form";
import { useAuthContext } from "@/auth/useAuthContext";
import { Menu, MenuItem } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { SocketProvider, useSocket } from "@/auth/SocketContext";
import socketIo from "@/auth/Socket";
import {
  useAddMediaMutation,
  useBlockUserMutation,
  useGetAllUsersQuery,
  useRemoveConnectionMutation,
} from "@/data/services/friendApi";
import toast from "react-hot-toast";
import SearchIcon from "@/components/SVGs/SearchIcon";
import { formatTime, formatTimestamp } from "@/utils/helper";
import EmojiPicker from "emoji-picker-react";
import { SwipperComponent } from "@/components/Swiper";
import DeleteModal from "@/components/Modal/DeleteModal";
import InfiniteScroll from "react-infinite-scroll-component";
import { useSelector } from "react-redux";

export default function Page() {
  const socket = useSocket();
  const {
    data: getUser,
    isLoading: getUserLoading,
    error,
  } = useGetAllUsersQuery({group_id:""});
  const [searchUsers, setSearchUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [chatThreads, setChatThreads] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showUnread, setShowUnread] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [chatThreadHistory, setChatThreadHistory] = useState({});
  const user_id = useSelector((state) => state.user.user);

  const handleFileClick = (file) => {
    if (file.type.startsWith("application/pdf")) {
      console.log("PDF file:", file);
      window.open(URL.createObjectURL(file), "_blank");
    } else {
      console.log("Other file:", file);
    }
  };

  useEffect(() => {
    getFindOrCreateRoom(user_id?.slug);
    setChatThreadHistory({
      chat_room_slug: user_id?.chat_room_slug,
      slug: user_id?.user_slug || user_id?.slug,
      room_name: user_id?.room_name,
      firstname: user_id?.firstname,
      lastname: user_id?.lastname,
      name: user_id?.name,
      username: user_id?.username,
      image_url: user_id?.image_url,
    });
  }, [user_id?.slug]);

  const getChatHistory = (threadId) => {
    socketIo.emit("_loadChatHistory", {
      chat_room_slug: threadId,
      page: 1,
      limit: 5,
    });

    const handleLoadChatHistory = (history) => {
      setChatThreadHistory((prev) => ({
        ...prev,
        // room_name,
        // image_url,
        // members,
        // chat_room_slug: chat_room_slug,
        data:
          page === 1
            ? history.data
            : prev?.data?.length > 0 && [...history.data, ...prev?.data],
      }));
      setPagination(history?.links);
    };

    socketIo.on("loadChatHistory_", handleLoadChatHistory);

    return () => {
      socketIo.off("loadChatHistory_", handleLoadChatHistory);
    };
  };

  const getChatThreads = () => {
    socketIo.emit("_getChatThreads");
  };

  const joinRoom = (chat_room_slug) => {
    const handleNewRoom = (data) => {
      setSearch("");
      getChatHistory(chat_room_slug);
      getChatThreads();
      // setChatThreads(threads);
    };

    socketIo.emit("_joinRoom", chat_room_slug );

    socketIo.on("room_", handleNewRoom);

    return () => {
      socketIo.off("room_", handleNewRoom);
    };
  };
  const getFindOrCreateRoom = (target_user_slug) => {
    const handleFindOrCreateRoom = (data) => {
      if (data) {
        joinRoom(data?.data?.chat_room_slug);
      }
    };

    const handleNewRoom = (data) => {};

    socketIo.emit("_findOrCreateRoom", { target_user_slug });

    socketIo.on("findOrCreateRoom_", handleFindOrCreateRoom);
    socketIo.on("newRoom_", handleNewRoom);

    return () => {
      socketIo.off("findOrCreateRoom_", handleFindOrCreateRoom);
      socketIo.off("newRoom_", handleNewRoom);
    };
  };

  // useEffect(() => {
  //   if (tab === 'chat') {
  //     setChatThreads(data?.data || [])
  //     dispatch(setChatList(data?.data || []));
  //     // getChatThreads();
  //   } else {
  //     getGroupThreads();
  //   }
  // }, [tab]);

  useEffect(() => {
    socketIo.emit("_getChatThreads");
    setLoading(true);
    const handleChatThreads = (response) => {
      if (response.code === 200) {
        setChatThreads(response.data);
        setThreads(response.data);
        setLoading(false);
      }
    };
    socketIo.on("getChatThreads_", handleChatThreads);

    return () => {
      socketIo.dispose("getChatThreads_", handleChatThreads);
    };
  }, [socketIo]);

  useEffect(() => {
    const handleNewThread = (newThread) => {
      console.log("New thread received:", newThread);
      setChatThreads((prevThreads) => [...prevThreads, newThread]);
    };

    socketIo.on("newThread_", handleNewThread);

    return () => {
      socketIo.dispose("newThread_", handleNewThread);
    };
  }, [socketIo]);

  const searchUser = (e) => {
    try {
      const value = e.target.value;
      setSearch(value);
      if (value == "") {
        setChatThreads(threads);
        return;
      } else {
        let list = getUser?.data?.filter((v) =>
          v?.username?.toLowerCase()?.includes(value?.toLowerCase())
        );
        setChatThreads([...list, ...chatThreads]);
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SocketProvider>
      <div
        className="bg-white p-3 md:centered_card mt-6 mr-6 cursor-pointer relative"
        style={{ height: "calc(100vh - 128px)" }}
      >
        <div className="flex items-center justify-between md:pr-[1.5rem]">
          <h2 className="text-2xl font-[700] mb-3">Messages</h2>
          <h2
            className="text-xl font-[700] mb-3"
            onClick={() => setShowUnread(false)}
          >
            Mark all as read
          </h2>
        </div>
        <div className="">
          <div className="flex flex-col md:flex-row">
            <Chatlist
              searchUser={searchUser}
              chatThreads={chatThreads}
              setChatThreadHistory={setChatThreadHistory}
              searchUsers={searchUsers}
              getUserLoading={getUserLoading}
              chatThreadHistory={chatThreadHistory}
              getChatHistory={getChatHistory}
              getFindOrCreateRoom={getFindOrCreateRoom}
              loading={loading}
              search={search}
              showUnread={showUnread}
              pagination={pagination}
              setPagination={setPagination}
            />
            <ChatWindow
              chatThreadHistory={chatThreadHistory}
              setChatThreadHistory={setChatThreadHistory}
              getChatHistory={getChatHistory}
              getChatThreads={getChatThreads}
              page={page}
              setPage={setPage}
              getUser={getUser}
            />
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}

export const MenuPop = ({
  handleClose,
  anchorEl,
  open,
  setDeleteThreadConfirm,
  data,
  onBlockUser,
  onRemoveUserConnection
}) => {
  const HeaderPopup = [
    {
      title: "Block User",
      className: "text-gray-text-color",
      onClick: () => onBlockUser(),
    },
    {
      title: "Report User",
      className: "text-gray-text-color",
      onClick: () => onRemoveUserConnection(),
    },
    {
      title: "Delete Chat",
      className: "text-[#ED4B3B]",
      onClick: () => setDeleteThreadConfirm(),
    },
  ];

  return (
    <Menu
      sx={{
        "& .MuiMenu-paper": {
          background: "#FFFFFF",
          border: "1px solid lightgrey",
          overflow: "auto",
          height: "150px",
          marginTop: "10px",
          borderRadius: 5,
        },
        boxShadow: 0,
      }}
      elevation={0}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {HeaderPopup.map((item, index) => (
        <MenuItem key={index} onClick={item.onClick}>
          <div className="font-[Gilroy] px-3 flex gap-3 items-center m-1 justify-center ">
            <div className={item?.className}> {item?.title}</div>
          </div>
        </MenuItem>
      ))}
    </Menu>
  );
};

const Chatlist = ({
  chatThreads,
  searchUser,
  loading,
  setChatThreadHistory,
  searchUsers,
  getUserLoading,
  chatThreadHistory,
  getChatHistory,
  getFindOrCreateRoom,
  search,
  showUnread,
}) => {
  return (
    <>
      <div
        className={`order-first md:order-none w-full md:w-[30%] ${chatThreadHistory?.slug && "hidden md:block"}`}
      >
        <div className="mt-5">
          <div className="flex items-center gap-4 border border-[#E2E8F0] py-2 px-3 rounded-[12px] mb-3">
            <div>
              <SearchIcon />
            </div>
            <div className=" w-full">
              <input
                className="outline-none w-full text-gray-text-color font-bold text-sm"
                placeholder="Search Chat"
                onChange={searchUser}
                value={search}
              />
            </div>
          </div>
        </div>

        <div
          className="overflow-y-scroll"
          style={{
            height: "calc(100vh - 280px)",
            // searchUsers?.length === 0
            //   ? "calc(100vh - 230px)"
            //   : "calc(100vh - 460px)",
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <SpinnerLoading size={40} />
            </div>
          ) : !!chatThreads?.length ? (
            chatThreads.map(
              (
                {
                  room_name,
                  firstname,
                  lastname,
                  username,
                  name,
                  image_url,
                  slug,
                  unread_message_count,
                  chat_room_slug,
                  messages,
                  active,
                  user_slug,
                  user_images,
                  id,
                },
                index
              ) => (
                <div
                  key={index}
                  className="mb-5 px-2 py-2 bg-[#f8fafc] rounded-[12px] h-[103px]"
                  onClick={() => {
                    if (
                      chat_room_slug === undefined ||
                      chat_room_slug === null
                    ) {
                      getFindOrCreateRoom(slug);
                      setChatThreadHistory((prev) => ({
                        ...prev,
                        chat_room_slug: chat_room_slug,
                        slug: user_slug || slug,
                        room_name: room_name,
                        firstname: firstname,
                        lastname: lastname,
                        name: name,
                        username: username,
                        image_url:
                          user_images?.length > 0
                            ? user_images[0]?.image_url
                            : image_url,
                        id: id,
                      }));
                    } else {
                      getChatHistory(chat_room_slug);
                      setChatThreadHistory((prev) => ({
                        ...prev,
                        chat_room_slug: chat_room_slug,
                        slug: user_slug || slug,
                        room_name: room_name,
                        firstname: firstname,
                        lastname: lastname,
                        name: name,
                        username: username,
                        image_url:
                          user_images?.length > 0
                            ? user_images[0]?.image_url
                            : image_url,
                        data: messages,
                      }));
                    }
                  }}
                >
                  <div className="flex justify-between items-center px-3 py-3">
                    <div className="flex gap-3 items-center">
                      <div className="relative">
                        <img
                          src={
                            user_images?.length > 0
                              ? user_images[0]?.image_url
                              : image_url
                          }
                          alt=""
                          className="w-12 h-12 rounded-full"
                          loading="lazy"
                        />
                        {/* <div
                          className={`absolute bottom-[2px] right-0 w-[10px] h-[10px] rounded-full ${active ? "bg-[#01C7A3]" : "bg-[#858686]"}`}
                        ></div> */}
                      </div>
                      <div className="text-[#323232]">
                        <div className="font-extrabold text-md capitalize">
                          {firstname
                            ? `${firstname} ${lastname}`
                            : username
                              ? username
                              : name
                                ? name
                                : room_name}
                        </div>
                        <div className="text-xs ">{username}</div>
                      </div>
                    </div>
                    {unread_message_count !== undefined &&
                      showUnread &&
                      unread_message_count !== 0 && (
                        <div className="w-[10px] h-[10px] rounded-full bg-[#3086F3] animate-spin"></div>
                      )}
                  </div>
                  <p className="text-right text-[10px] ">
                    {formatTimestamp(messages?.createdAt || "")}
                  </p>
                </div>
              )
            )
          ) : (
            <div className="flex items-center justify-center h-40 text-xl font-bold">
              <h2>User not found !</h2>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ChatWindow = ({
  chatThreadHistory,
  setChatThreadHistory,
  getChatHistory,
  getChatThreads,
  setPage,
  page,
  pagination,
  setPagination,
  getUser
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loading, setLoading] = useState(false);
  const [city, setCity] = React.useState("City");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const open = Boolean(anchorEl);
  const { user } = useAuthContext();
  const [addMedia] = useAddMediaMutation();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [messageSlug, setMessageSlug] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteThreadConfirm, setDeleteThreadConfirm] = useState(false);
  const [deleteThreadLoading, setDeleteThreadLoading] = useState(false);
  const [sendLoader, setSendLoader] = useState(false);
  const [blockUser, { isLoading: blockUserLoading }] = useBlockUserMutation();
  const [removeConnection, { isLoading: removeConnectionLoading }] = useRemoveConnectionMutation();

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatThreadHistory?.data]);

  const fetchMoreMessages = () => {
    console.log("infinite func called");
    if (!loading) {
      setLoading(true);
      socketIo.emit("_loadChatHistory", {
        chat_room_slug: chatThreadHistory?.chat_room_slug,
        page: page,
        limit: 5,
      });
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log(files);
    setUploadedImages((prevImages) => [...prevImages, ...files]);
  };

  const filePreview = (file) => {
    if (file?.type?.startsWith("application/")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (file.type === "application/pdf") {
          const pdfBlob = new Blob([e.target.result], {
            type: "application/pdf",
          });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, "_blank");
        } else if (
          file.type === "application/msword" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "application/vnd.ms-excel" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          const blob = new Blob([e.target.result], { type: file.type });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
        } else if (file.type === "text/plain") {
          setImagePreview(e.target.result);
        } else {
          alert("Preview not supported for this file type.");
        }
      };

      if (
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.type.startsWith("application/vnd") ||
        file.type === "application/msword"
      ) {
        reader.readAsDataURL(file);
      } else {
        alert("Preview not supported for this file type.");
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => {
      const updatedMessage = prevMessage + emojiObject.emoji;
      // setValue("message", updatedMessage);
      return updatedMessage;
    });
    // setShowEmojiPicker(!showEmojiPicker);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prevImages) => {
      return prevImages.filter((_, i) => i !== index);
    });
  };

  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const imageSend = async () => {
    try {
      const formData = new FormData();
      uploadedImages.forEach((file) => {
        formData.append("media", file);
      });

      const response = await addMedia(formData);

      if (response?.data?.code === 200 && response.data?.data?.length > 0) {
        return response.data.data[0].image_url;
      } else {
        console.error("Image upload failed or no data returned.");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    }

    return "";
  };

  const onSubmit = async (data) => {
    const file = await imageSend();
    // const file = URL.createObjectURL(uploadedImages[0])
    if (chatThreadHistory?.chat_room_slug) {
      const messageData = {
        chat_room_slug: chatThreadHistory?.chat_room_slug,
        message: message?.trim(),
        message_type: uploadedImages?.length > 0 ? "FILE" : "TEXT",
        file_name: uploadedImages[0]?.name || null,
        file_url: file || "",
      };

      socketIo.emit("_sendMessage", messageData);
      setMessage("");
      setUploadedImages([]);
      setShowEmojiPicker(false);
    } else {
      const messageData = {
        target_user_slug: chatThreadHistory.slug,
        message: message?.trim(),
        message_type: uploadedImages?.length > 0 ? "FILE" : "TEXT",
        file_url: file || "",
        file_name: uploadedImages[0]?.name || null,
      };

      socketIo.emit("_sendMessage", messageData);
      socketIo.on("receivedMessage_", (res) => {
        if (res?.code === 200) {
          getChatHistory(res?.data?.chat_room_slug);
        }
      });
      setMessage("");
      setUploadedImages([]);
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    const handleReceivedMessage = (history) => {
      setChatThreadHistory((prev) => {
        const newData =
          prev?.data && Array.isArray(prev?.data)
            ? [...prev.data, history?.data]
            : [history?.data];
        return {
          ...prev,
          data: newData,
        };
      });
    };

    socketIo.on("receivedMessage_", handleReceivedMessage);

    return () => {
      socketIo.dispose("receivedMessage_", handleReceivedMessage);
    };
  }, [socketIo]);

  // useEffect(() => {
  //   console.log("setChistory?.data", chatThreadHistory);
  // }, [chatThreadHistory?.data]);

  const Image =
    chatThreadHistory?.user_images?.length > 0
      ? chatThreadHistory.user_images[0].image_url
      : chatThreadHistory?.image_url || "";

  const imge_preview = (file) => {
    if (file.type?.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (file.type?.startsWith("application/pdf")) {
      setImagePreview(URL.createObjectURL(file));
    } else return imagePreview;
    return imagePreview;
  };

  const deleteChatMessage = (messlug, is_fromEveryone = false) => {
    setDeleteLoading(true);
    const message_slug = messlug ? messlug : messageSlug;
    socketIo.emit("_deleteChatMessage", { message_slug, is_fromEveryone });

    socketIo.on("deleteChatMessage_", (data) => {
      if (data?.code === 200) {
        setDeleteLoading(false);
        toast.success("Message Deleted Successfully");
        setDeleteConfirm(false);
        setChatThreadHistory((prev) => {
          return {
            ...prev,
            data: prev.data.filter(
              (message) => message.message_slug !== message_slug
            ),
          };
        });
      }
    });
  };

  const deleteChatThread = () => {
    setDeleteLoading(true);
    const chat_room_slug =
      chatThreadHistory?.chat_room_slug || chatThreadHistory?.slug;
    socketIo.emit("_deleteChatThread", { chat_room_slug });

    socketIo.on("deleteChatThread_", (data) => {
      if (data?.code === 200) {
        toast.success("Chat thread deleted");
        setDeleteThreadConfirm(false);
        setDeleteThreadLoading(false);
        if (chatThreadHistory?.chat_room_slug === chat_room_slug) {
          setChatThreadHistory((prev) => {
            return {
              ...prev,
              data: [],
            };
          });
        }
      }
    });
  };

  const onBlockUser = async () => {
    try {
      const chat_room_slug =
      chatThreadHistory?.chat_room_slug || chatThreadHistory?.slug;
      const getId = getUser?.data.find(user => user.slug === (chatThreadHistory?.slug || user.slug === chatThreadHistory?.slug))
      const result = await blockUser({
        blocked_user_id: getId?.id || '',
      });

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Block user successfully");
        if (chatThreadHistory?.chat_room_slug === chat_room_slug) {
          setChatThreadHistory((prev) => {
            return {
              ...prev,
              data: [],
            };
          });
        }
      }
    } catch (e) {
      console.log(e.message);
      // toast.error("Seems like something went wrong");
    }
  };

  const onRemoveUserConnection = async () => {
    try {
      const chat_room_slug =
      chatThreadHistory?.chat_room_slug || chatThreadHistory?.slug;
      const getId = getUser?.data.find(user => user.slug === (chatThreadHistory?.slug || user.slug === chatThreadHistory?.slug))
      const result = await removeConnection(
        getId?.id || '',
      );

      const { code } = result?.data;
      if (code === 200) {
        toast.success("Report user successfully");
        if (chatThreadHistory?.chat_room_slug === chat_room_slug) {
          setChatThreadHistory((prev) => {
            return {
              ...prev,
              data: [],
            };
          });
        }
      }
    } catch (e) {
      console.log(e.message);
      // toast.error("Seems like something went wrong");
    }
  };

  return (
    <>
      {/* Second Column */}
      {chatThreadHistory?.slug ? (
        <div className={`w-full md:w-[70%] md:ml-4 md:mt-0 md:pr-[1.5rem]`}>
          <div className="h-full bg-[#f8fafc] rounded-b-[12px] rounded-t-[15px]">
            <div className="flex justify-between items-center px-5 bg-[#eef3fb] rounded-t-[15px] h-[100px]">
              <div className="flex gap-3 items-center">
                <div
                  className="block md:hidden cursor-pointer"
                  onClick={() => setChatUser({})}
                >
                  <KeyboardArrowLeftIcon />
                </div>
                <div className="relative cursor-default">
                  <img
                    src={Image}
                    alt=""
                    className="w-12 h-12 rounded-full"
                    loading="lazy"
                  />
                  {/* <div
                    className={`absolute bottom-[2px] right-0 w-[10px] h-[10px] rounded-full bg-[#01C7A3]`}
                  ></div> */}
                </div>
                <div className="text-[#323232]">
                  <div className="font-extrabold text-md capitalize">
                    {chatThreadHistory?.firstname
                      ? `${chatThreadHistory?.firstname} ${chatThreadHistory?.lastname}`
                      : chatThreadHistory?.username
                        ? chatThreadHistory?.username
                        : chatThreadHistory?.name
                          ? chatThreadHistory?.name
                          : chatThreadHistory?.room_name}
                  </div>
                  {/* <div className="text-xs">online</div> */}
                </div>
              </div>
              <div onClick={handleClick}>
                <img src="/images/message/3dots.svg" />
              </div>
              <MenuPop
                handleClose={handleClose}
                anchorEl={anchorEl}
                open={open}
                setDeleteThreadConfirm={() => setDeleteThreadConfirm(true)}
                onBlockUser={onBlockUser}
                onRemoveUserConnection={onRemoveUserConnection}
              />
            </div>
            <div
            // style={{ height: "calc(100vh - 180px)" }}
            >
              <div
                className={`d-flex overflow-auto p-4`}
                style={{ height: "calc(100vh - 370px)" }}
                ref={chatContainerRef}
              >
                {chatThreadHistory.data &&
                  chatThreadHistory.data.length > 0 && (
                    <InfiniteScroll
                      dataLength={chatThreadHistory.data.length}
                      next={fetchMoreMessages}
                      hasMore={
                        chatThreadHistory.data.length !=
                        (pagination?.total_records || pagination?.last)
                      }
                      loader={
                        <div className="flex items-center justify-center">
                          {" "}
                          {loading && <SpinnerLoading />}
                        </div>
                      }
                      inverse={true}
                      scrollThreshold={0.9}
                    >
                      {chatThreadHistory?.data?.map((x, i) => {
                        return (
                          <div
                            key={i}
                            className={`flex ${
                              x.user_slug === user?.slug
                                ? "gap-3 flex-row-reverse"
                                : `${
                                    x?.message?.includes("added")
                                      ? "justify-center"
                                      : "justify-start"
                                  }`
                            } mb-2`}
                          >
                            <div
                              onClick={() => {
                                setMessageSlug(x?.message_slug);
                                setDeleteConfirm(true);
                              }}
                            >
                              <p
                                className={`mb-1 text-[10px] text-light-gray-color ${
                                  x.user_slug === user?.slug
                                    ? "text-end mr-5"
                                    : ""
                                }`}
                              >
                                {x.user_slug === user?.slug
                                  ? formatTime(x?.message_timestamp)
                                  : // ? "you"
                                    `${
                                      x?.message?.includes("added")
                                        ? ""
                                        : // : `${chatUser?.firstname} ${chatUser?.lastname}`
                                          formatTime(x?.message_timestamp)
                                    }`}
                              </p>
                              <div
                                className={`w-full flex flex-col ${
                                  x.user_slug === user?.slug
                                    ? "items-end"
                                    : "items-start"
                                }`}
                              >
                                {x.file_url && (
                                  <div className="relative max-w-40 max-h-40 mb-2  rounded-3xl">
                                    <img
                                      // src={imge_preview(x?.file_url)}
                                      src={x?.file_url}
                                      alt="Image"
                                      className="img-fluid rounded"
                                      style={{
                                        maxWidth: "100%",
                                        height: "auto",
                                      }}
                                    />
                                  </div>
                                )}

                                {/* {x.file && (
                                  <a
                                    href="#"
                                    onClick={() => filePreview(x.file)}
                                  >
                                    {x.file?.name}
                                  </a>
                                )} */}
                              </div>
                              {x?.message && (
                                <div
                                  className={`p-3 ${
                                    x.user_slug === user?.slug
                                      ? "bg-[#94A3B8] text-white"
                                      : "bg-btn-color text-white"
                                  }`}
                                  style={{
                                    borderRadius:
                                      x.user_slug === user?.slug
                                        ? "25px 4px 25px 25px"
                                        : "4px 25px 25px 25px",
                                    width: "300px",
                                    maxWidth: "100%",
                                  }}
                                >
                                  <p
                                    className={`mb-1 text-sm px-4 ${
                                      x?.message?.includes("added")
                                        ? "text-center"
                                        : ""
                                    }`}
                                  >
                                    {x?.message}
                                  </p>
                                </div>
                              )}
                              <p
                                className={`mb-1 text-[10px] text-light-gray-color ${
                                  x.user_slug === user?.slug
                                    ? "text-end mr-5"
                                    : ""
                                }`}
                              >
                                {chatThreadHistory?.user_slug ||
                                chatThreadHistory?.slug === user?.slug
                                  ? "seen"
                                  : `${x?.message?.includes("added") ? "" : ``}`}
                              </p>
                            </div>
                            {!x?.message?.includes("added") && (
                              <p className="text-muted small ms-2 mt-2">
                                {/* {formatTimestamp(x?.message_timestamp || "")} */}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </InfiniteScroll>
                  )}
              </div>
            </div>
            <div className="relative">
              {uploadedImages.length > 0 && (
                <div
                  className="absolute bottom-[50px] overflow-x-auto rounded-xl w-11/12 flex mx-5 me-5 px-4 py-4 justify-start gap-2 items-center bg-white"
                  style={{ maxWidth: "95%", WebkitOverflowScrolling: "touch" }}
                >
                  {uploadedImages.map((file, index) => (
                    <div
                      key={index}
                      className="relative w-16 h-16 flex-shrink-0"
                    >
                      {file?.type.startsWith("image/") ? (
                        <img
                          className="w-full h-full object-cover rounded-md"
                          src={URL.createObjectURL(file)}
                          // src={file?.image_url}
                          alt={`uploaded-file-${index}`}
                        />
                      ) : file?.type.startsWith("video/") ? (
                        <video
                          className="w-full h-full object-cover rounded-md"
                          controls
                        >
                          <source
                            src={URL.createObjectURL(file)}
                            // src={file?.image_url}
                          />
                        </video>
                      ) : // : file?.type.startsWith("application/") ? (
                      //   <a
                      //     href="#"
                      //     onClick={() => filePreview(file)}
                      //     className="text-xs"
                      //   >
                      //     {file?.name}
                      //   </a>
                      //  )
                      null}

                      <button
                        className="absolute top-0 right-0 text-white bg-gray-400 p-1 rounded-full text-xs"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          width: "20px",
                          height: "20px",
                          padding: "2px",
                        }}
                      >
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center mx-4">
                <div className="mx-1 px-4 w-full flex items-center gap-3 bg-white rounded-[15px] relative">
                  <EmojIcon
                    className="cursor-pointer"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  />
                  {showEmojiPicker && (
                    <EmojiPicker
                      className="emoji-picker-component emoji-picker"
                      onEmojiClick={(e) => handleEmojiClick(e)}
                      open={showEmojiPicker}
                      style={{
                        height: "280px",
                        width: "350px",
                        position: "absolute",
                        bottom: "50px",
                        overflow: "auto",
                        left: "5px",
                      }}
                    />
                  )}
                  <input
                    type={"text"}
                    name="message"
                    control={control}
                    errors={errors}
                    placeholder="Type a message..."
                    className={`border-none shadow-none w-full rounded-lg p-3 pl-5 text-base outline-none`}
                    value={message}
                    onChange={(e) => setMessage(e?.target?.value)}
                    autoComplete="off"
                    aria-autocomplete="off"
                  />
                  <div
                    className="button"
                    onClick={() =>
                      document.getElementById("imageUpload").click()
                    }
                  >
                    <img src="/images/message/Vector.svg" className="w-4 h-4" />
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, text/plain, application/pdf"
                    id="fileUpload"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    className="button"
                    onClick={() =>
                      document.getElementById("imageUpload").click()
                    }
                  >
                    <img
                      src="/images/message/Exclude.svg"
                      className="w-4 h-4"
                    />
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    id="imageUpload"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    className="bg-tag-color w-[40px] h-[40px] flex justify-center items-center text-xs font-medium text-white rounded-full"
                  >
                    {sendLoader ? (
                      <SpinnerLoading />
                    ) : (
                      <img
                        src="/images/message/messagesSend.svg"
                        className="w-4 h-4"
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <DeleteModal
            open={deleteConfirm}
            handleClose={() => setDeleteConfirm(false)}
            onDecline={() => {
              deleteChatMessage("", false);
            }}
            isLoading={deleteLoading}
            text={"Are you sure you want to delete Message from Everyone?"}
            onAccept={() => {
              deleteChatMessage("", true);
            }}
          />
          <DeleteModal
            open={deleteThreadConfirm}
            handleClose={() => setDeleteThreadConfirm(false)}
            isLoading={deleteThreadLoading}
            text={"Are you sure you want to this delete?"}
            onAccept={() => {
              deleteChatThread();
            }}
          />
        </div>
      ) : (
        <p className="hidden md:flex justify-center items-center w-full md:w-[70%] md:ml-4 md:mt-0 text-light-gray-color">
          Select User to start chating
        </p>
      )}
    </>
  );
};

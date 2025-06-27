"use client";
import { useAuthContext } from "@/auth/useAuthContext";
import CreateModal from "@/components/Events/CreateEvent";
import CountryList from "@/components/Groups/CountryList";
import EditModal from "@/components/Groups/EditGroup";
import GroupCard from "@/components/Groups/GroupCard";
import ReportGroupView from "@/components/Groups/ReportGroupView";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import DownIcon from "@/components/SVGs/DownIcon";
import { useGetAllGroupsMutation } from "@/data/services/groupApi";
import AddIcon from "@mui/icons-material/Add";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Groups() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [city, setCity] = React.useState("");
  const [getAllGroups, { data, isLoading }] = useGetAllGroupsMutation();

  const [openModal, setOpenModal] = useState(false);

  const [ModalData, setModalData] = useState(null);

  const [openEditModal, setEDitOpenModal] = useState(false);

  const [groups, setGroups] = useState([]);

  const [reportModal, setReportModal] = useState(false);

  const [sharedModal, setSharedModal] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState({});

  const pathname = usePathname();

  const [url, setUrl] = useState("");

  const handleOpen = () => setOpenModal(true);

  const handleModalClose = () => setOpenModal(false);

  const handleEditModalClose = () => setEDitOpenModal(false);

  const type = "group";

  const open = Boolean(anchorEl);

  const userContext = useAuthContext();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    getAllGroups({ city: city });
  }, [city]);

  useEffect(() => {
    if (data) {
      setGroups(Array.isArray(data?.data) ? data.data : []);
    }
  }, [data]);

  const handleOpenSharedModal = (item) => {
    setUrl(`${window.location.origin}/user/group?q=${item.id}`);
    setSharedModal(true);
  };

  const refetch = async () => {
    try {
      await getAllGroups({ city: city });
    } catch (e) {
      console.log(e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="md:mt-6 bg-white centered_card md:mr-6 h-screen">
        <div className="flex items-center justify-center h-20">
          <SpinnerLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="md:mt-6 bg-white centered_card md:mr-6 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 ">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div className="flex items-end">
              <div className="text-2xl font-bold">Groups</div>
              <div
                className="cursor-pointer pl-1 ml-2 md:pl-0 flex items-center text-xs justify-end"
                onClick={handleClick}
              >
                <p className="text-gray-500">({city === "" ? "city" : city})</p>
                <div className="p-2">
                  <DownIcon color="gray" />
                </div>
              </div>
            </div>
            <div
              className="flex items-center gap-1 text-[#0D448A] py-2 font-semibold cursor-pointer"
              onClick={handleOpen}
            >
              <AddIcon className="text-xs" />
              <p className="text-sm">Create New Group</p>
            </div>

            {/* <MenuPop
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              setCity={setCity}
            /> */}
          </div>
        </div>
        <div className="col-span-12">
          <div className="text-xl font-semibold">Pending Request</div>
          <div className="text-light-gray-color text-sm md:text-base">
            Your pending request of group which you want to join.
          </div>
        </div>

        {groups?.filter((x) => x.is_joined === 1).length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              You have not request to join in any group.
            </p>
          </div>
        ) : (
          groups
            ?.filter((x) => x.is_joined === 1)
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <GroupCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  onOpenReportModal={() => {
                    setReportModal(true);
                    setSelectedGroup(item);
                  }}
                  setSharedModal={handleOpenSharedModal}
                  setGroups={setGroups}
                  groups={groups}
                  setEDitOpenModal={() => {
                    setModalData(item);
                    setEDitOpenModal(true);
                  }}
                />
              </div>
            ))
        )}
        <div className="col-span-12">
          <div className="text-xl font-semibold flex items-end gap-1">
            Groups You've Joined{" "}
            <p className="text-gray-500 text-sm">
              (
              {
                groups?.filter(
                  (x) =>
                    x.is_joined === 3 || x?.user?.id === userContext?.user?.id
                ).length
              }
              )
            </p>
          </div>
        </div>
        {groups?.filter(
          (x) => x.is_joined === 3 || x?.user?.id === userContext?.user?.id
        ).length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              You are not a member of any group.
            </p>
          </div>
        ) : (
          groups
            ?.filter(
              (x) => x.is_joined === 3 || x?.user?.id === userContext?.user?.id
            )
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <GroupCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  onOpenReportModal={() => {
                    setReportModal(true);
                    setSelectedGroup(item);
                  }}
                  setSharedModal={handleOpenSharedModal}
                  setGroups={setGroups}
                  groups={groups}
                  setEDitOpenModal={() => {
                    setModalData(item);
                    setEDitOpenModal(true);
                  }}
                />
              </div>
            ))
        )}
        <div className="col-span-12">
          <div className="text-xl font-semibold">Discover Group</div>
        </div>
        {groups?.filter(
          (x) => x.is_joined === 0 && x?.user?.id !== userContext?.user?.id
        ).length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              Groups Not Found
            </p>
          </div>
        ) : (
          groups
            ?.filter(
              (x) => x.is_joined === 0 && x?.user?.id !== userContext?.user?.id
            )
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <GroupCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  onOpenReportModal={() => {
                    setReportModal(true);
                    setSelectedGroup(item);
                  }}
                  setSharedModal={handleOpenSharedModal}
                  setGroups={setGroups}
                  groups={groups}
                  setEDitOpenModal={() => {
                    setModalData(item);
                    setEDitOpenModal(true);
                  }}
                />
              </div>
            ))
        )}
        <CreateModal
          open={openModal}
          handleClose={handleModalClose}
          title={type === "event" ? "Create Event" : "Create Group"}
          description={
            "Details - Remember to give instructions clearly so if someone is coming for the first time they know everything they need to know."
          }
          type={type}
          refetch={refetch}
        />
        <EditModal
          open={openEditModal}
          handleClose={handleEditModalClose}
          title={type === "event" ? "Update Event" : "Update Group"}
          description={
            "Details - Remember to give instructions clearly so if someone is coming for the first time they know everything they need to know."
          }
          type={type}
          refetch={refetch}
          data={ModalData}
        />
      </div>
      <ModelComponent
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        className={"w-[95%] md:w-[410px]"}
      >
        <CountryList
          handleClose={handleClose}
          setValue={setCity}
          value={city}
        />
      </ModelComponent>

      <ModelComponent
        open={reportModal}
        handleClose={() => setReportModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <ReportGroupView
          handleClose={() => setReportModal(false)}
          selectedGroup={selectedGroup}
        />
      </ModelComponent>

      <ModelComponent
        open={sharedModal}
        handleClose={() => setSharedModal(false)}
        className={"w-[95%] md:w-[50%]"}
      >
        <div className="p-5">
          <input
            type="text"
            className="input-text w-full h-10 pl-2 cursor-pointer"
            disabled
            value={url}
          />
          <button
            onClick={async () => {
              navigator.clipboard.writeText(url);
              toast.success("Copy to clipboard");
            }}
            className="mt-4 bg-btn-color text-white rounded-lg w-32 h-10"
          >
            Copy
          </button>
        </div>
      </ModelComponent>
    </div>
  );
}

export default Groups;

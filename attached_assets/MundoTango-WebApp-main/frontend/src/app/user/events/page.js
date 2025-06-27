"use client";
import CreateModal from "@/components/Events/CreateEvent";
import SpinnerLoading from "@/components/Loadings/Spinner";
import ModelComponent from "@/components/Modal/CustomModal";
import DownIcon from "@/components/SVGs/DownIcon";
import { useGetAllEventsQuery } from "@/data/services/eventAPI";
import AddIcon from "@mui/icons-material/Add";
import { Button, Menu, MenuItem } from "@mui/material";
import React from "react";
import EventCard from "../../../components/Events/EventCard";
import toast from "react-hot-toast";
import EditModal from "@/components/Groups/EditGroup";

function Events() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [city, setCity] = React.useState("City");
  const { data, refetch, isLoading } = useGetAllEventsQuery();

  const [openModal, setOpenModal] = React.useState(false);

  const [sharedModal, setSharedModal] = React.useState(false);

  const [editOpenModal, setEditOpenModal] = React.useState(null);

  const [ModalData, setModalData] = React.useState(null);

  const [url, setUrl] = React.useState("");

  const handleOpen = () => setOpenModal(true);
  const handleModalClose = () => setOpenModal(false);
  const type = "event";

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenSharedModal = (item) => {
    setUrl(`${window.location.origin}/user/event?q=${item.id}`);
    setSharedModal(true);
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-[700] tracking-wide">
                Your RSVP'ed Events
              </div>
            </div>
            <div
              className="flex items-end md:items-center gap-1 text-[#0D448A] font-semibold cursor-pointer mt-2 md:mt-0"
              onClick={handleOpen}
            >
              <AddIcon className="text-xs" />
              <p className="text-md tracking-wide">Create New Event</p>
            </div>

            {/* <MultiFilterAccordion
              handleClose={handleClose}
              anchorEl={anchorEl}
              open={open}
              setCity={setCity}
            /> */}
          </div>
        </div>
        <div className="col-span-12 flex justify-between items-center mt-4">
          <div className="text-xl font-[600]">Pending Invites</div>
          {/* <div
            className="cursor-pointer p-2.5 rounded-xl flex items-center text-xs gap-1 justify-center bg-[#0D448A] w-24"
            onClick={handleClick}
          >
            <p className="text-white font-semibold text-sm">Filter</p>
            <div className="p-2">
              <DownIcon color="white" />
            </div>
          </div> */}
        </div>

        {data?.data?.filter((x) => x.going_status === 1)?.length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              You are not interested in any group.
            </p>
          </div>
        ) : (
          data?.data
            ?.filter((x) => x.going_status === 1)
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <EventCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  handleShared={() => handleOpenSharedModal(item)}
                  setEDitOpenModal={() => {
                    setModalData(item);
                    setEditOpenModal(true);
                  }}
                />
              </div>
            ))
        )}
        <div className="col-span-12 flex justify-between items-center mt-12">
          <div className="text-xl font-[600]">
            Your local events and locations you follow
          </div>
        </div>

        {data?.data?.filter((x) => x.going_status === 2 || x.going_status == 3)?.length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              You have not follow any events to go.
            </p>
          </div>
        ) : (
          data?.data
            ?.filter((x) => x.going_status === 2 || x.going_status == 3)
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <EventCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  handleShared={() => handleOpenSharedModal(item)}
                  setEDitOpenModal={() => {
                    setModalData(item);
                    setEditOpenModal(true);
                  }}
                />
              </div>
            ))
        )}
        <div className="col-span-12 mt-12">
          <div className="text-xl font-[600] flex items-end gap-1">
            Discover events
          </div>
        </div>
        {data?.data?.filter((x) => x.going_status === 0)?.length === 0 ? (
          <div className="col-span-12">
            <p className="w-full text-center text-light-gray-color">
              No events found.
            </p>
          </div>
        ) : (
          data?.data
            ?.filter((x) => x.going_status === 0)
            ?.map((item, key) => (
              <div key={key} className="col-span-12 md:col-span-4">
                <EventCard
                  {...item}
                  item={item}
                  refetch={refetch}
                  handleShared={() => handleOpenSharedModal(item)}
                />
              </div>
            ))
        )}
        <CreateModal
          open={openModal}
          description={
            "Details - Remember to give instructions clearly so if someone is coming for the first time they know everything they need to know."
          }
          handleClose={handleModalClose}
          title={type === "event" ? "Create Event" : "Create Group"}
          type={type}
          refetch={refetch}
        />
        <EditModal
          open={editOpenModal}
          handleClose={() => setEditOpenModal(false)}
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

export default Events;

export const MultiFilterAccordion = ({ handleClose, anchorEl, open }) => {
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [selectedCity, setSelectedCity] = React.useState(null);
  const [selectedEventType, setSelectedEventType] = React.useState(null);

  const countries = [
    { value: "US", label: "United States" },
    { value: "IN", label: "India" },
    { value: "UK", label: "United Kingdom" },
  ];

  const cities = {
    US: [
      { value: "NYC", label: "New York City" },
      { value: "LA", label: "Los Angeles" },
    ],
    IN: [
      { value: "DEL", label: "Delhi" },
      { value: "MUM", label: "Mumbai" },
    ],
    UK: [
      { value: "LDN", label: "London" },
      { value: "MAN", label: "Manchester" },
    ],
  };

  const eventTypes = {
    NYC: [
      { value: "Concert", label: "Concert" },
      { value: "Sports", label: "Sports" },
    ],
    LA: [
      { value: "Festival", label: "Festival" },
      { value: "Concert", label: "Concert" },
    ],
    DEL: [
      { value: "Conference", label: "Conference" },
      { value: "Festival", label: "Festival" },
    ],
    MUM: [
      { value: "Workshop", label: "Workshop" },
      { value: "Sports", label: "Sports" },
    ],
    LDN: [
      { value: "Art", label: "Art" },
      { value: "Concert", label: "Concert" },
    ],
    MAN: [
      { value: "Conference", label: "Conference" },
      { value: "Sports", label: "Sports" },
    ],
  };

  const filteredCities = selectedCountry ? cities[selectedCountry.value] : [];
  const filteredEventTypes = selectedCity ? eventTypes[selectedCity.value] : [];

  return (
    <div style={{ padding: "20px" }}>
      <Menu
        sx={{
          "& .MuiMenu-paper": {
            background: "#FFFFFF",
            border: "1px solid lightgrey",
            overflow: "auto",
            height: "auto",
            borderRadius: 5,
          },
          boxShadow: 0,
        }}
        elevation={0}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem>
          <div>Country</div>
          <div>
            {countries.map((country) => (
              <Button
                key={country.value}
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSelectedCountry(country);
                  setSelectedCity(null);
                  setSelectedEventType(null);
                }}
              >
                {country.label}
              </Button>
            ))}
          </div>
        </MenuItem>

        {selectedCountry && (
          <MenuItem>
            <div>City</div>
            <div>
              {filteredCities.map((city) => (
                <Button
                  key={city.value}
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setSelectedCity(city);
                    setSelectedEventType(null);
                  }}
                >
                  {city.label}
                </Button>
              ))}
            </div>
          </MenuItem>
        )}

        {selectedCity && (
          <MenuItem>
            <div>Event Type</div>
            <div>
              {filteredEventTypes.map((eventType) => (
                <Button
                  key={eventType.value}
                  variant="outlined"
                  fullWidth
                  onClick={() => setSelectedEventType(eventType)}
                >
                  {eventType.label}
                </Button>
              ))}
            </div>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

import SearchIcon from "@/components/SVGs/SearchIcon";
import MapLocation from "./GoogleMap";
import Guests from "./Guests";
import {
  useGetAllEventsByCityMutation,
  useGetEventWithLocationsQuery,
} from "@/data/services/eventAPI";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import React, { useCallback, useState } from "react";
import { MapMarker } from "@/utils/Images";
import toast from "react-hot-toast";
import SpinnerLoading from "@/components/Loadings/Spinner";

const CommunityAboutContent = ({ record }) => {
  const [city, setCity] = useState("");

  const [location, setLocation] = useState([]);

  const [getAllEventsByCity, { isLoading }] = useGetAllEventsByCityMutation();

  const getEventByCity = async () => {
    try {
      if (!city) {
        toast.error("Write your city");
        return;
      }

      let word = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

      const result = await getAllEventsByCity({ query_type: 0, city: word });

      const { code, data } = result?.data;

      if (!data?.length) {
        toast.error("Record not found");
        return;
      }

      if (code === 200) {
        console.log(data);

        setLocation(data);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <div className="container-fluid md:mt-6 animate-fade-up">
      <div className="flex flex-col md:flex-row">
        {/* First Column */}
        <div className="order-first md:order-none w-full md:w-[58%]">
          <Guests record={record} />
        </div>

        {/* Second Column */}
        <div className="w-full md:w-[40%] md:ml-4 md:mt-0">
          <div className="main_card">
            <h2 className="text-[14px] font-[600]">{record?.location?.city}</h2>
            <p className="font-[400] text-[14px] text-light-gray-color mb-3">
              {record?.location?.location}, {record?.location?.country}
            </p>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-4 border border-[#E2E8F0] py-2 px-3 rounded-xl flex-1">
                <div>
                  <SearchIcon />
                </div>
                <div className="w-full">
                  <input
                    className="outline-none w-full text-gray-text-color font-semibold text-sm"
                    placeholder="Search your city here"
                    onChange={(e) => setCity(e.target.value)}
                    value={city || ""}
                  />
                </div>
              </div>
              <button
                disabled={isLoading}
                onClick={getEventByCity}
                className="h-10 text-white font-medium text-sm w-24 flex items-center justify-center rounded-xl bg-btn-color"
              >
                {isLoading ? <SpinnerLoading /> : "Search"}
              </button>
            </div>

            <MapPreview location={location} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAboutContent;

function MapPreview({ location }) {
  const containerStyle = {
    width: "100%",
    height: "35vh",
    borderRadius: "20px",
    marginTop: "15px",
  };

  const center = {
    lat: 24.8655364,
    lng: 67.0583857,
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);

  const [mapZoom] = useState(3.4);

  const [eventId, setEventId] = useState("");

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <React.Fragment>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        className="animate-fade-up"
      >
        {JSON.stringify(location)}
        {!!location?.length &&
          location.map(({ id, name, latitude, longitude }, index) => (
            <Marker
              // animation={window.google.maps.Animation.BOUNCE}
              icon={{ url: MapMarker }}
              onMouseOver={() => setEventId(id)}
              onMouseOut={() => setEventId(null)}
              position={{ lat: Number(latitude), lng: Number(longitude) }}
              key={index}
            >
              {eventId === id && (
                <InfoWindow
                  position={{
                    lat: Number(latitude),
                    lng: Number(longitude),
                  }}
                >
                  <div>{name || "N/A"}</div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>
    </React.Fragment>
  ) : (
    !isLoaded && (
      <div className="h-[90vh] flex items-center justify-center">
        <h1 className="font-medium text-3xl text-gray-text-color">
          Oops, something went wrong
        </h1>
      </div>
    )
  );
}

"use client";

import React, { useState } from "react";

import { useGetEventWithLocationsQuery } from "@/data/services/eventAPI";

import { PATH_DASHBOARD } from "@/routes/paths";

import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

import { useRouter } from "next/navigation";
import { MapMarker } from "@/utils/Images";
import SpinnerLoading from "@/components/Loadings/Spinner";

const containerStyle = {
  width: "98%",
  height: "90vh",
  borderRadius: "20px",
  marginTop: "15px",
};

const center = {
  lat: 37.0902,
  lng: -95.7129,
};

function TrangoCommunity() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const [eventId, setEventId] = useState("");

  const [mapZoom] = useState(5);

  const { push } = useRouter();

  const { data, isLoading: eventLoading } = useGetEventWithLocationsQuery({
    city: "",
  });

  const onLoad = React.useCallback(function callback(map) {
    // console.log(map);
    // const bounds = new window.google.maps.LatLngBounds(center);
    // map.fitBounds(bounds);
    // setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const redirectToEvent = async (id) => {
    try {
      const url = PATH_DASHBOARD.trangoCommunity.communityDetail(id);
      push(url);
    } catch (e) {
      console.log(e.message);
    }
  };

  return isLoaded ? (
    <React.Fragment>
      {eventLoading && <LoadingScreenMap />}

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={mapZoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        className="animate-fade-up"
      >
        {!!data?.data.length &&
          data?.data.map(({ id, latitude, longitude, name }, index) => (
            <Marker
              onClick={() => redirectToEvent(id)}
              onMouseOver={() => setEventId(id)}
              onMouseOut={() => setEventId(null)}
              position={{ lat: Number(latitude), lng: Number(longitude) }}
              key={index}
              icon={{ url: MapMarker }}
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
    !eventLoading && (
      <div className="h-[90vh] flex items-center justify-center">
        <h1 className="font-medium text-3xl text-gray-text-color">
          Oops, something went wrong
        </h1>
      </div>
    )
  );
}

export default React.memo(TrangoCommunity);

const LoadingScreenMap = () => {
  return (
    <div className="absolute w-full h-screen top-0 left-0 z-50 bg-gray-800 bg-opacity-50 flex items-center justify-center animate-fade-down">
      <SpinnerLoading />
    </div>
  );
};

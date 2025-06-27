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

const containerStyle = {
  width: "98%",
  height: "70vh",
  borderRadius: "20px",
  marginTop: "15px",
};


function MapLocation({ marker, id }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const center = {
    lat: Number(marker?.lat),
    lng: Number(marker?.lan),
  };

  const [map, setMap] = React.useState(null);

  const [eventId, setEventId] = useState("");

  const [mapZoom, setMapZoom] = useState(14);

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

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={mapZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker
        onMouseOver={() => setEventId(id)}
        onMouseOut={() => setEventId(null)}
        position={{ lat: Number(marker?.lat), lng: Number(marker?.lan) }}
      >
        {eventId === id && (
          <InfoWindow
            position={{
              lat: Number(marker?.lat),
              lng: Number(marker?.lan),
            }}
          >
            {/* Content for InfoWindow */}
            <div>{/* Your info window content */}</div>
          </InfoWindow>
        )}
      </Marker>
    </GoogleMap>
  ) : (
    <div className="h-20 flex items-center justify-center">
      <h1 className="font-medium text-3xl text-gray-text-color">
        Oops, something went wrong
      </h1>
    </div>
  );
}

export default React.memo(MapLocation);

//     <iframe
//     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345092064!2d144.963057615868!3d-37.81627974201416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d87cb2b2fddf!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1633044182654!5m2!1sen!2sau"
//     width="100%"
//     height="366px"
//     style={{ border: 0, borderRadius: "10px" }}
//     allowFullScreen=""
//     loading="lazy"
//     title="Map"
//   ></iframe>

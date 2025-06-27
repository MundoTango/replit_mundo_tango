import React from "react";
// import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";


const containerStyle = {
  width: "305px;",
  height: "366px",
};

const center = {
  lat: 40.7128, 
  lng: -74.006,
};

const MapLocation = ({h}) => {
  return (
    <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345092064!2d144.963057615868!3d-37.81627974201416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d87cb2b2fddf!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1633044182654!5m2!1sen!2sau"
    width="100%"
    height={h ? h : "366px"}
    style={{ border: 0, borderRadius: "10px" }}
    allowFullScreen=""
    loading="lazy"
    title="Map"
  ></iframe>
  );
};

export default MapLocation;

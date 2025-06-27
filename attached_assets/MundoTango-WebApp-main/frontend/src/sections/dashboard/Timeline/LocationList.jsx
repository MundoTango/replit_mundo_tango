import FeedSearch from "@/components/Search/FeedSearch";

import {
  Autocomplete,
  GoogleMap,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

const LocationList = ({ onSetActivity, formData }) => {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.006 });
  const [place, setPlace] = useState(null);
  const autocompleteRef = useRef(null);

  const onPlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();

    if (place && place.geometry) {
      const { lat, lng } = place.geometry.location;

      // Extract the address components
      const addressComponents = place.address_components;


      let streetNumber = '';
      let streetName = '';
      let block = '';
      let city = '';
      let state = '';
      let country = '';
      let postalCode = '';
      let sublocality_level_1 = '';
      let area = '';

      // Iterate through address components to get relevant details
      addressComponents.forEach(component => {
        const types = component.types;
        if (types.includes("neighborhood")) {
          streetNumber = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_3")) {
          streetName = component.long_name;
        } else if (types.includes("sublocality_level_2")) {
          block = component.long_name;
        } else if (types.includes("sublocality_level_1")) {
          sublocality_level_1 = component.long_name;
        } else if (types.includes("administrative_area_level_3")) {
          area = component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name || '';
        } else if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        } else if (types.includes("country")) {
          country = component.long_name || '';
        } else if (types.includes("plus_code")) {
          postalCode = component.long_name;
        }
      });

      // Combine the parts to form the full address
      const fullAddress = `${streetNumber} ${streetName} ${block} ${sublocality_level_1} ${area}  ${city} ${state}, ${country}, ${postalCode}`;
      const address = fullAddress?.split(",").join(" ");
      // Pass the full address and other location details to the parent component
      onSetActivity({
        latitude: lat(),
        longitude: lng(),
        location: address,
        street: `${streetNumber} ${streetName}`,
        city,
        state,
        country,
        postalCode,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl pt-5 animate-fade-up pb-3 h-[30vh]">
      <div className="px-5 font-bold">Location</div>

      <div className="mt-3 px-5">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceSelected}
          >
            <input
              type="text"
              placeholder="Search a place"
              className="outline-none w-full text-gray-text-color font-semibold text-sm input-text h-10 border pl-2"
            />
          </Autocomplete>
        </LoadScript>
        <p className="mt-4 text-gray-text-color">{`${formData?.location || ''}`}</p>
      </div>
    </div>
  );
};

export default LocationList;

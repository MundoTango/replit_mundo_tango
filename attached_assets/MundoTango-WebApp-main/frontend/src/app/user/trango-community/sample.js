"use client";

import React, { useState } from "react";

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

// function Page() {
//   const router = useRouter();
//   const geoUrl =
//     "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

//   const countries = [
//     { name: "US", coordinates: [-100, 40] },
//     //         height: "65vh",
//     //         width: "100%",
//     //       }}
//     { name: "United Kingdom", coordinates: [-1.5, 55] },
//     { name: "Japan", coordinates: [138.2529, 36.2048] },
//     { name: "Brazil", coordinates: [-51.9253, -14.235] },
//     { name: "Australia", coordinates: [133.7751, -25.2744] },
//     { name: "New Zealand", coordinates: [174.8859, -40.9006] },
//     { name: "Ireland", coordinates: [-8, 53.4] },
//     { name: "India", coordinates: [78.9629, 20.5937] },
//   ];

//   return (
//     // <div>
//     //   <h2 className="text-2xl font-[700] mb-3">Trango Community</h2>
//     //   <div
//     //     className="mt-6  bg-white card cursor-pointer"
//     //     onClick={() => router.push(PATH_DASHBOARD.trangoCommunity.communityDetail(0))}
//     //   >
//     //     <img
//     //       src="/images/map.svg"
//     //       alt="World Map"
//     //       layout="fill"
//     //       style={{
//     //         objectPosition: "center",
//     //         objectFit: "cover",
//     //     />
//     //   </div>

//     //   {/* <ComposableMap
//     //     projectionConfig={{
//     //       scale: 170,
//     //       center: [0, 10], // Adjust as needed for centering the map
//     //     }}
//     //     className="w-full max-w-4xl border rounded shadow"
//     //   >
//     //     <Geographies geography={geoUrl}>
//     //       {({ geographies }) =>
//     //         geographies.map((geo) => (
//     //           <Geography
//     //             key={geo.rsmKey}
//     //             geography={geo}
//     //             fill="#E5E7EB"
//     //             stroke="#FFFFFF"
//     //             strokeWidth={0.5}
//     //           />
//     //         ))
//     //       }
//     //     </Geographies>
//     //     {countries.map(({ name, coordinates }) => (
//     //       <Marker key={name} coordinates={coordinates}>
//     //         <circle r={5} fill="#2563EB" />
//     //         <text
//     //           textAnchor="middle"
//     //           y={15}
//     //           style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
//     //         >
//     //           {name}
//     //         </text>
//     //       </Marker>
//     //     ))}
//     //   </ComposableMap> */}
//     // </div>
//     <Map />
//   );
// }

// export default Page;

// const Map = ({ marker }) => {
//   console.log(marker);
//   const containerStyle = {
//     width: "100%",
//     height: "80vh",
//   };

//   const center = {
//     lat: -34.397,
//     lng: 150.644,
//   };

//   return (
//     <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
//       <GoogleMap
//         mapContainerStyle={containerStyle}
//         center={marker ? marker : center}
//         zoom={10}
//       >
//         <Marker position={marker ? marker : center} />
//       </GoogleMap>
//     </LoadScript>
//   );
// };

const containerStyle = {
  width: "98%",
  height: "400px",
};

const center = {
  lat: -3.745,
  lng: -38.523,
};

function MyComponent() {
  const { isLoaded } = useJsApiLoader({
    // id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = React.useState(null);

  const [markers, setMarkers] = useState();

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  return isLoaded ? (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker />
      </GoogleMap>
    </div>
  ) : (
    <div className="h-[90vh] flex items-center justify-center">
      <h1 className="font-medium text-3xl text-gray-text-color">
        Oops, something went wrong
      </h1>
    </div>
  );
}

export default React.memo(MyComponent);

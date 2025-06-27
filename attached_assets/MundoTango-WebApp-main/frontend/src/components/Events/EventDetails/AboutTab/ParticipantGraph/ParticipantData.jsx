// 'use client';
// import React, { useEffect, useState } from "react";
// import ParticipantGraph from "./ParticipantDataGraph";
// import { useEventChartDataMutation } from "@/data/services/eventAPI";
// import SpinnerLoading from "@/components/Loadings/Spinner";

// export default function ParticipantData({ id }) {
//   const [getEventChartData, { data, isLoading, error }] = useEventChartDataMutation();
//   const [chartData, setChartData] = useState(null);

//   useEffect(() => {
//     if (id) {
//       getEventChartData(id);
//     }
//   }, [id]);  

//   useEffect(() => {
//     if (data?.data) {
//       const newChartData = generateChartData(data.data);
//       setChartData(newChartData); 
//     }
//   }, [data]);

//   const generateChartData = (apiData) => {
//     const countriesData = {
//       labels: Object.keys(apiData.cityTotals),
//       datasets: [
//         {
//           data: Object.values(apiData.cityTotals),
//           backgroundColor: [
//             "#FF6384",
//             "#8B0000",
//           ],
//         },
//       ],
//     };

//     const languagesData = {
//       labels: Object.keys(apiData.languageTotals),
//       datasets: [
//         {
//           data: Object.values(apiData.languageTotals),
//           backgroundColor: [
//             "#EA4300",
//             "#36A2EB",
//           ],
//         },
//       ],
//     };

//     const danceRoleData = {
//       labels: Object.keys(apiData.danceRoleTotals),
//       datasets: [
//         {
//           data: Object.values(apiData.danceRoleTotals),
//           backgroundColor: [
//             "#EA4235",
//           ],
//         },
//       ],
//     };

//     const yearsInTangoData = {
//       labels: Object.keys(apiData.yearTangoTotals),
//       datasets: [
//         {
//           data: Object.values(apiData.yearTangoTotals),
//           backgroundColor: [
//             "#EA4235",
//           ],
//         },
//       ],
//     };

//     return {
//       countriesData,
//       languagesData,
//       danceRoleData,
//       yearsInTangoData,
//     };
//   };

//   if (isLoading) {
//     return (
//       <div className="mt-6 bg-white centered_card mr-6 h-screen">
//         <div className="flex items-center justify-center h-20">
//           <SpinnerLoading />
//         </div>
//       </div>
//     );
//   }

//   console.log(chartData);
//   return chartData ? <ParticipantGraph chartData={chartData} /> : null;
// }

'use client';
import React, { useEffect, useState } from "react";
import ParticipantGraph from "./ParticipantDataGraph";
import { useEventChartDataMutation } from "@/data/services/eventAPI";
import SpinnerLoading from "@/components/Loadings/Spinner";

const predefinedColors = {
  countries: [
    "#FF6384", "#8B0000", "#1E90FF", "#B8860B", "#006400", "#8B4513",
    "#EA4300", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
  ],
  languages: [
    "#EA4300", "#36A2EB", "#fbbb02", "#4BC0C0", "#9966FF", "#FF9F40"
  ],
  danceRoles: [
    "#EA4235", "#36A2EB", "#fbbb02"
  ],
  yearsInTango: [
    "#EA4235", "#36A2EB", "#fbbb02", "#33A753", "#f46d0e"
  ]
};

const getColorCycle = (baseColors, numItems) => {
  const colors = [];
  for (let i = 0; i < numItems; i++) {
    colors.push(baseColors[i % baseColors.length]); 
  }
  return colors;
};

export default function ParticipantData({ id }) {
  const [getEventChartData, { data, isLoading, error }] = useEventChartDataMutation();
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (id) {
      getEventChartData(id);
    }
  }, [id]);

  useEffect(() => {
    if (data?.data) {
      const newChartData = generateChartData(data.data);
      setChartData(newChartData);
    }
  }, [data]);

  const generateChartData = (apiData) => {
    const countriesData = {
      labels: Object.keys(apiData.cityTotals),
      datasets: [
        {
          data: Object.values(apiData.cityTotals),
          backgroundColor: getColorCycle(predefinedColors.countries, Object.keys(apiData.cityTotals).length),
        },
      ],
    };

    const languagesData = {
      labels: Object.keys(apiData.languageTotals),
      datasets: [
        {
          data: Object.values(apiData.languageTotals),
          backgroundColor: getColorCycle(predefinedColors.languages, Object.keys(apiData.languageTotals).length),
        },
      ],
    };

    const danceRoleData = {
      labels: Object.keys(apiData.danceRoleTotals),
      datasets: [
        {
          data: Object.values(apiData.danceRoleTotals),
          backgroundColor: getColorCycle(predefinedColors.danceRoles, Object.keys(apiData.danceRoleTotals).length),
        },
      ],
    };

    const yearsInTangoData = {
      labels: Object.keys(apiData.yearTangoTotals),
      datasets: [
        {
          data: Object.values(apiData.yearTangoTotals),
          backgroundColor: getColorCycle(predefinedColors.yearsInTango, Object.keys(apiData.yearTangoTotals).length),
        },
      ],
    };

    return {
      countriesData,
      languagesData,
      danceRoleData,
      yearsInTangoData,
    };
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

  return chartData ? <ParticipantGraph chartData={chartData} /> : null;
}

import { Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ParticipantGraph({ chartData }) {
  console.log(chartData);
  const options = {
    plugins: {
      legend: {
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          font: {
            size: 10,
          },
        },
      },
    },
  };
  // const countriesData = {
  //   labels: ["Argentina", "Brazil", "Italy", "France", "USA", "Others"],
  //   datasets: [
  //     {
  //       data: [20, 15, 10, 5, 10, 10, 20, 15, 10, 5, 10, 10],
  //       backgroundColor: [
  //         "#FF6384",
  //         "#8B0000",
  //         "#1E90FF",
  //         "#B8860B",
  //         "#006400",
  //         "#8B4513",
  //         "#EA4300",
  //         "#36A2EB",
  //         "#FFCE56",
  //         "#4BC0C0",
  //         "#9966FF",
  //         "#FF9F40",
  //       ],
  //     },
  //   ],
  // };

  // const languagesData = {
  //   labels: ["Spanish", "English", "Portuguese", "Italian", "French", "Other"],
  //   datasets: [
  //     {
  //       data: [30, 25, 15, 10, 10, 10],
  //       backgroundColor: [
  //         "#EA4300",
  //         "#36A2EB",
  //         "#fbbb02",
  //         "#4BC0C0",
  //         "#9966FF",
  //         "#FF9F40",
  //       ],
  //     },
  //   ],
  // };

  // const genderData = {
  //   labels: ["Male", "Female"],
  //   datasets: [
  //     {
  //       data: [70, 30],
  //       backgroundColor: ["#30549D", "#9C272E"],
  //     },
  //   ],
  // };

  // const danceRoleData = {
  //   labels: ["Lead", "Follow", "Both"],
  //   datasets: [
  //     {
  //       data: [40, 40, 20],
  //       backgroundColor: ["#EA4235", "#36A2EB", "#fbbb02"],
  //     },
  //   ],
  // };

  // const yearsInTangoData = {
  //   labels: ["<1 year", "1-3 years", "3-5 years", "5+ years"],
  //   datasets: [
  //     {
  //       data: [55, 35, 25, 10, 10],
  //       backgroundColor: [
  //         "#EA4235",
  //         "#36A2EB",
  //         "#fbbb02",
  //         "#33A753",
  //         "#f46d0e",
  //       ],
  //     },
  //   ],
  // };

  return (
    <div className="main_card">
      <h2 className="heading-text mb-2">Participant data</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <div className="w-1/2 flex flex-col items-center">
          {chartData?.countriesData?.labels?.length >
            0 && ( 
              <div style={{ width: "180px" }} className="mb-4">
                <h3 className="font-semibold text-xs">
                  Where are people coming from
                </h3>
                <Pie data={chartData?.countriesData} options={options} />
              </div>
            )}
          {/* <div style={{ width: "140px" }}>
            <h3 className="font-semibold text-xs">Gender</h3>
            <Pie
              data={genderData}
              options={{
                ...options,
                rotation: -90,
                circumference: 360,
              }}
            />
          </div> */}
          {chartData?.yearsInTangoData?.labels?.length >
            0 && ( 
              <div style={{ width: "160px" }}>
                <h3 className="font-semibold text-xs">Years in Tango</h3>
                <Pie data={chartData?.yearsInTangoData} options={options} />
              </div>
            )}
        </div>
        <div className="w-1/2 flex flex-col items-center">
          {chartData?.languagesData?.labels?.length >
            0 && ( 
              <div style={{ width: "160px" }} className="mb-4">
                <h3 className="font-semibold text-xs">Languages spoken</h3>
                <Pie data={chartData?.languagesData} options={options} />
              </div>
            )}
          {chartData?.danceRoleData?.labels?.length >
            0 && ( 
              <div style={{ width: "150px" }}>
                <h3 className="font-semibold text-xs">Dance Role</h3>
                <Pie data={chartData?.danceRoleData} options={options} />
              </div>
            )}
        </div>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        <button className="bg-[#ebf5ff] text-[#6cacec] rounded-xl p-2.5 text-sm font-semibold">
          See more Participant data
        </button>
      </div>
    </div>
  );
}

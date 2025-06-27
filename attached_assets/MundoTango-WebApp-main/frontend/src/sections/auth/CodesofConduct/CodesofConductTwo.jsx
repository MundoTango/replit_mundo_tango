import BackArrow from "@/components/SVGs/BackArrow";
import BellIcon from "@/components/SVGs/BellIcon";
import Events from "@/components/SVGs/Events";
import GroupIcon from "@/components/SVGs/GroupIcon";
import InviteFriend from "@/components/SVGs/InviteFriend";
import NextArrow from "@/components/SVGs/NextArrow";
import Profile from "@/components/SVGs/Profile";
import Settings from "@/components/SVGs/Settings";
import { getAuthToken, removeAuthToken, storeToken } from "@/data/services/localStorageService";
import { PATH_DASHBOARD } from "@/routes/paths";
import ConfirmationHeader from "@/sections/auth/confirmation/ConfirmationHeader";
import { useRouter } from "next/navigation";

const CodeOfConduct = [
  {
    icon: <Profile />,
    title: "Profile",
    description: "Take a look at what your profile looks like!",
  },
  {
    icon: <GroupIcon />,
    title: "Tango Community",
    description:
      "See all of the data that is being collected by Mundo Tango and what the Tango community looks like world wide!",
  },
  {
    icon: <Events />,
    title: "Events",
    description:
      "Take a look at up coming events near you and around the world!",
  },
  {
    icon: <GroupIcon />,
    title: "Group",
    description:
      "See groups that you have automatically been added to based on your registration information.",
  },
  {
    icon: <BellIcon />,
    title: "Notification",
    description: "Set your notification settings",
  },
  {
    icon: <InviteFriend />,
    title: "Invite Friends",
    description:
      "Encourage other Tango people to join the Mundo Tango platform!",
  },
  {
    icon: <Settings />,
    title: "Settings",
    description: "Take a look at your settings and make changes",
  },
];

function CodesofConductTwo({ handleBack }) {
  const { push } = useRouter();

  const changeToken = async () => {
    try {
      const token = getAuthToken();
      console.log(token);
      storeToken(getAuthToken());
      push(PATH_DASHBOARD.root);
      setTimeout(() =>{
        removeAuthToken();
      }, 5000)
    } catch (e) {
      console.log(e.message);
    }
  };
  return (
    <div className="bg-background-color h-screen overflow-y-scroll">
      <ConfirmationHeader />
      <div className="grid grid-cols-12 ">
        <div className="col-span-12 px-2 my-7">
          <div className="text-2xl font-bold text-center select-none">
            Mundo Tango Codes of Conduct
          </div>
        </div>

        <div className="col-span-12">
          <div className="flex flex-wrap items-center justify-center gap-6 select-none">
            {CodeOfConduct.map(({ title, description, icon }, index) => (
              <div
                key={index}
                className={`w-[20rem] h-[280px] p-4 rounded-xl border-2 bg-white`}
              >
                <div>{icon}</div>
                <div className="text-lg font-bold mt-6">{title}</div>
                <div className="text-[#949393] font-light mt-1">
                  {description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 mb-5 mx-32 lg:mx-72 ">
          <div className="mt-5 flex justify-around md:justify-between">
            <button
              className="bg-btn-color text-white px-10 py-3 rounded-xl"
              type="button"
              onClick={handleBack}
            >
              <BackArrow />
            </button>

            <button
              onClick={changeToken}
              className="bg-btn-color text-white px-10 py-3 rounded-xl "
            >
              <NextArrow />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodesofConductTwo;

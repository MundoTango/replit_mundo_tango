import { PATH_DASHBOARD } from "@/routes/paths";
import FriendComponent from "./FriendComponent";
import { useRouter } from "next/navigation";
import SpinnerLoading from "@/components/Loadings/Spinner";

const FriendsTabContent = ({ Friends, Loading }) => {
  const { push } = useRouter();

  if (Loading) {
    return (
      <div className="flex items-center justify-center m-6 rounded-lg">
        <SpinnerLoading />
      </div>
    );
  }

  return (
    <div className="card travel-details-card !max-h-[1100px]">
      <div className="grid grid-cols-1 gap-4 overflow-auto pr-6 md:grid-cols-3 lg:grid-cols-4">
        {!!Friends?.length &&
          Friends.map((item, index) => {
            return (
              <FriendComponent
                item={item}
                key={index}
                onClick={() => {
                  push(
                    PATH_DASHBOARD.profile.userProfile(item?.friend?.id)
                  );
                }}
              />
            );
          })}
      </div>
    </div>
  );
};

export default FriendsTabContent;

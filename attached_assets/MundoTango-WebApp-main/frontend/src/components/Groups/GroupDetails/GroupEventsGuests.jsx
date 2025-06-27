import KababMenu from "@/components/SVGs/KababMenu";
import FriendComponents from "./Friends/FriendList";
import SpinnerLoading from "@/components/Loadings/Spinner";
import { useRouter } from "next/navigation";
import { PATH_DASHBOARD } from "@/routes/paths";

const GroupEventsGuests = ({ memeber_type = '', getGroupMembers, GroupMemberLoading }) => {
  const router = useRouter();
  return (
    <div className="mt-6  bg-white card">
      <div className="grid grid-cols-12 pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">
                Members {memeber_type} In The City
              </div>
            </div>

            {/* <div>
              <KababMenu className="cursor-pointer" />
            </div> */}
          </div>
        </div>

        {GroupMemberLoading ? (
          <div className="flex items-center justify-center h-10 w-full col-span-12">
            <SpinnerLoading size={40} />
          </div>
        ) : !!getGroupMembers?.length ? (
          getGroupMembers?.map((item, key) => (
            <div key={key} className="col-span-4">
              <FriendComponents {...item} not_required onClickFirstBtn={() => router.push(PATH_DASHBOARD.profile.userProfile(item?.id))}/>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-10 text-sm text-light-gray-color w-full col-span-12">
            <h2> Members not found!</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupEventsGuests;

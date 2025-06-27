import { useGetAllFriendRequestQuery } from "@/data/services/friendApi";
import { PATH_DASHBOARD } from "@/routes/paths";
import { timeAgo } from "@/utils/helper";
import Link from "next/link";
import SpinnerLoading from "../Loadings/Spinner";
import { useRouter } from "next/router";

export default function FriendRequestList({}) {
  const { data, isFetching } = useGetAllFriendRequestQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const router = useRouter();

  return (
    <div className="px-4 py-4 bg-white border rounded-xl">
      <div className="text-black font-bold text-lg mb-3">
        Connection Requests
      </div>

      {isFetching ? (
        <div className="flex items-center justify-center ">
          <SpinnerLoading />
        </div>
      ) : (
        !!data?.data?.length &&
        data?.data?.map((item, index) => (
          <div key={index} className="animate-fade-up">
            <div className="flex items-center gap-3">
              <div>
                <img
                  src={item?.friend_user?.user_images[3]?.image_url}
                  alt="Not found"
                  className="w-14 rounded-full"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {item?.friend_user?.name}
                </div>
                <div className="text-sm text-gray-text-color">
                  @{item?.friend_user?.username}
                </div>
              </div>
              <div className="flex justify-end text-sm text-gray-text-color">
                {timeAgo("2024-10-12")}
              </div>
            </div>

            <div className="mt-2">
              <button className="bg-btn-color text-white w-full rounded-xl h-10 font-medium" onClick={() => router.push("/user/connection-requests")}>
                Confirm Request
              </button>
            </div>

            {data?.data.length - 1 !== index && (
              <div className="my-6">
                <hr className="border-border-color" />
              </div>
            )}
          </div>
        ))
      )}

      <div className="mt-5">
        <hr className="border-border-color" />
      </div>

      <Link
        href={PATH_DASHBOARD.friends.connectionRequest}
        className=" text-btn-color font-semibold text-center xl:text-left cursor-pointer mt-3 flex items-center justify-center w-full"
      >
        See all
      </Link>
    </div>
  );
}

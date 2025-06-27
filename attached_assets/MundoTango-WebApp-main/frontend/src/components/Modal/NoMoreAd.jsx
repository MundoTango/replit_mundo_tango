import {
    useAddSubscriptionMutation,
    useGetSubscriptionsQuery
} from "@/data/services/subscriptionApi";
import toast from "react-hot-toast";
import SpinnerLoading from "../Loadings/Spinner";
export const NoMoreAd = () => {
  const { data, isLoading: getLoading } = useGetSubscriptionsQuery();
  const [addSubscription, { isLoading }] = useAddSubscriptionMutation();

  const addSubscriber = async (e) => {
    e.preventDefault();
    try {
      const response = await addSubscription({
        subscription_id: data?.data[0]?.id,
      });

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        window.open(response?.data?.data?.url, "_blank");
        // toast.success("Subscription added successfully!");
      }
    } catch (error) {}
  };

  return (
    <div className="p-6 bg-[#F2F6F9] rounded-[16px]">
      <div className="flex flex-col items-center justify-center bg-white mx-auto my-auto w-[60%] p-5 rounded-[27px]">
        {/* Dollar Div */}
        <div className="flex justify-center items-center">
          <div className="text-center">
            {/* <MdOutlineNoAccounts className="w-[150px] h-[150px] opacity-50" /> */}
            <img src="/images/profile/noads.png" alt="noads" />
          </div>
        </div>

        {/* Content */}
        <div className={`w-full px-5 mx-5 rounded text-center `}>
          <h3 className="text-[26px] font-[700] pt-2">NO MORE ADS</h3>
          <p className="text-[16px] text-gray-text-color font-[500]">Upgrade now to enjoy an ad-free experience in your feeds!</p>

          <form onSubmit={addSubscriber}>
            <button
              type="submit"
              disabled={isLoading || getLoading}
              className="w-full mt-3 px-3 py-2 bg-btn-color text-white rounded-md hover:bg-btn-color hover:opacity-85 delay-150 disabled:bg-gray-300 font-[700]"
            >
              {isLoading || getLoading ? (
                <div className="w-full flex justify-center">
                <SpinnerLoading/>
                </div>
              ) : (
                `$ ${data?.data[0]?.amount} | Buy Now`
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

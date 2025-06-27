import { FriendOne, FriendThree, FriendTwo } from "@/utils/Images";
import Host from "./Hosts";
import { SwipperComponent } from "@/components/Swiper";
import { PATH_DASHBOARD } from "@/routes/paths";
import { useRouter } from "next/navigation";

const EventHost = ({ title, desc, isslider, isButton, getQuest }) => {
  const router = useRouter();
  return (
    <div className="bg-white main_card">
      <div className="grid grid-cols-12 md:pr-5 gap-4">
        <div className="col-span-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-light-gray-color">{desc}</div>
            </div>
          </div>
        </div>
        
        {/* Conditionally Render Swiper */}
        {isslider ? (
          <div className="col-span-12">
          <SwipperComponent
            spaceBetween={10}
            slidesPerView={3}
            onSlideChange={() => console.log('slide change')}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {getQuest?.map((item, key) => (
              <div key={key} className="col-span-4">
                <Host {...item} is_button={isButton} onClickBtn={() => router.push(PATH_DASHBOARD.profile.userProfile(item?.id))}/>
              </div>
            ))}
          </SwipperComponent>
          </div>
        ) : (
          getQuest?.map((item, key) => (
            <div key={key} className="col-span-4">
              <Host {...item} is_button={isButton}  onClickBtn={() => router.push(PATH_DASHBOARD.profile.userProfile(item?.id))}/>
            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default EventHost;
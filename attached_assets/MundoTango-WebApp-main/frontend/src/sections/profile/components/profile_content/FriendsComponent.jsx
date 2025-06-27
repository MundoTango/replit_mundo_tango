import { Friend1, Friend2, Friend3, Friend4 } from "@/utils/Images";

const FriendsComponent = ({ Friends, onSeeAllFriends }) => {
  return (
    <div className="card">
      <div className="mb-2 flex justify-between">
        <h2 className="">Friends </h2>
        <button className="pr-6 text-btn-color" onClick={onSeeAllFriends}>
          See All
        </button>
      </div>
      <div className="friend-card">
        {!!Friends?.length &&
          Friends.slice(0, 4).map(({ friend }, index) => (
            <div key={index}>
              <img src={friend?.user_images[0]?.image_url} alt="" />
            </div>
          ))}
        {/* <div>
          <img src={Friend2} alt="" />
        </div>
        <div>
          <img src={Friend3} alt="" />
        </div>
        <div>
          <img src={Friend4} alt="" />
        </div> */}
      </div>
    </div>
  );
};

export default FriendsComponent;

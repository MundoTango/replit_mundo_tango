import { FriendOne } from "@/utils/Images";

const FriendComponent = ({ item, onClick, friendship, friendClick }) => {
  return (
    <div className="rounded-xl bg-background-color p-4">
      <div className="relative">
        <img
          className="h-44 w-full rounded-2xl object-contain"
          src={item?.friend?.user_images[0]?.image_url}
          alt=""
        />
      </div>

      <button
        onClick={onClick}
        className="bg-btn-color rounded-xl text-white px-10 font-bold text-sm md:text-base h-10 mt-4 w-full"
      >
        View Profile
      </button>
        {friendship && (
          <button
            onClick={friendClick}
            className="bg-tag-color rounded-xl text-white px-10 font-bold text-sm md:text-base h-10 my-1 w-full text-nowrap"
          >
            See Friendship
          </button>
        )}
    </div>
  );
};

export default FriendComponent;

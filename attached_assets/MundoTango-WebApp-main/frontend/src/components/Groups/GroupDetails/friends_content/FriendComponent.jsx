import { FriendOne } from "@/utils/Images";

const FriendComponent = ({ item, onClick }) => {
  return (
    <div className="rounded-xl bg-background-color p-4">
      <div className="relative">
        <img
          className="h-auto w-full rounded-2xl object-cover"
          src={item?.friend?.user_images[0]?.image_url}
          alt=""
        />
      </div>

      <button
        onClick={onClick}
        className="md:text-md my-4 w-full rounded-xl bg-btn-color px-10 py-2 text-lg font-bold text-white"
      >
        Watch Profile
      </button>
    </div>
  );
};

export default FriendComponent;

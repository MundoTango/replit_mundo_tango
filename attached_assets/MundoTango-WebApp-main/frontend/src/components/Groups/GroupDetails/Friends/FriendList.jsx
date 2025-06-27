const FriendComponents = ({ image, full_name , name, username, button_title, second_button, onClickSecondBtn, onClickFirstBtn , user, image_url , not_required}) => {
  return (
    <div className="bg-[#F8FAFC] p-4 md:p-5 space-y-2 rounded-xl">
      <div>
        <img src={image_url || user?.image_url} alt="" className="rounded-xl w-full" />
      </div>

      <div>
        <div className="text-black font-bold text-xs md:text-base text-nowrap">{name || username}</div>
        {/* <div className="text-light-gray-color text-[10px] md:text-sm">13 Mutual</div> */}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <button 
        onClick={onClickFirstBtn} 
        className="bg-btn-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold">
          {button_title ? button_title : 'Add Friend'}
        </button>
        {
          !not_required && (
            <button
              onClick={onClickSecondBtn}
              className="bg-tag-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold"
            >
            {second_button ? second_button : 'Remove'}
            </button>
          )
        }
        {/* <button 
        onClick={onClickSecondBtn} 
        className="bg-tag-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold">
        </button> */}
      </div>
    </div>
  );
};

export default FriendComponents;

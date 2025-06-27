const Host = ({ user, button_title, is_button = true, onClickBtn }) => {
  return (
    <div className="bg-[#F8FAFC] p-4 md:p-5 space-y-2 rounded-xl">
      <div>
        <img src={user?.image_url} className="rounded-xl w-full h-20 md:h-36 object-cover" />
      </div>

      <div>
        <div className="text-black font-bold text-xs md:text-base text-nowrap">{user?.username}</div>
        {/* <div className="text-light-gray-color text-[10px] md:text-sm">13 Mutual</div> */}
      </div>

      {is_button && (
        <div className="flex flex-col gap-1 pt-2">
          <button className="bg-btn-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold"
            onClick={onClickBtn}>
            {button_title ? button_title : "Add Friend"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Host;

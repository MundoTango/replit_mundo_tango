const FriendComponents = ({
  image,
  full_name,
  button_title,
  second_button,
  onClickSecondBtn,
  onClickFirstBtn,
}) => {
  return (
    <div className="bg-[#F8FAFC] p-4 md:p-5 space-y-2 rounded-xl">
      <div
        className={`h-[180px] bg-center bg-no-repeat bg-[length:100%_100%] rounded-2xl`}
        style={{
          backgroundImage: `url(${image})`,
        }}
      ></div>

      <div>
        <div className="text-black font-bold text-xs md:text-base text-nowrap">
          {full_name}
        </div>
        {/* <div className="text-light-gray-color text-[10px] md:text-sm">13 Mutual</div> */}
      </div>

      <div className="flex flex-col  gap-2 pt-2">
        {button_title && (
          <button
            onClick={onClickFirstBtn}
            className="bg-btn-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold flex items-center justify-center h-10"
          >
            {button_title ? button_title : "Add Friend"}
          </button>
        )}
        {second_button && (
          <button
            onClick={onClickSecondBtn}
            className="bg-tag-color text-white rounded-xl p-1 text-[10px] md:p-2.5 md:text-sm font-semibold h-10"
          >
            {second_button ? second_button : "Remove"}
          </button>
        )}
      </div>
    </div>
  );
};

export default FriendComponents;

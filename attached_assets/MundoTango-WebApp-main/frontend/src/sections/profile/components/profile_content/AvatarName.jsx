const AvatarName = ({ imageUrl }) => {
  return (
    <div className="flex flex-row">
      <img src={imageUrl} alt="" className="mr-2 w-12 rounded-full" />
      <div className="flex flex-col">
        <p className="font-medium">Angela Lee </p>
        <p className="text-light-gray-color text-xs">56 mins ago </p>
      </div>
    </div>
  );
};

export default AvatarName;

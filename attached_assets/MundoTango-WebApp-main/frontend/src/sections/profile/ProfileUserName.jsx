import Tag from "./Tag";

const ProfileUserName = ({
  name,
  uniqueName,
  city,
  tags = [],
  fullFriendShipView = false,
}) => {
  return (
    <section className="items-start md:items-center w-full md:w-1/2 lg:text-left">
      <div className="flex flex-col items-start md:items-center gap-4 lg:flex-row ">
        <p className="w-xl text-2xl font-bold text-black-text-color capitalize">{name}</p>

        {!fullFriendShipView && (
          <div>
            {!!tags?.length &&
              tags?.map((tag, index) => <Tag name={tag} key={index} />)}
          </div>
        )}
      </div>

      {!fullFriendShipView && (
        <p className="mt-2 md:mt-4 text-base text-gray-text-color lg:mt-2 font-semibold whitespace-nowrap">
          Unique name: {uniqueName} | City: {city}
        </p>
      )}
    </section>
  );
};

export default ProfileUserName;

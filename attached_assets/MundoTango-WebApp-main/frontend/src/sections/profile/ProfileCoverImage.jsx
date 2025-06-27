import React from "react";
import ProfileImage from "./ProfileImage";

const ProfileCoverImage = ({
  coverImage,
  profileImage,
  fullFriendShipView = false,
  userImage,
}) => {
  return (
    <section className="relative">
      <figure className="flex items-center justify-center rounded-2xl">
        <img src={coverImage || '/images/user-placeholder.jpeg'} alt="Cover Image" className="rounded-t-2xl w-full h-48 object-cover bg-cover bg-center" />
      </figure>

      {fullFriendShipView ? (
        <div className="flex relative w-[270px]">
          <div className="absolute -bottom-9 left-8 rounded-full border-white border-4">
            <img
              src={userImage}
              alt=""
              className="rounded-full w-32 h-32 object-contain"
              loading="lazy"
            />
          </div>
          <div className="absolute -bottom-9 rounded-full border-white border-4 right-1">
            <img
              src={profileImage}
              alt=""
              className="rounded-full w-32 h-32 object-contain"
              loading="lazy"
            />
          </div>
        </div>
      ) : (
        <ProfileImage imageURL={profileImage} />
      )}
    </section>
  );
};

export default ProfileCoverImage;

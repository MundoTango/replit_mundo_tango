const ProfileImage = ({ imageURL }) => {
  return (
    <section className="relative md:mx-auto mt-4 w-28 rounded-full md:absolute bottom-10 md:-bottom-7 md:left-12">
      <img
        src={imageURL}
        alt="Profile Image"
        className="w-20 h-20 object-cover rounded-full border-white border-4"
      />
    </section>
  );
};

// absolute bottom-24 w-40 -translate-y-2/4 transform rounded-full border border-4 border-white

export default ProfileImage;

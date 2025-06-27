const TopBanner = ({ city, location, image_url, country }) => {
  return (
    <section
      className="relative p-5 space-y-2 rounded-t-xl flex items-end h-[290px]"
      style={{
        backgroundImage: `
          linear-gradient(180deg, rgba(9, 21, 34, 0) 25.87%, #091522 88.88%), 
          url(${image_url})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full h-[80px] space-y-2 mb-3">
        <h2 className="text-white text-3xl">{city}</h2>
        <p className="font-bold text-lg text-light-gray-color">
          {location} {country}
        </p>
      </div>
    </section>
  );
};

export default TopBanner;

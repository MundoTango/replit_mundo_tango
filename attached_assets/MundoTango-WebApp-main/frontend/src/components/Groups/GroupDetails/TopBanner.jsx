const TopBanner = ({ coverImage }) => {
  return (
    <section className="relative p-5 space-y-2 rounded-t-xl flex items-end h-[290px] w-full overflow-hidden"
    style={{
        backgroundImage: `
          url(${coverImage})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
    </section>
  );
};

export default TopBanner;
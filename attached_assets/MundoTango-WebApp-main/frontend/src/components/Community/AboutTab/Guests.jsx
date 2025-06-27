const Guests = ({ record }) => {
  const Friends = [
    {
      title: "People of this City",
      ...record?.all_users,
      countTitle: "People",
    },
    {
      title: "Teachers",
      ...record?.teachers,
    },
    {
      title: "Dancers",
      ...record?.dancers,
    },
    {
      title: "Photographers",
      ...record?.photographers,
    },
    {
      title: "Djs",
      ...record?.djs,
    },
  ];

  return (
    <div className="main_card">
      <div className="mb-2 flex justify-between">
        <h2 className="heading-text">Total People</h2>
      </div>

      {!!Friends?.length &&
        Friends?.map((item, key) => (
          <PeopleInEvents
            key={key}
            {...item}
            border={Friends?.length - 1 != key}
          />
        ))}
    </div>
  );
};

const PeopleInEvents = ({ rows, count, title, countTitle, border }) => (
  <div className={`my-4 ${border ? "border-b-[1px] pb-5" : ""}`}>
    <p className="normal-text">{title}</p>
    <div className="flex justify-between items-center mt-1">
      <div className="flex truncate w-2/3">
        {!!rows?.length &&
          rows?.map((x, i) => (
            <div key={i} className={i > 0 ? "ml-[-15px]" : ""}>
              <img
                src={x.image_url}
                alt=""
                className="w-10 h-10 rounded-full"
              />
            </div>
          ))}
      </div>
      <div className="text-gray-text-color text-sm font-medium">
        {count} {/* k */}
        {countTitle || title}
      </div>
    </div>
  </div>
);

export default Guests;
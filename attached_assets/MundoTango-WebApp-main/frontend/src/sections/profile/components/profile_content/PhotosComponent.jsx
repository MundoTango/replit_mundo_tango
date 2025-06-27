const PhotosComponent = ({ Photos, onSeeAllPhotos }) => {
  return (
    <div className="card">
      <div className="mb-2 flex justify-between">
        <h2 className="">Photos </h2>
        <button className="pr-6 text-btn-color" onClick={onSeeAllPhotos}>See All</button>
      </div>
      <div className="photos-card">
        {!!Photos?.length &&
          Photos.slice(0, 4).map(({ media_url }, index) => (
            <div key={index}>
              <img src={media_url} alt="" />
            </div>
          ))}
        {/* <div>
          <img src={Photo1} alt="" />
        </div>
        <div>
          <img src={Photo2} alt="" />
        </div>
        <div>
          <img src={Photo3} alt="" />
        </div>
        <div>
          <img src={Photo4} alt="" />
        </div> */}
      </div>
    </div>
  );
};

export default PhotosComponent;

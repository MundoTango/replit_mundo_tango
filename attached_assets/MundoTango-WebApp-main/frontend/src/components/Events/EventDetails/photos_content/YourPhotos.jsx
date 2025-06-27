import ImageComponent from "./ImageComponent";

const YourPhotos = ({ YourPhotosImages }) => {
  return (
    <div className="grid grid-cols-2 gap-4 pr-6 md:grid-cols-3 lg:grid-cols-4">
      {!!YourPhotosImages?.length &&
        YourPhotosImages.map(({ media_url }, index) => {
          return <ImageComponent src={media_url} key={index} />;
        })}
    </div>
  );
};

export default YourPhotos;

import ImageComponent from "./VideoComponent";

const YourPhotos = ({}) => {
  return (
    <div className="grid grid-cols-2 gap-4 pr-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 10 }).map((_, index) => {
        return <ImageComponent key={index} />;
      })}
    </div>
  );
};

export default YourPhotos;

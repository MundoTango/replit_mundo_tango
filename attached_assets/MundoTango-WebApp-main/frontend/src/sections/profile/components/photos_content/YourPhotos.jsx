import { useUploadUserImagesMutation } from "@/data/services/userApi";
import ImageComponent from "./ImageComponent";
import PlusIcon from "@/components/SVGs/PlusIcon";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";

const YourPhotos = ({ YourPhotosImages, timelinerefetch }) => {
  const [uploadUserImages, { isLoading }] = useUploadUserImagesMutation();

  const uploadImages = async (event) => {
    try {
      if (event.target.files[0].size > 2097152) {
        toast.error("Maximun 2Mb file size allowed");
        return;
      }

      const file = event.target.files[0];
      var data = new FormData();
      data.append("file", file);

      const result = await uploadUserImages(data);

      if (result?.error?.data) {
        toast.error(`Seems like something went wrong!`);
        return;
      }

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Image uploaded successfully!");
        timelinerefetch();
      }
    } catch (error) {
      toast.error("There was an error uploading the images.");
      console.error("Image upload error:", error);
    }
  };

  return (
    <>
      <div className="flex justify-end items-center mb-3 me-10 gap-2">
        <input
          type="file"
          id={`yourPhoto`}
          className="hidden"
          onChange={(e) => uploadImages(e)}
          accept="image/jpeg, image/png, image/jpg"
        />
        <label htmlFor={`yourPhoto`} className="">
          <FaPlus className="cursor-pointer" /> 
        </label>
        <p className="font-semibold">Upload Photos</p>
      </div>
      <div className="grid grid-cols-2 gap-4 pr-6 md:grid-cols-3 lg:grid-cols-4">
        {!!YourPhotosImages?.length &&
          YourPhotosImages.map(({ media_url }, index) => {
            return <ImageComponent src={media_url} key={index} />;
          })}
      </div>
    </>
  );
};

export default YourPhotos;

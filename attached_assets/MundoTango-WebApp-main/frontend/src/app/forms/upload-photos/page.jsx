"use client";

import SpinnerLoading from "@/components/Loadings/Spinner";
import {
  useGetUserUploadedImagesMutation,
  useUploadUserImagesMutation,
} from "@/data/services/userApi";
import { PATH_AUTH } from "@/routes/paths";
import UploadDialogue from "@/sections/auth/UploadPhotos/UploadDialogue";

import UploadImagesView from "@/sections/auth/UploadPhotos/UploadImagesView";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import toast from "react-hot-toast";

function UploadPhoto() {
  const [uploadUserImages, { isLoading }] = useUploadUserImagesMutation();

  const [getUserUploadedImages, { isLoading: loading }] =
    useGetUserUploadedImagesMutation();

  const [imageUploader, setImageUploader] = useState(true);

  const [index, setIndex] = useState(0);

  const [imagesList, setImagesList] = useState([
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
    {
      image: null,
      objectUrl: null,
    },
  ]);

  const { push } = useRouter();

  const handleChangeFile = async (event) => {
    try {
      if (event.target.files[0].size > 2097152) {
        toast.error("Maximun 2Mb file size allowed");
        return;
      }
      let temp = [...imagesList];
      temp[index].image = event.target.files[0];
      temp[index].objectUrl = URL.createObjectURL(event.target.files[0]);
      setImageUploader(false);
      setImagesList(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  const getAllUserImages = async () => {
    try {
      const temp = [...imagesList];
      const response = await getUserUploadedImages();

      const { code, data } = response?.data;

      if (code === 200) {
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          temp[i].objectUrl = item?.media_url;
          setImageUploader(false);
          setImagesList(temp);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const uploadImages = async () => {
    const validImages = imagesList?.filter(
      (item) => item?.image && item?.objectUrl
    );

    if (validImages.length === 0) {
      push(PATH_AUTH.confirmation);
      return;
    }

    var formData = new FormData();
    validImages?.map((item) => {
      formData.append("file", item?.image);
    });

    try {
      const result = await uploadUserImages(formData);

      if (result?.error?.data) {
        toast.error(`Seems like something went wrong!`);
        return;
      }

      const { code } = result?.data;

      if (code === 200) {
        toast.success("Image uploaded successfully!");
        push(PATH_AUTH.confirmation);
        localStorage.setItem("type", 2);
      }
    } catch (error) {
      toast.error("There was an error uploading the images.");
      console.error("Image upload error:", error);
    }
  };

  const removeFiles = async (index) => {
    try {
      let temp = [...imagesList];
      temp[index].objectUrl = null;
      // temp.splice(index, 1);
      setImagesList(temp);
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    getAllUserImages();
  }, []);

  return loading ? (
    <div className="flex items-center justify-center h-screen">
      <SpinnerLoading />
    </div>
  ) : imageUploader ? (
    <UploadDialogue
      imagesList={imagesList}
      setImagesList={setImagesList}
      handleChangeFile={handleChangeFile}
    />
  ) : (
    <UploadImagesView
      imagesList={imagesList}
      imageUploader={imageUploader}
      setIndex={setIndex}
      handleChangeFile={handleChangeFile}
      isLoading={isLoading}
      uploadImages={uploadImages}
      removeFiles={removeFiles}
    />
  );
}

export default UploadPhoto;

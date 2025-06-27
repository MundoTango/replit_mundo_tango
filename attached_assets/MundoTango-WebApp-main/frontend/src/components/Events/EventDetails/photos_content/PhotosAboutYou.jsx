import { useDisLikePostMutation, useLikePostMutation } from "@/data/services/postApi";
import ImageComponent from "./ImageComponent";
import { useState } from "react";

const PhotosAboutYou = ({ PhotoAboutYouImages = [] }) => {
  console.log(PhotoAboutYouImages)
  const [likePost, {}] = useLikePostMutation();
  const [disLikePost, {}] = useDisLikePostMutation();
  const [photos, setPhotos] = useState(PhotoAboutYouImages)

  const handleLikePosts = async (post_id, isLiked, index) => {
    let temp = JSON.parse(JSON.stringify(photos));
    if (isLiked) {
      temp[index].is_liked = 0;
      temp[index].total_likes = temp[index].total_likes - 1;
      setPhotos(temp);
      await disLikePost(post_id);
    } else {
      temp[index].is_liked = 1;
      temp[index].total_likes = temp[index].total_likes + 1;
      setPhotos(temp);
      await likePost({ post_id });
    }
  };
  return (
    <div>
      {!!PhotoAboutYouImages?.length ? (
        <div className="grid grid-cols-2 gap-4 pr-6 md:grid-cols-3 lg:grid-cols-4">
          {photos?.map(
            ({ media_urls, total_comments, total_likes, is_liked , id }, index) => {
              return (
                <ImageComponent
                  src={media_urls[0]}
                  total_comments={total_comments}
                  total_likes={total_likes}
                  is_liked={is_liked}
                  key={index}
                  hover={true}
                  onLikeDislike={() => {
                    handleLikePosts(id, !!is_liked, index);
                  }}
                />
              );
            }
          )}
        </div>
      ) : (
        <p className="text-center text-light-gray-color w-full">
          No Photos found
        </p>
      )}
    </div>
  );
};

export default PhotosAboutYou;

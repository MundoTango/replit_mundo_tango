import CommentFilledIcon from "@/components/SVGs/CommentFilledIcon";
import HeartIcon from "@/components/SVGs/HeartIcon";
import Image from "next/image";

const ImageComponent = ({ src, total_comments, total_likes, hover, is_liked, onLikeDislike }) => {
  return (
    <div className="group relative rounded-xl">
      <img
        className="max-52 h-40 rounded-2xl object-cover md:h-52"
        src={src}
        alt=""
        loading="lazy"
      />

      {hover && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex space-x-6">
            <div className="flex flex-col space-y-3" onClick={onLikeDislike}>
              <HeartIcon color={is_liked ? "#EB2560" : "#94A3B8"} />
              <span className="font-bold text-white ps-[6px]">{total_likes}</span>
            </div>
            <div className="flex flex-col space-y-3">
              <CommentFilledIcon color="white" />
              <span className="font-bold text-white ps-[2px]">{total_comments}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageComponent;

import RHFTextField from "@/components/FORMs/RHFTextField";
import CommentIcon from "@/components/SVGs/CommentIcon";
import EmojiIcon from "@/components/SVGs/EmojiIcon";
import HeartIcon from "@/components/SVGs/HeartIcon";
import LinkIcon from "@/components/SVGs/LinkIcon";
import MenuIcon from "@/components/SVGs/MenuIcon";
import ShareIcon from "@/components/SVGs/ShareIcon";
import { ImageFour, Photo1, Photo2 } from "@/utils/Images";
import { useForm } from "react-hook-form";
import AvatarName from "./AvatarName";

const PostComponent = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      description: "",
      images: [],
    },
  });
  return (
    <div className="card">
      <div className="flex flex-col pr-6">
        <div className="flex w-full flex-row items-start justify-between">
          <AvatarName imageUrl={ImageFour} />
          <button>
            <MenuIcon />
          </button>
        </div>
        <div className="flex flex-wrap py-4">
          <p className="text-light-gray-color text-sm">
            Here are some photography works that I made on the weekend with some
            of my friends, happy for that!
          </p>
        </div>
        <div className="pr-6; grid grid-cols-2 gap-2">
          <div>
            <img
              src={Photo1}
              alt=""
              className="h-40 w-full rounded-3xl object-cover"
            />
          </div>
          <div>
            <img
              src={Photo2}
              alt=""
              className="h-40 w-full rounded-3xl object-cover"
            />
          </div>
        </div>
        <br></br>
        <hr></hr>
        <br></br>
        <div className="flex w-full flex-row justify-between">
          <button
            type="button"
            className="text-heart-color inline-flex items-center text-center text-sm font-medium"
          >
            <span className="px-2">
              <HeartIcon color="#EB2560" />
            </span>
            2.6K Likes
          </button>
          <button
            type="button"
            className="text-light-gray-color inline-flex items-center text-center text-sm font-medium"
          >
            <span className="px-2">
              <CommentIcon />
            </span>
            297 Comments
          </button>
          <button
            type="button"
            className="text-light-gray-color inline-flex items-center text-center text-sm font-medium"
          >
            <span className="px-2">
              <ShareIcon />
            </span>
            201 Shares
          </button>
        </div>
        <div className="relative mt-3 flex">
          <RHFTextField
            type={"text"}
            name="dancing"
            control={control}
            errors={errors}
            placeholder="Write your message..."
            className={`input-text`}
          />
          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 flex-row items-center justify-between gap-2">
            <span className="w-8" onClick={() => {}}>
              <EmojiIcon classes="mx-auto" />
            </span>
            <span className="w-8" onClick={() => {}}>
              <LinkIcon classes="mx-auto" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComponent;

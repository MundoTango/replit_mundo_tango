"use client";

import RHFTextField from "@/components/FORMs/RHFTextField";

import {
  PostImageOne,
  PostImageThree,
  PostImageTwo,
  ProfileImage,
} from "@/utils/Images";

import EmojIcon from "@/components/SVGs/EmojIcon";

import LinkIcon from "@/components/SVGs/LinkIcon";

import KababMenu from "@/components/SVGs/KababMenu";

import { useForm } from "react-hook-form";
import Tag from "@/sections/profile/Tag";
import ShareIcon from "@/components/SVGs/ShareIcon";
import HeartIcon from "@/components/SVGs/HeartIcon";
import CommentIcon from "@/components/SVGs/CommentIcon";

const TagsData = ["Teacher", "Housing Host", "DJ"];
const LikeCommentShareClass = "flex items-center gap-2 cursor-pointer";

const PostTabs = () => {
  const {
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  return (
    <div className="card select-none ">
      <div className="pr-5">
        <div className="flex justify-between ">
          <div className="text-black flex items-center gap-4">
            <div>
              <img src={ProfileImage} alt="" loading="lazy" className="w-10" />
            </div>
            <div>
              <div className="text-sm font-semibold">Carlie Bond</div>
              <div className="text-xs text-gray-text-color">56 mins ago</div>
            </div>
            <div>
              {TagsData.map((tag, index) => (
                <Tag name={tag} key={index} className="text-sm" />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 cursor-pointer">
            <div className="text-btn-color text-sm font-bold">
              See Friendship
            </div>
            <div>
              <KababMenu />
            </div>
          </div>
        </div>

        <div>
          <div className="text-gray-text-color text-base font-semibold py-5">
            Here are some photography works that I made on the weekend with some
            of my friends, I really love those colorful tone happy for that! 😍
          </div>

          <div>
            <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap lg:gap-0 ">
              <img src={PostImageOne} alt="" className="w-72 mb-3 pr-2" />
              <img src={PostImageTwo} alt="" className="w-72 mb-3 pr-2" />
              <img src={PostImageThree} alt="" className="w-72 mb-3 pr-2" />
            </div>
          </div>
        </div>
        <br />
        <hr />
        <br />

        <div className="flex items-center justify-between text-light-gray-color">
          <div className={LikeCommentShareClass}>
            <div>
              <HeartIcon color="#EB2560"/>
            </div>
            <div className="text-heart-color">2.6K Likes</div>
          </div>
          <div className={LikeCommentShareClass}>
            <div>
              <CommentIcon />
            </div>
            <div>297 Comments</div>
          </div>
          <div className={LikeCommentShareClass}>
            <div>
              <ShareIcon />
            </div>
            <div>201 Shares</div>
          </div>
        </div>

        <div className="my-5 pr-3 input-text flex items-center gap-3">
          <RHFTextField
            type={"text"}
            name="dancing"
            control={control}
            errors={errors}
            placeholder="Write your message..."
            className={`input-text border-none shadow-none`}
          />
          <EmojIcon />
          <LinkIcon />
        </div>
      </div>
    </div>
  );
};

export default PostTabs;

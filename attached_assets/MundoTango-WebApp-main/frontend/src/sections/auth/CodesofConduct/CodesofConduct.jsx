import SpinnerLoading from "@/components/Loadings/Spinner";
import BackArrow from "@/components/SVGs/BackArrow";
import NextArrow from "@/components/SVGs/NextArrow";
import { getAuthToken, removeAuthToken, storeToken } from "@/data/services/localStorageService";
import { useAddCodeOfConductMutation } from "@/data/services/userFormsApi";
import { PATH_DASHBOARD } from "@/routes/paths";
import ConfirmationHeader from "@/sections/auth/confirmation/ConfirmationHeader";
import Checkbox from "@/sections/auth/questionnaire/Checkbox";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const CodeOfConduct = [
  {
    title: "Leave hot topics like politics out",
    description:
      "We are here to talk about tango. Not policitcs or other hot issues",
    color: "#FFFBEF",
  },
  {
    title: "NO means NO",
    description: (
      <div>
        This is a partner dance where we find trust in each other. If someone
        says NO then it means NO and the person should not have to give reasons
        why they said no. <br />
        <br /> This applies both on and off the dance floor.
      </div>
    ),
    color: "#FFF2EF",
  },
  {
    title: "Maintain Professionalism",
    description:
      "Refrain from posting inappropriate or offensive content that may harm the community.",
    color: "#EFF6FF",
  },
  {
    title: "Respect Privacy",
    description:
      "Always ask for permission before sharing photos or videos of others.",
    color: "#FFF4FB",
  },
  {
    title: "Be Supportive",
    description:
      "Encourage and support fellow memebers through positive comments and interactions.",
    color: "#FFF7EF",
  },
];

function CodesofConduct({ handleNext }) {
  const { back, push } = useRouter();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addCodeOfConduct, { isLoading: addCodeofConductLoading }] =
  useAddCodeOfConductMutation();

  const changeToken = async () => {
    if (!checked) return toast.error("Please accept guideline to continue!");
    setLoading(true);
    try {
      const response = await addCodeOfConduct();

      if (response?.error?.data?.code === 400) {
        toast.error(response?.error?.data?.message);
        return;
      }

      if (response?.error?.data?.code === 500) {
        toast.error("Seems like something went wrong");
        return;
      }

      if (response?.data?.code === 200) {
        toast.success("Info added successfully!");
        const token = getAuthToken();
        storeToken(token);
        push(PATH_DASHBOARD.root);
      }
    } catch (e) {
      console.log(e.message);
    }
  };
  

  return (
    <div className="bg-background-color h-screen overflow-y-scroll">
      <ConfirmationHeader />
      <div className="grid grid-cols-12 ">
        <div className="col-span-12 px-2 my-5">
          <div className="text-2xl font-bold text-center">
            Mundo Tango Codes of Conduct
          </div>
        </div>

        <div className="col-span-12">
          <div className="flex flex-wrap mx-10 lg:mx-28 items-center justify-center gap-6">
            {CodeOfConduct.map(({ title, description, color }, index) => (
              <div
                key={index}
                className={`w-96 md:h-[256px] p-4 rounded-xl border-2`}
                style={{ backgroundColor: color }}
              >
                <div className="text-lg font-bold">{title}</div>
                <div className="text-[#949393] mt-5">{description}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center lg:mx-[300px] lg:w-[400px] my-5">
            <div onClick={() => setChecked(prev => !prev)}>
              <Checkbox className={"border border-black"}/>
            </div>
            <div>I Agree to all the above Guidelines</div>
          </div>
        </div>

        <div className="col-span-12 mb-5 mx-32 lg:mx-72 ">
          <div className="mt-5 flex justify-around md:justify-between gap-5 ">
            <button
              className="bg-btn-color text-white px-10 py-3 rounded-xl"
              type="button"
              onClick={back}
            >
              <BackArrow />
            </button>

            <button
              // onClick={handleNext}
              onClick={changeToken}
              className="bg-btn-color text-white px-10 py-3 rounded-xl "
            >
             {addCodeofConductLoading ? <SpinnerLoading/> : <NextArrow />} 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodesofConduct;

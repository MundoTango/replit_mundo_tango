"use client";

import { setRouter } from "@/data/features/authSlice";
import { removeAuthToken } from "@/data/services/localStorageService";
import { useGetTrangoActivityMutation } from "@/data/services/userFormsApi";
import { PATH_AUTH } from "@/routes/paths";
import Creator from "@/sections/auth/questionnaire/Creator";
import DJForm from "@/sections/auth/questionnaire/DJForm";
import HousingHost from "@/sections/auth/questionnaire/HousingHost";
import Organizer from "@/sections/auth/questionnaire/Organizer";
import Performer from "@/sections/auth/questionnaire/Performer";
import Photographer from "@/sections/auth/questionnaire/Photographer";
import Teachers from "@/sections/auth/questionnaire/Teachers";
import TourOperator from "@/sections/auth/questionnaire/TourOperator";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

const keys = [
  "teacher_at",
  "organizer_at",
  "dj_at",
  "creator_at",
  "photographer_at",
  "performer_at",
  "host_at",
  "tour_operator_at",
];

const page = () => {
  const [formsIndex, setFormsIndex] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [route, setRoute] = useState("");
  const [index, setIndex] = useState(0);

  const [getTrangoActivities, { isLoading: getLoading }] =
    useGetTrangoActivityMutation();

  const { push } = useRouter();

  useEffect(() => {
    try {
      let userForm = localStorage.getItem("ch");
      userForm = JSON.parse(userForm);
      if (userForm !== null) {
        setFormsIndex(userForm);
      } else {
        setFormsIndex([]);
      }
      if (getLocalIndex()) {
        setIndex(getLocalIndex());
      }
      const rout = localStorage.getItem("router");
      setRoute(rout);

      getTrangoActivity();
    } catch (e) {}
  }, []);

  const nextForm = () => {
    if (formsIndex.length - 1 != index) {
      let temp = index;
      temp++;
      setIndex(temp);
      setLocalIndex(temp);
    } else {
      push(PATH_AUTH.wheredoyoudance);
    }
  };

  const preForm = () => {
    if (!!index) {
      let temp = index;
      temp--;
      setIndex(temp);
      setLocalIndex(temp);
    } else {
      push(PATH_AUTH.whatdoyoudo);
    }
  };

  const handleRoute = () => {
    if (route === "push") {
      push(PATH_AUTH.wheredoyoudance);
    } else if (route === "back") {
      push(PATH_AUTH.whatdoyoudo);
    } else {
      if (formsIndex.length == 0) localStorage.setItem("type", 3);
      push(PATH_AUTH.questionnaire);
      // removeAuthToken();
    }
  };

  const setLocalIndex = (index) => localStorage.setItem("i", index);

  const getLocalIndex = () => localStorage.getItem("i");

  const getTrangoActivity = async () => {
    try {
      const response = await getTrangoActivities();

      if (response?.data?.code === 200) {
        let temp = { ...response.data.data };
        delete temp.id;
        delete temp.user_id;
        delete temp.other;
        delete temp.social_dancer;

        // prepareForms(temp);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const prepareForms = (record) => {
    console.log(record);
    let object = [];
    Object.keys(record).map((item, index) => {
      if (
        keys.includes(item) &&
        !!record[item] &&
        record[item] != "Invalid date"
      ) {
        object.push(index + 1);
      }
    });
    console.log(object);
    try {
      localStorage.setItem("ch", JSON.stringify(object));
      setFormsIndex(object);
      const rout = localStorage.getItem("router");
      setRoute(rout);
      // dispatch(setRouter('push'));
    } catch (e) {}
  };

  const FormComponents = {
    1: <Teachers nextForm={nextForm} preForm={preForm} />,
    2: <Organizer nextForm={nextForm} preForm={preForm} />,
    3: <DJForm nextForm={nextForm} preForm={preForm} />,
    4: <Creator nextForm={nextForm} preForm={preForm} />,
    5: <Photographer nextForm={nextForm} preForm={preForm} />,
    6: <Performer nextForm={nextForm} preForm={preForm} />,
    7: <HousingHost nextForm={nextForm} preForm={preForm} />,
    8: <TourOperator nextForm={nextForm} preForm={preForm} />,
  };

  if (getLoading) {
    return (
      <main className="w-100 h-screen flex justify-center">
        <div className="main-spinner"></div>
      </main>
    );
  }

  if (formsIndex.length > 0 && index >= 0 && index < formsIndex.length) {
    const currentForm = FormComponents[formsIndex[index]];
    return <div>{currentForm}</div>;
  } else {
    handleRoute();
    return (
      <main className="w-100 h-screen flex justify-center">
        <div className="main-spinner"></div>
      </main>
    );
  }
};

export default page;

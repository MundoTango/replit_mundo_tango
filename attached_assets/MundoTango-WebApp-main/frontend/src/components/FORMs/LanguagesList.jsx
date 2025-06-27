"use client";

import { useGetLanguagesQuery } from "@/data/services/userFormsApi";
// import { Country } from "country-state-city";
import * as React from "react";
import SearchIcon from "../SVGs/SearchIcon";
import SpinnerLoading from "../Loadings/Spinner";

const LanguageList = ({ handleClose, setlanguage, setValue }) => {
  const  {data: languages, isLoading} = useGetLanguagesQuery();
  const [LanguageList, setLanguageList] = React.useState(languages?.data
    // Country.getAllCountries()
  );

  //   try {
  //     const options = {
  //       method: "GET",
  //       url: "https://all-country-codes-currency-codes.p.rapidapi.com/all-countries-country-and-currency-codes",
  //       headers: {
  //         "x-rapidapi-key":
  //           "ebdbe8f416msh4ec5460987bcb8dp137b0fjsnf085bf4dd7dd",
  //         "x-rapidapi-host": "all-country-codes-currency-codes.p.rapidapi.com",
  //       },
  //     };
  //     const response = await axios.request(options);
  //     setObjectList(response.data.countries);
  //     setLanguageList(Object.keys(response.data.countries));
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //     setLoading(false);
  //   }
  // };

  React.useEffect(() => {
    setLanguageList(languages?.data)
  },[languages])

  const searchCountries = (e) => {
    try {
      const value = e.target.value;
      if (value == "") {
        // setLanguageList(Country.getAllCountries());
        setLanguageList(languages?.data);
        return;
      } else {
        let list = LanguageList.filter((v) =>
          v?.name?.toLowerCase()?.includes(value?.toLowerCase())
        );
        setLanguageList(list);
      }
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <div className="bg-[#F0F0F0] py-2 rounded-xl select-none">
      <div className="px-2">
      <div className="bg-[#e2e2e2] flex justify-between items-center py-1 ps-3 pr-4 rounded-full">
    <input
      type="text"
      className="bg-[#e2e2e2] text-xs p-2 w-full outline-none border-none"
      placeholder="Search"
      onChange={searchCountries}
    />
    <SearchIcon />
  </div>
      </div>

      <div className="h-[450px] overflow-y-scroll mt-5">
        {!!LanguageList?.length ? 
          LanguageList.map(({ name, isoCode }, index) => (
            <div
              key={name}
              className="flex items-center justify-between my-4 px-3 cursor-pointer"
              onClick={() => {
                handleClose();
                // setCountryInfo({
                //   title: name,
                //   image: `https://flagpedia.net/data/flags/w580/${isoCode?.toLowerCase()}.png`,
                // });
                setlanguage(name);
                setValue('locations', name)
              }}
            >
              <div className="text-sm font-medium">{name}</div>

              {/* <div>
                <img
                  loading="lazy"
                  src={`https://flagpedia.net/data/flags/w580/${isoCode?.toLowerCase()}.png`}
                  className="w-16 h-10 object-contain"
                />
              </div> */}
            </div>
          )) : isLoading ? <div className="w-full flex justify-center"><SpinnerLoading/></div> : LanguageList?.length === 0 && <p className="w-full flex justify-center">Locations Not Available</p>}
      </div>
    </div>
  );
};

export default LanguageList;

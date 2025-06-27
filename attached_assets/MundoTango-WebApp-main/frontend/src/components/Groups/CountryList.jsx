"use client";

import { useGetLanguagesQuery } from "@/data/services/userFormsApi";
// import { Country } from "country-state-city";
import * as React from "react";
import SearchIcon from "../SVGs/SearchIcon";
import SpinnerLoading from "../Loadings/Spinner";
import { City, Country } from "country-state-city";
import CrossIcon from "../SVGs/CrossIcon";
import { useState } from "react";

const CountryList = ({ handleClose, setValue, value }) => {
  const [CountryList, setCountryList] = useState(Country.getAllCountries());
  const [cityList, setCityList] = useState(City.getAllCities());
  const [searchCities, setSearchCities] = useState(cityList?.slice(0, 300));
  const [searchError, setSearchError] = useState(null);
  const [search, setSearch] = useState("");
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
  //     setCountryList(Object.keys(response.data.countries));
  //     setLoading(false);
  //   } catch (error) {
  //     console.error(error);
  //     setLoading(false);
  //   }
  // };

  // const searchCountries = (e) => {
  //   try {
  //     const value = e.target.value;
  //     if (value) {
  //       let list = CountryList.filter((v) =>
  //           v?.name?.toLowerCase()?.includes(value?.toLowerCase())
  //         );
  //         setCountryList(list);
  //     } else {
  //       searchCountries(CountryList);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  const searchUser = (e) => {
    try {
      const value = e.target.value;
      setSearch(value);
      if (value?.length == "") {
        setSearchCities(cityList?.slice(0, 100));
        setSearchError(null);
        return;
      } else if (value?.length < 3 && value?.length > 0) {
        setSearchError("minimun 3 characters required");
        return;
      } else if (value?.length >= 3) {
        let list = cityList?.filter((v) =>
          v?.name?.toLowerCase()?.includes(search?.toLowerCase())
        );
        let uniqueCities = Array.from(
          new Set(list.map((city) => city?.name?.toLowerCase()))
        ).map((name) =>
          list.find((city) => city?.name?.toLowerCase() === name)
        );

        setSearchCities(uniqueCities?.slice(0, 300));
        setSearchError(null);
        return;
      }
    } catch (e) {
      console.log(e);
    }
  };
  const handleSearch = () => {
    if (search?.length >= 3) {
      let list = cityList?.filter((v) =>
        v?.name?.toLowerCase()?.includes(search?.toLowerCase())
      );
      console.log(list);
      setSearchCities(list);
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
            onChange={searchUser}
          />
          <div onClick={handleSearch} className="cursor-pointer">
            <SearchIcon />
          </div>
        </div>
        <div className="h-3">
          {searchError && (
            <p className="text-xs text-red-500 w-full flex justify-start ms-3 mt-1">
              {searchError}
            </p>
          )}
        </div>
      </div>

      <div className="h-[450px] overflow-y-scroll mt-2">
        {value && (
          <div
            className={`flex items-center justify-between my-4 px-3 cursor-pointer text-sm ${value ? "font-extrabold" : "font-medium"}`}
            onClick={() => {
              handleClose();
              setValue("");
            }}
          >
            <p className="from-inherit">{value}</p>
            <button>
              <CrossIcon />
            </button>
          </div>
        )}
        {!!searchCities?.length
          ? searchCities.map(({ name, isoCode }, index) => (
              <div
                key={name}
                className="flex items-center justify-between my-4 px-3 cursor-pointer"
                onClick={() => {
                  handleClose();
                  // setCountryInfo({
                  //   title: name,
                  //   image: `https://flagpedia.net/data/flags/w580/${isoCode?.toLowerCase()}.png`,
                  // });
                  setValue((prev) => (prev === name ? "" : name));
                }}
              >
                <div className={`flex justify-between w-full text-sm`}>
                  <p className="from-inherit">{name}</p>
                </div>

                {/* <div>
                <img
                  loading="lazy"
                  src={`https://flagpedia.net/data/flags/w580/${isoCode?.toLowerCase()}.png`}
                  className="w-16 h-10 object-contain"
                />
              </div> */}
              </div>
            ))
          : searchCities?.length === 0 && (
              <p className="w-full flex justify-center h-full">
                city not available
              </p>
            )}
      </div>
    </div>
  );
};

export default CountryList;

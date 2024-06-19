import React, { useEffect, useState } from "react";
import Forcast from "./components/Forcast";
import TopButtons from "./components/TopButtons";
import Inputs from "./components/Inputs";
import TimeandLocation from "./components/TimeandLocation";
import TempAndDetails from "./components/TempAndDetails";
import getFormattedWeatherData from "./services/weatherService";
import DarkModeToggle from "./components/DarkModeToggle"; // Import the DarkModeToggle component

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function capitalizeFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const App = () => {
  const [query, setQuery] = useState({ q: "Muzaffarpur" });
  const [units, setUnits] = useState("metric");
  const [weather, setWeather] = useState(null);

  const getWeather = async () => {
    const cityName = query.q ? query.q : "current location";
    toast.info(`Fetching weather data for ${capitalizeFirst(cityName)}`);
    const data = await getFormattedWeatherData({ ...query, units }).then(
      (data) => {
        toast.success(`Fetched weather data for ${data.name},${data.country}`);
        setWeather(data);
      }
    );
    console.log(data);
  };

  useEffect(() => {
    getWeather();
  }, [query, units]);

  return (
    <div className="mx-auto max-w-screen-lg mt-4 py-5 px-4 
    sm:px-8 md:px-16 lg:px-24 bg-gradient-to-br shadow-xl shadow-black-400
     from-blue-300 to-blue-700
     dark:from-gray-800 dark:to-black transition-colors duration-300">
      <div className="flex justify-between items-center">
        <TopButtons setQuery={setQuery} />
        <DarkModeToggle /> {/* Add the DarkModeToggle component */}
      </div>
      <Inputs setQuery={setQuery} setUnits={setUnits} />
      {weather && (
        <>
          <TimeandLocation weather={weather} />
          <TempAndDetails weather={weather} units={units} />
          <Forcast title="3 hour step Forecast" data={weather.forecast.hourly} />
          <Forcast title="Daily Forecast" data={weather.forecast.daily} />
        </>
      )}
      <ToastContainer autoClose={1000} hideProgressBar={true} theme="colored" />
    </div>
  );
};

export default App;

import React from "react";

const Forcast = ({ title, data, isDaily = false }) => {
  return (
    <div>
      <div className="flex items-center justify-center mt-6">
        <p className="font-Medium uppercase">{title}</p>
      </div>
      <hr className="my-3" />
      
      <div className="flex flex-wrap items-center justify-between">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center w-full sm:w-1/2 md:w-1/3 lg:w-1/5"
          >
            <p className="font-light text-sm">{item.dt}</p>
            <img src={item.iconUrl} alt="weather" className="w-12 my-1" />
            <p className="font-medium">{`Min: ${item.temp_min}° | Max: ${item.temp_max}°`}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forcast;

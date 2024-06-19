import { DateTime } from 'luxon';

const API_KEY = '9b10af1e29f33861f0fcff9ee611cb80';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

const getWeatherData = (infoType, searchParams) => {
  const url = new URL(BASE_URL + infoType);
  url.search = new URLSearchParams({ ...searchParams, appid: API_KEY });
  return fetch(url).then((res) => res.json());
};

const iconUrlFromCode = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const formatToLocalTime = (secs, offset, format = "cccc, dd LLL yyyy' | Local time: 'hh:mm a") =>
  DateTime.fromSeconds(secs).setZone('UTC').plus({ seconds: offset }).toFormat(format);

const convertWindSpeed = (speed, units) => {
  if (units === 'metric') {
    return (speed*3.603).toFixed(1); // m/s to km/h
  } else if (units === 'imperial') {
    return (speed*2.237/2.237).toFixed(1); // m/s to mph
  }
  return speed.toFixed(1); // default m/s
};

const formatCurrentWeather = (data, units) => {
  const {
    coord: { lat, lon },
    main: { temp, feels_like, temp_min, temp_max, humidity },
    name,
    dt,
    sys: { country, sunrise, sunset },
    weather,
    wind: { speed },
    timezone,
  } = data;

  const { main: details, icon } = weather[0];
  const formattedLocalTime = formatToLocalTime(dt, timezone);
  const formattedSpeed = convertWindSpeed(speed, units);

  return {
    lat,
    lon,
    temp,
    feels_like,
    temp_min,
    temp_max,
    humidity,
    name,
    dt,
    country,
    sunrise: formatToLocalTime(sunrise, timezone, 'hh:mm a'),
    sunset: formatToLocalTime(sunset, timezone, 'hh:mm a'),
    details,
    iconUrl: iconUrlFromCode(icon),
    speed: formattedSpeed,
    timezone,
    formattedLocalTime,
  };
};

const formatForecastWeather = (data, timezone, units) => {
  const hourly = data.list.slice(0, 5).map((item) => ({
    dt: formatToLocalTime(item.dt, timezone, 'ccc, hh:mm a'),
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    temp_min: item.main.temp_min,
    temp_max: item.main.temp_max,
    humidity: item.main.humidity,
    weather: item.weather[0].main,
    iconUrl: iconUrlFromCode(item.weather[0].icon),
    wind_speed: convertWindSpeed(item.wind.speed, units),
  }));

  const dailyData = data.list.reduce((acc, item) => {
    const date = DateTime.fromSeconds(item.dt).setZone('UTC').plus({ seconds: timezone }).toFormat('yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = {
        date,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        weather: item.weather[0].main,
        iconUrl: iconUrlFromCode(item.weather[0].icon),
        wind_speed: convertWindSpeed(item.wind.speed, units),
      };
    } else {
      acc[date].temp_min = Math.min(acc[date].temp_min, item.main.temp_min);
      acc[date].temp_max = Math.max(acc[date].temp_max, item.main.temp_max);
    }
    return acc;
  }, {});

  const dailyArray = Object.values(dailyData).slice(0, 5).map(item => ({
    dt: DateTime.fromISO(item.date).toFormat('ccc'),
    temp_min: item.temp_min,
    temp_max: item.temp_max,
    weather: item.weather,
    iconUrl: item.iconUrl,
    wind_speed: item.wind_speed,
  }));

  return { hourly, daily: dailyArray };
};

const getFormattedWeatherData = async (searchParams) => {
  const currentWeatherData = await getWeatherData('weather', searchParams);
  const formattedCurrentWeather = formatCurrentWeather(currentWeatherData, searchParams.units);

  const { lat, lon, timezone } = formattedCurrentWeather;
  const forecastWeatherData = await getWeatherData('forecast', {
    lat,
    lon,
    units: searchParams.units,
  });

  const formattedForecastWeather = formatForecastWeather(forecastWeatherData, timezone, searchParams.units);

  return { ...formattedCurrentWeather, forecast: formattedForecastWeather };
};

export default getFormattedWeatherData;

import { Country, State, City } from "country-state-city";

// Get all countries
export const getAllCountries = () => {
    return Country.getAllCountries().map((country) => ({
        value: country.isoCode,
        label: country.name,
        ...country,
    }));
};

// Get states by country code
export const getStatesByCountry = (countryCode) => {
    if (!countryCode) return [];
    return State.getStatesOfCountry(countryCode).map((state) => ({
        value: state.isoCode,
        label: state.name,
        ...state,
    }));
};

// Get cities by country and state code
export const getCitiesByState = (countryCode, stateCode) => {
    if (!countryCode || !stateCode) return [];
    return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
        value: city.name,
        label: city.name,
        ...city,
    }));
};

// Format location for display (City, State, Country)
export const formatLocation = (city, state, country) => {
    const parts = [];
    if (city) parts.push(city);
    if (state) parts.push(state);
    if (country) parts.push(country);
    return parts.join(", ");
};

// Parse location string back to components
export const parseLocation = (locationString) => {
    if (!locationString) return { city: "", state: "", country: "" };
    const parts = locationString.split(", ").map((p) => p.trim());
    if (parts.length === 3) {
        return { city: parts[0], state: parts[1], country: parts[2] };
    } else if (parts.length === 2) {
        return { city: parts[0], state: parts[1], country: "" };
    } else if (parts.length === 1) {
        return { city: parts[0], state: "", country: "" };
    }
    return { city: locationString, state: "", country: "" };
};

// Get unique locations from job list for filtering
export const getUniqueLocationsFromJobs = (jobs) => {
    if (!jobs || !jobs.length) return { countries: [], states: [], cities: [] };

    const countries = new Set();
    const states = new Set();
    const cities = new Set();

    jobs.forEach((job) => {
        if (job.country) countries.add(job.country);
        if (job.state) states.add(job.state);
        if (job.city) cities.add(job.city);
        // Legacy support for old location string format
        if (job.location && !job.country) {
            cities.add(job.location);
        }
    });

    return {
        countries: Array.from(countries).sort(),
        states: Array.from(states).sort(),
        cities: Array.from(cities).sort(),
    };
};

// Default country for the application (Bangladesh)
export const DEFAULT_COUNTRY = "BD";
export const DEFAULT_COUNTRY_NAME = "Bangladesh";

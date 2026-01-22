import React, { useState, useEffect } from "react";
import {
    getAllCountries,
    getStatesByCountry,
    getCitiesByState,
    DEFAULT_COUNTRY,
} from "../utils/locationUtils";

const LocationSelector = ({
    selectedCountry,
    selectedState,
    selectedCity,
    onCountryChange,
    onStateChange,
    onCityChange,
    showLabels = true,
    className = "",
    required = false,
}) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Load countries on mount
    useEffect(() => {
        const allCountries = getAllCountries();
        setCountries(allCountries);
    }, []);

    // Load states when country changes
    useEffect(() => {
        if (selectedCountry) {
            const countryStates = getStatesByCountry(selectedCountry);
            setStates(countryStates);
            setCities([]);
        } else {
            setStates([]);
            setCities([]);
        }
    }, [selectedCountry]);

    // Load cities when state changes
    useEffect(() => {
        if (selectedCountry && selectedState) {
            const stateCities = getCitiesByState(selectedCountry, selectedState);
            setCities(stateCities);
        } else {
            setCities([]);
        }
    }, [selectedCountry, selectedState]);

    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        const country = countries.find((c) => c.value === countryCode);
        onCountryChange(countryCode, country?.label || "");
        onStateChange("", "");
        onCityChange("");
    };

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        const state = states.find((s) => s.value === stateCode);
        onStateChange(stateCode, state?.label || "");
        onCityChange("");
    };

    const handleCityChange = (e) => {
        onCityChange(e.target.value);
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Country Selector */}
            <div>
                {showLabels && (
                    <label className="block text-gray-800 text-sm font-medium mb-1">
                        Country {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <select
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    required={required}
                >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                        <option key={country.value} value={country.value}>
                            {country.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* State Selector */}
            <div>
                {showLabels && (
                    <label className="block text-gray-800 text-sm font-medium mb-1">
                        State/Division {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <select
                    value={selectedState}
                    onChange={handleStateChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedCountry || states.length === 0}
                    required={required}
                >
                    <option value="">
                        {!selectedCountry
                            ? "Select country first"
                            : states.length === 0
                                ? "No states available"
                                : "Select State/Division"}
                    </option>
                    {states.map((state) => (
                        <option key={state.value} value={state.value}>
                            {state.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* City Selector */}
            <div>
                {showLabels && (
                    <label className="block text-gray-800 text-sm font-medium mb-1">
                        City
                    </label>
                )}
                <select
                    value={selectedCity}
                    onChange={handleCityChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedState || cities.length === 0}
                >
                    <option value="">
                        {!selectedState
                            ? "Select state first"
                            : cities.length === 0
                                ? "No cities available"
                                : "Select City (Optional)"}
                    </option>
                    {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                            {city.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LocationSelector;

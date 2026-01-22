import { ChevronLeft, ChevronRight, Filter, MapPin } from "lucide-react";
import React, { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobCategories } from "../assets/assets";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AppContext } from "../context/AppContext";
import Loader from "../components/Loader";
import { motion } from "framer-motion";
import { slideRigth, SlideUp } from "../utils/Animation";
import {
  getAllCountries,
  getStatesByCountry,
  getCitiesByState,
} from "../utils/locationUtils";

function AllJobs() {
  const [jobData, setJobData] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Location filter states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const {
    jobs,
    searchFilter,
    setSearchFilter,
    setIsSearched,
    isSearched,
    fetchJobsData,
  } = useContext(AppContext);

  const { category } = useParams();
  const navigate = useNavigate();

  const jobsPerPage = 6;

  const [searchInput, setSearchInput] = useState({
    title: "",
    location: "",
    selectedCategories: [],
  });

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
      setSelectedState("");
      setSelectedCity("");
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
      setSelectedCity("");
    } else {
      setCities([]);
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchJobsData();
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!jobs?.length) return;

    let filtered = [...jobs];

    if (category !== "all") {
      filtered = filtered.filter(
        (job) => job.category.toLowerCase() === category.toLowerCase()
      );
    }

    setJobData(filtered);
    setSearchInput({
      title: isSearched ? searchFilter.title : "",
      location: isSearched ? searchFilter.location : "",
      selectedCategories: [],
    });

    setCurrentPage(1);
  }, [category, jobs, isSearched, searchFilter]);

  // Filter jobs based on all criteria
  useEffect(() => {
    let results = [...jobData];

    // Title filter
    if (searchInput.title.trim()) {
      results = results.filter((job) =>
        job.title.toLowerCase().includes(searchInput.title.trim().toLowerCase())
      );
    }

    // Text-based location filter (legacy support)
    if (searchInput.location.trim()) {
      results = results.filter((job) =>
        job.location
          .toLowerCase()
          .includes(searchInput.location.trim().toLowerCase())
      );
    }

    // Category filter
    if (searchInput.selectedCategories.length > 0) {
      results = results.filter((job) =>
        searchInput.selectedCategories.includes(job.category)
      );
    }

    // Country filter
    if (selectedCountry) {
      const countryName =
        countries.find((c) => c.value === selectedCountry)?.label || "";
      results = results.filter(
        (job) =>
          job.country === countryName ||
          job.countryCode === selectedCountry ||
          job.location.toLowerCase().includes(countryName.toLowerCase())
      );
    }

    // State filter
    if (selectedState) {
      const stateName =
        states.find((s) => s.value === selectedState)?.label || "";
      results = results.filter(
        (job) =>
          job.state === stateName ||
          job.stateCode === selectedState ||
          job.location.toLowerCase().includes(stateName.toLowerCase())
      );
    }

    // City filter
    if (selectedCity) {
      results = results.filter(
        (job) =>
          job.city === selectedCity ||
          job.location.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    setFilteredJobs(results);
    setCurrentPage(1);
  }, [
    jobData,
    searchInput,
    selectedCountry,
    selectedState,
    selectedCity,
    countries,
    states,
  ]);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (cat) => {
    setSearchInput((prev) => {
      const updated = prev.selectedCategories.includes(cat)
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      return { ...prev, selectedCategories: updated };
    });
  };

  const clearAllFilters = () => {
    setSearchInput({
      title: "",
      location: "",
      selectedCategories: [],
    });
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setSearchFilter({ title: "", location: "" });
    setIsSearched(false);
    navigate("/all-jobs/all");
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginatedJobs = useMemo(() => {
    return [...filteredJobs]
      .reverse()
      .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);
  }, [filteredJobs, currentPage]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchInput.title.trim()) count++;
    if (searchInput.location.trim()) count++;
    if (searchInput.selectedCategories.length > 0) count++;
    if (selectedCountry) count++;
    if (selectedState) count++;
    if (selectedCity) count++;
    return count;
  }, [searchInput, selectedCountry, selectedState, selectedCity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <section>
        <div className="md:hidden flex justify-end mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            <Filter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {activeFiltersCount > 0 && (
              <span className="bg-white text-blue-500 rounded-full px-2 py-0.5 text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <motion.div
          variants={slideRigth(0.5)}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row md:gap-8 lg:gap-16"
        >
          {/* Filters */}
          <div
            className={`lg:w-1/4 p-4 rounded-lg border border-gray-200 ${showFilters ? "block" : "hidden md:block"
              }`}
          >
            <div className="space-y-6">
              {/* Job Title Search */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Job Title
                </h2>
                <input
                  type="text"
                  name="title"
                  value={searchInput.title}
                  onChange={handleSearchChange}
                  placeholder="Enter title"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              {/* Location Search Text */}
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Search Location
                </h2>
                <input
                  type="text"
                  name="location"
                  value={searchInput.location}
                  onChange={handleSearchChange}
                  placeholder="Search by location name"
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              {/* Country-State-City Filters */}
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-blue-500" />
                  Filter by Location
                </h2>

                {/* Country Selector */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State Selector */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Division
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedCountry || states.length === 0}
                  >
                    <option value="">
                      {!selectedCountry
                        ? "Select country first"
                        : states.length === 0
                          ? "No states available"
                          : "All States"}
                    </option>
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Selector */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!selectedState || cities.length === 0}
                  >
                    <option value="">
                      {!selectedState
                        ? "Select state first"
                        : cities.length === 0
                          ? "No cities available"
                          : "All Cities"}
                    </option>
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories */}
              <div className="border-t border-gray-200 pt-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Categories
                </h2>
                <ul className="space-y-2">
                  {JobCategories.map((cat, i) => (
                    <li key={i} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cat-${i}`}
                        checked={searchInput.selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`cat-${i}`}
                        className="ml-2 text-gray-700"
                      >
                        {cat}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition border border-red-200"
                >
                  Clear All Filters ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>

          {/* Job Cards */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-700 capitalize mb-2">
                {category === "all"
                  ? "Latest All Jobs"
                  : `Jobs in ${category.charAt(0).toUpperCase() + category.slice(1)
                  }`}
                {filteredJobs.length > 0 && (
                  <span className="ml-2 text-gray-500 text-lg">
                    ({filteredJobs.length}{" "}
                    {filteredJobs.length === 1 ? "job" : "jobs"})
                  </span>
                )}
              </h1>
              <p className="text-gray-600">
                Get your desired job from top companies
              </p>
              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedCountry && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      <MapPin size={14} />
                      {countries.find((c) => c.value === selectedCountry)
                        ?.label || selectedCountry}
                    </span>
                  )}
                  {selectedState && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {states.find((s) => s.value === selectedState)?.label ||
                        selectedState}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {selectedCity}
                    </span>
                  )}
                </div>
              )}
            </div>

            <motion.div
              variants={SlideUp(0.5)}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {paginatedJobs.length > 0 ? (
                paginatedJobs.map((job, i) => <JobCard key={i} job={job} />)
              ) : (
                <div className="text-center bg-white p-6 border border-gray-200 rounded-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    No jobs found
                  </h3>
                  <p className="text-gray-500 mb-3">
                    Try adjusting your search filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-md border text-center cursor-pointer ${currentPage === i + 1
                        ? "bg-blue-50 text-blue-500 border-blue-300"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 text-gray-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}

export default AllJobs;

import { useContext, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyToken } = useContext(AppContext);

  useEffect(() => {
    // Redirect to manage-jobs if on base dashboard path
    if (
      location.pathname === "/dashboard" ||
      location.pathname === "/dashboard/"
    ) {
      document.title = "Superio - Job Portal | Dashboard";
      navigate("/dashboard/manage-jobs");
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!companyToken) {
      navigate("/recruiter-login");
    }
  }, [companyToken, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;




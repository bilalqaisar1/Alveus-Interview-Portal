import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);

  const [userToken, setUserToken] = useState(localStorage.getItem("userToken"));
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(!!localStorage.getItem("userToken"));
  const [isLogin, setIsLogin] = useState(!!userToken);
  const [userApplication, setUserApplication] = useState(null);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [companyToken, setCompanyToken] = useState(
    localStorage.getItem("companyToken")
  );
  const [companyData, setCompanyData] = useState(null);
  const [isCompanyLogin, setIsCompanyLogin] = useState(!!companyToken);
  const [companyLoading, setIsCompanyLoading] = useState(!!localStorage.getItem("companyToken"));

  useEffect(() => {
    if (userToken) {
      localStorage.setItem("userToken", userToken);
    } else {
      localStorage.removeItem("userToken");
    }
  }, [userToken]);

  useEffect(() => {
    if (companyToken) {
      localStorage.setItem("companyToken", companyToken);
    } else {
      localStorage.removeItem("companyToken");
    }
  }, [companyToken]);

  const fetchUserData = async () => {
    if (!userToken) return;
    setUserDataLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/user/user-data`, {
        headers: { token: userToken },
      });
      if (data.success) {
        setUserData(data.userData);
      }
    } catch (error) {
      console.error("Fetch user data error:", error);
    } finally {
      setUserDataLoading(false);
    }
  };

  const fetchCompanyData = async () => {
    if (!companyToken) return;
    setIsCompanyLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/company/company-data`, {
        headers: { token: companyToken },
      });
      if (data.success) {
        setCompanyData(data.companyData);
      }
    } catch (error) {
      console.error("Fetch company data error:", error);
    } finally {
      setIsCompanyLoading(false);
    }
  };

  const fetchJobsData = async () => {
    setJobLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/job/all-jobs`);
      if (data.success) {
        setJobs(data.jobData);
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setJobLoading(false);
    }
  };

  const fetchUserApplication = async () => {
    if (!userToken) return;
    try {
      setApplicationsLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/user/get-user-applications`,
        {},
        { headers: { token: userToken } }
      );
      if (data.success) {
        setUserApplication(data.jobApplications);
      }
    } catch (error) {
      console.error("Fetch user applications error:", error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const activeToken = userToken || companyToken;

  const fetchNotifications = async () => {
    if (!activeToken) return;
    try {
      const { data } = await axios.get(`${backendUrl}/notification`, {
        headers: { token: activeToken },
      });
      if (data.success) {
        setNotifications(data.notifications);
      }

      const { data: countData } = await axios.get(
        `${backendUrl}/notification/unread-count`,
        { headers: { token: activeToken } }
      );
      if (countData.success) {
        setUnreadCount(countData.count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationAsRead = async (id) => {
    if (!activeToken) return;
    try {
      const { data } = await axios.put(
        `${backendUrl}/notification/${id}/read`,
        {},
        { headers: { token: activeToken } }
      );
      if (data.success) {
        fetchNotifications();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!activeToken) return;
    try {
      const { data } = await axios.put(
        `${backendUrl}/notification/read-all`,
        {},
        { headers: { token: activeToken } }
      );
      if (data.success) {
        fetchNotifications();
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchJobsData();
  }, []);

  useEffect(() => {
    if (userToken) {
      setIsLogin(true);
      fetchUserData();
      fetchUserApplication();
    } else {
      setUserData(null);
      setIsLogin(false);
    }
  }, [userToken]);

  useEffect(() => {
    if (companyToken) {
      setIsCompanyLogin(true);
      fetchCompanyData();
    } else {
      setCompanyData(null);
      setIsCompanyLogin(false);
    }
  }, [companyToken]);

  useEffect(() => {
    if (activeToken) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // 30s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [activeToken]);

  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    jobLoading,
    fetchJobsData,
    backendUrl,
    userToken,
    setUserToken,
    userData,
    setUserData,
    userDataLoading,
    isLogin,
    setIsLogin,
    fetchUserData,
    companyToken,
    setCompanyToken,
    companyData,
    setCompanyData,
    isCompanyLogin,
    setIsCompanyLogin,
    fetchCompanyData,
    companyLoading,
    userApplication,
    applicationsLoading,
    fetchUserApplication,
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

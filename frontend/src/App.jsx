import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import About from "./pages/About";
import AllJobs from "./pages/AllJobs";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import CandidatesLogin from "./pages/CandidatesLogin";
import CandidatesSignup from "./pages/CandidatesSignup";
import Home from "./pages/Home";
import Terms from "./pages/Terms";
import RecruiterLogin from "./pages/RecruiterLogin";
import RecruiterSignup from "./pages/RecruiterSignup";
import Dashborad from "./pages/Dashborad";
import AddJobs from "./pages/AddJobs";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import AIInterview from "./pages/AIInterview";
import UserSettings from "./pages/UserSettings";
import CompanySettings from "./pages/CompanySettings";
import AIAssistant from "./pages/AIAssistant";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import { AppContext } from "./context/AppContext";

const App = () => {
  const { companyToken } = useContext(AppContext);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/all-jobs/:category" element={<AllJobs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
        <Route path="/ai-interview" element={<AIInterview />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />
        {/* <Route path="/feed" element={<Feed />} /> */}
        <Route path="/candidate-login" element={<CandidatesLogin />} />
        <Route path="/candidate-signup" element={<CandidatesSignup />} />
        <Route path="/recruiter-login" element={<RecruiterLogin />} />
        <Route path="/recruiter-signup" element={<RecruiterSignup />} />
        <Route path="/user-settings" element={<UserSettings />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/dashboard" element={<Dashborad />}>
          <Route path="add-job" element={<AddJobs />} />
          <Route path="manage-jobs" element={<ManageJobs />} />
          <Route path="view-applications" element={<ViewApplications />} />
          <Route path="settings" element={<CompanySettings />} />
        </Route>
      </Routes>
    </AppLayout>
  );
};

export default App;




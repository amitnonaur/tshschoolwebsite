import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Academics from "./pages/Academics";
import EnglishCommunication from "./pages/EnglishCommunication";
import ComputerEducation from "./pages/ComputerEducation";
import ExperientialLearning from "./pages/ExperientialLearning";
import Sports from "./pages/Sports";
import Assessment from "./pages/Assessment";
import ParentPartnership from "./pages/ParentPartnership";
import Admissions from "./pages/Admissions";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdmissionForm from "./pages/admin/AdmissionForm";
import StudentList from "./pages/admin/StudentList";
import StudentProfile from "./pages/admin/StudentProfile";
import PromoteBatch from "./pages/admin/PromoteBatch";
import TestResults from "./pages/admin/TestResults";
import FeeManager from "./pages/admin/FeeManager";
import AdminSettings from "./pages/admin/AdminSettings";
import { Materials, Videos, Announcements, FinanceTracker, OnlineExams, UserManagement } from "./pages/admin/Placeholders";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="admission" element={<AdmissionForm />} />
            <Route path="admission/:regId" element={<AdmissionForm />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/:regId" element={<StudentProfile />} />
            <Route path="promote" element={<PromoteBatch />} />
            <Route path="results" element={<TestResults />} />
            <Route path="exams" element={<OnlineExams />} />
            <Route path="materials" element={<Materials />} />
            <Route path="videos" element={<Videos />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="fees" element={<FeeManager />} />
            <Route path="finance" element={<FinanceTracker />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/english-communication" element={<EnglishCommunication />} />
            <Route path="/computer-education" element={<ComputerEducation />} />
            <Route path="/experiential-learning" element={<ExperientialLearning />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/parent-partnership" element={<ParentPartnership />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

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
import VideosAdmin from "./pages/admin/VideosAdmin";
import FinanceTracker from "./pages/admin/FinanceTracker";
import UserManagement from "./pages/admin/UserManagement";
import ExamsAdmin from "./pages/admin/ExamsAdmin";
import ExamDetail from "./pages/admin/ExamDetail";
import BulkImport from "./pages/admin/BulkImport";
import MaterialsAdmin from "./pages/admin/MaterialsAdmin";
import AnnouncementsAdmin from "./pages/admin/AnnouncementsAdmin";
import StudentExamLogin from "./pages/StudentExamLogin";
import { StudentExams, StudentTakeExam, StudentExamResult } from "./pages/StudentExam";
import VideosPage from "./pages/Videos";
import StudentResults from "./pages/StudentResults";
import FeeReceipt from "./pages/admin/FeeReceipt";
import AttendancePage from "./pages/admin/AttendancePage";
import AdmissionPrint from "./pages/admin/AdmissionPrint";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/exam-login" element={<StudentExamLogin />} />
          <Route path="/exam" element={<StudentExams />} />
          <Route path="/exam/:examId/take" element={<StudentTakeExam />} />
          <Route path="/exam/:examId/result" element={<StudentExamResult />} />
          <Route path="/results" element={<StudentResults />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="admission" element={<AdmissionForm />} />
            <Route path="admission/:regId" element={<AdmissionForm />} />
            <Route path="students" element={<StudentList />} />
            <Route path="students/:regId" element={<StudentProfile />} />
            <Route path="promote" element={<PromoteBatch />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="results" element={<TestResults />} />
            <Route path="admission-print/:regId" element={<AdmissionPrint />} />
            <Route path="exams" element={<ExamsAdmin />} />
            <Route path="exams/:examId" element={<ExamDetail />} />
            <Route path="import" element={<BulkImport />} />
            <Route path="materials" element={<MaterialsAdmin />} />
            <Route path="videos" element={<VideosAdmin />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="fees" element={<FeeManager />} />
            <Route path="receipt/:paymentId" element={<FeeReceipt />} />
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
            <Route path="/videos" element={<VideosPage />} />
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

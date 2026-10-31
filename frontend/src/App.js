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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
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

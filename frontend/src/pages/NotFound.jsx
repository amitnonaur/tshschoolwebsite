import { Link } from "react-router-dom";
import { Home, ArrowRight } from "lucide-react";
import SEO from "../components/SEO";
import { LogoMark } from "../components/Logo";

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center" data-testid="not-found-page">
    <SEO title="Page Not Found | The Study Home School" description="The page you are looking for could not be found." />
    <div className="container-site py-20 text-center">
      <div className="mx-auto w-fit"><LogoMark size={72} /></div>
      <p className="mt-8 text-7xl sm:text-8xl font-extrabold tracking-tight text-[#0756A5]" data-testid="not-found-code">404</p>
      <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-[#123D62]">This page seems to be absent today.</h1>
      <p className="mt-3 text-sm sm:text-base text-[#475569] max-w-md mx-auto leading-relaxed">
        The page you are looking for may have moved or never existed. Let's get you back to class.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
        <Link to="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0756A5] hover:bg-[#054485] text-white text-sm font-semibold px-7 py-3.5 transition-colors"
          data-testid="not-found-home-btn">
          <Home size={16} aria-hidden="true" /> Back to Home
        </Link>
        <Link to="/admissions"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#123D62] text-[#123D62] hover:bg-[#123D62] hover:text-white text-sm font-semibold px-7 py-3.5 transition-colors"
          data-testid="not-found-admissions-btn">
          Admissions <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;

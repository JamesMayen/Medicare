import { Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/layout/Navigation";
import Footer from "./components/layout/Footer";

// Import the pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import LandingPage from "./components/layout/LandingPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";


function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/doctor-dashboard', '/patient-dashboard', '/admin'];

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbarRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin') && <header role="banner"><Navbar /></header>}
      <main className="flex-grow" id="main-content" role="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/patient-dashboard" element={<PatientDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideNavbarRoutes.includes(location.pathname) && !location.pathname.startsWith('/admin') && <footer role="contentinfo"><Footer /></footer>}
    </div>
  );
}

export default App

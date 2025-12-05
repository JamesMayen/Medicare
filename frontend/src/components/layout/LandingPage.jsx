import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Navigation from "./Navigation";
import SearchFilters from "../sections/SearchFilter";
import MapSection from "../sections/MapSection";
import DoctorCard from "../sections/DoctorCard";
import Hero from "../sections/Hero";
import AIChat from "../sections/AIChat";
import { Button } from "../UI/button";
import { HeartPulse, Calendar, MessageCircle, Star } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const LandingPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/doctors`);
        if (response.ok) {
          const data = await response.json();
          // Shuffle and take first 8 doctors for random display
          const shuffled = data.sort(() => 0.5 - Math.random());
          setDoctors(shuffled.slice(0, 8));
        } else {
          console.error('Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleDoctorUpdate = (updatedDoctor) => {
        console.log('DEBUG: Received doctorProfileUpdated for doctor:', updatedDoctor._id, 'availabilities:', updatedDoctor.availabilities);
        setDoctors((prevDoctors) =>
          prevDoctors.map((doctor) =>
            doctor._id === updatedDoctor._id ? updatedDoctor : doctor
          )
        );
      };

      socket.on('doctorProfileUpdated', handleDoctorUpdate);

      return () => {
        socket.off('doctorProfileUpdated', handleDoctorUpdate);
      };
    }
  }, [socket]);
 

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      

      {/* ✅ Hero Section */}
      <Hero />

      {/* ✅ Search Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeInUp}
        viewport={{ once: true }}
        id="search"
        className="container mx-auto px-6 py-12"
      >
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-foreground">
          Search & Filter Your Desired Doctor
        </h2>
        <SearchFilters />
      </motion.section>

      {/* ✅ Featured Doctors */}
      <DoctorCard doctors={doctors} loading={loadingDoctors} />

      {/* ✅ Map section */}
      <MapSection />

      {/* ✅ AIChat Section */}
      <AIChat />

      {/* ✅ Footer */}
      
    </div>
  );
};

export default LandingPage;

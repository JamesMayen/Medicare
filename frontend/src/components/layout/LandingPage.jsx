import { motion } from "framer-motion";
import Navigation from "./Navigation";
import SearchFilters from "../sections/SearchFilter";
import MapSection from "../sections/MapSection";
import DoctorCard from "../sections/DoctorCard";
import Hero from "../sections/Hero";
import AIChat from "../sections/AIChat";
import { Button } from "../UI/button";
import { HeartPulse, Calendar, MessageCircle, Star } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const LandingPage = () => {
 

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
      <DoctorCard />

      {/* ✅ Map section */}
      <MapSection />

      {/* ✅ AIChat Section */}
      <AIChat />

      {/* ✅ Footer */}
      
    </div>
  );
};

export default LandingPage;

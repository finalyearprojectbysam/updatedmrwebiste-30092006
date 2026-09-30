import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Quote,
  Mail,
  Search
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FaLinkedin, FaInstagram } from "react-icons/fa6";

import sprint1 from "../assets/sprint1.jpg";
import sprint2 from "../assets/sprint2.jpg";
import sprint3 from "../assets/sprint3.jpg";
import sprint4 from "../assets/sprint4.jpg";
import sprint5 from "../assets/sprint5.jpg";
import Herosection from "./Herosection";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";
import img4 from "../assets/img4.png";
import img5 from "../assets/img5.png";
import img6 from "../assets/img6.png";



// Keep existing components unchanged
const BlueHighlight = ({ children }) => (
  <span className="relative inline-block px-2">
    <span className="relative z-10">{children}</span>
    <motion.span
      initial={{ width: 0 }}
      whileInView={{ width: "100%" }}
      transition={{ duration: 0.7 }}
      className="absolute left-0 bottom-2 h-[45%] bg-blue-500/25 -rotate-2 rounded-sm"
    />
  </span>
);

const PaintCard = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -bottom-3 -right-3 w-full h-full bg-blue-600 rotate-[-3deg] rounded-sm" />
    <div className="relative bg-white overflow-hidden shadow-2xl rounded-sm">
      {children}
    </div>
  </div>
);

const FloatingPaint = ({ className = "" }) => (
  <div className={`absolute bg-blue-600/10 blur-3xl rounded-full ${className}`} />
);


// Gallery remains the same
const galleryItems = [

  {
    title: "Pavithra Travels",
    category: "Travel Website",
    image: img1,
    link: "https://www.pavithra-travels.com/",
    desc: "Modern travel booking platform designed with smooth user experience, responsive layouts and premium brand presentation.",
  },

  {
    title: "NKS Website",
    category: "Business Website",
    image: img2,
    link: "https://nkswebsite.onrender.com/",
    desc: "Professional corporate website focused on business growth, clean UI structure and scalable digital presence.",
  },

  {
    title: "Elite Care",
    category: "Medical Website",
    image: img3,
    link: "https://elite-care.onrender.com",
    desc: "Healthcare website crafted with trust-focused visuals, clean medical UI and smooth patient-friendly experience.",
  },

  {
    title: "PowerPulse Gym",
    category: "Fitness Platform",
    image: img4,
    link: "https://powerpulse-gym.onrender.com",
    desc: "Bold fitness platform built with energetic visuals, modern layouts and high-conversion gym branding.",
  },

  {
    title: "Dessert Shop",
    category: "Bakery / Food",
    image: img5,
    link: "https://dessertshop.onrender.com/",
    desc: "Luxury dessert showcase website designed with aesthetic visuals, elegant branding and smooth browsing experience.",
  },

  {
    title: "Teamacy",
    category: "Digital Agency",
    image: img6,
    link: "https://www.teamacy.in/",
    desc: "Modern agency website focused on premium UI design, strong brand identity and clean business presentation.",
  },

];

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < 768
  );
  const [showPackage, setShowPackage] = useState(null);
  const carouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.offsetWidth * 0.7;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);
  return (
    <div className="bg-[#f8f8f4] text-slate-900 overflow-hidden font-sans">
      <Navbar />
      <main className="relative">
        <FloatingPaint className="w-[500px] h-[500px] top-[-120px] left-[-120px]" />
        <FloatingPaint className="w-[450px] h-[450px] right-[-100px] top-[500px]" />

         <Herosection/>

        {/* WHY CHOOSE - UNAFFECTED */}
        <section className="py-28 px-6 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-20 relative">
              <p className="uppercase tracking-[0.3em] text-sm text-blue-600 font-bold mb-5">Why Choose Us</p>
              <h2 className="text-5xl md:text-6xl font-black leading-tight">More Than Just <br /><BlueHighlight>Design</BlueHighlight></h2>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8">
              {["Premium UI Design", "Fast Communication", "Growth Strategy", "Creative Storytelling"].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -10 }} className="relative">
                  <div className="absolute -bottom-3 -right-3 bg-blue-600 w-full h-full rotate-[-2deg] rounded-sm" />
                  <div className="relative bg-[#f8f8f4] p-8 rounded-sm min-h-[240px] shadow-xl">
                    <h3 className="text-5xl font-black text-blue-100 mb-10">0{i + 1}</h3>
                    <h4 className="text-2xl font-bold mb-5">{item}</h4>
                    <p className="text-slate-500 leading-relaxed">We build premium digital experiences focused on quality and conversion.</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTFOLIO PREVIEW */}
<section
  id="portfolio"
  className="py-32 px-6 bg-[#f6f4ff] relative overflow-hidden"
>
  <div className="max-w-7xl mx-auto relative z-10">
    
    <div className="text-center mb-20 relative">
      <p className="uppercase tracking-[0.3em] text-sm text-blue-600 font-bold mb-5">
        Portfolio Preview
      </p>

      <h2 className="text-5xl md:text-7xl font-black leading-tight">
        Recent <BlueHighlight>Projects</BlueHighlight>
      </h2>
    </div>

    {/* CARD CAROUSEL WITH NAV ARROWS */}
    <div className="relative group/carousel">

      {/* LEFT ARROW */}
      <button
        onClick={() => scrollCarousel("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
      >
        <ChevronLeft size={22} className="text-slate-700" />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => scrollCarousel("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
      >
        <ChevronRight size={22} className="text-slate-700" />
      </button>

      {/* SCROLLABLE TRACK */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {galleryItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-center group"
          >
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative overflow-hidden rounded-xl"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[340px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* LIGHT GRADIENT OVERLAY — stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
              {/* PROJECT INFO — bottom-left */}
              <div className="absolute bottom-0 left-0 p-7 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                <p className="text-white/50 text-[11px] uppercase tracking-[0.25em] font-semibold mb-1.5">
                  {item.category}
                </p>
                <h3 className="text-white text-2xl font-black leading-tight mb-1.5">
                  {item.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2 max-w-[90%]">
                  {item.desc}
                </p>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
</section>

{/* TESTIMONIALS - CLEAN CARD STYLE */}
<section className="py-32 bg-white px-6">

  <div className="max-w-7xl mx-auto">

    {/* TITLE */}
    <div className="text-center mb-20">
      <h2 className="text-5xl md:text-6xl font-black leading-tight">
        Trusted By <span className="text-blue-600">Growing Brands</span>
      </h2>
    </div>

    {/* GRID */}
    <div className="grid lg:grid-cols-2 gap-10">

      {[
        {
          name: "Arun Kumar",
          role: "Startup Founder",
          review:
            "Marca Rise transformed our brand identity completely. The designs were modern and strategic.",
        },
        {
          name: "Priya S",
          role: "Business Owner",
          review:
            "Professional, creative, and easy to work with. Highly recommended for businesses.",
        },
      ].map((item, i) => (
        <motion.div
          key={i}
          whileHover={{ y: -6 }}
          className="
            bg-white border border-slate-200
            rounded-3xl p-10
            shadow-sm hover:shadow-xl
            transition-all duration-300
          "
        >

          {/* QUOTE ICON */}
          <div className="text-blue-600/20 mb-6">
            <Quote size={40} />
          </div>

          {/* REVIEW */}
          <p className="text-xl md:text-2xl text-slate-800 leading-relaxed mb-8">
            "{item.review}"
          </p>

          {/* STARS */}
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, idx) => (
              <Star key={idx} size={16} className="text-blue-600 fill-blue-600" />
            ))}
          </div>

          {/* USER INFO */}
          <div>
            <h4 className="font-black text-lg">{item.name}</h4>
            <p className="text-blue-600 text-xs uppercase tracking-widest font-bold mt-1">
              {item.role}
            </p>
          </div>

        </motion.div>
      ))}

    </div>
  </div>
</section>

{/* FOUNDERS SECTION - PREMIUM */}
<section className="py-20 sm:py-28 bg-white px-4 sm:px-6 relative overflow-hidden">

  {/* SOFT BG ACCENTS */}
  <div className="absolute top-20 left-[-120px] w-[420px] h-[420px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-10 right-[-140px] w-[460px] h-[460px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

  <div className="max-w-7xl mx-auto relative z-10">

    {/* HEADING */}
    <div className="text-center mb-14 sm:mb-20">
      <p className="text-blue-600 font-semibold tracking-[0.25em] uppercase mb-3 sm:mb-4 text-xs sm:text-sm">
        Leadership
      </p>

     <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-tight">
        Meet Our <span className="text-blue-600">Founders</span>
      </h2>

      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mt-6">
  The People You Work With
</h3>

      <p className="text-slate-500 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
        Two operators building Marca Rise — one focused on vision and brand,
        the other on systems and execution.
      </p>
    </div>

    {/* CARDS */}
    <div className="grid md:grid-cols-2 gap-8 relative">

      {[
        {
          num: "01",
          name: "SAM",
          role: "Co-Founder & CEO",
          bio: "Leads brand strategy and creative direction at Marca Rise. Building scalable creative systems for modern brands.",
          tags: ["Brand Strategy", "Creative Direction", "Growth"],
          tagLabel: "Vision",
        },
        {
          num: "02",
          name: "SANJAY",
          role: "Co-Founder & COO",
          bio: "Runs operations, delivery and client execution. Focused on systems, workflow and the unglamorous side of growth.",
          tags: ["Operations", "Delivery", "Systems"],
          tagLabel: "Operations",
        },
      ].map((founder) => (
        <motion.div
          key={founder.num}
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="group relative"
        >
          {/* GRADIENT GLOW BORDER */}
          <div className="absolute -inset-px bg-gradient-to-br from-blue-500/40 via-blue-400/0 to-cyan-400/40 rounded-[34px] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500 pointer-events-none" />

          <div className="relative bg-white border border-slate-200 group-hover:border-blue-200 rounded-[24px] sm:rounded-[32px] p-7 sm:p-10 transition-all duration-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)] group-hover:shadow-[0_30px_80px_rgba(124,12,231,0.18)] overflow-hidden">

            {/* TOP ROW */}
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <span className="text-5xl sm:text-6xl font-black text-slate-200 group-hover:text-blue-100 transition-all duration-500">
                {founder.num}
              </span>

              <span className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                {founder.tagLabel}
              </span>
            </div>

            {/* AVATAR + NAME */}
            <div className="flex items-center gap-4 sm:gap-5 mb-5 sm:mb-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500/25 blur-md rounded-2xl" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg shadow-blue-200">
                  {founder.name.charAt(0)}
                </div>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                  {founder.name}
                </h3>
                <p className="text-blue-600 font-semibold text-sm sm:text-base mt-1">
                  {founder.role}
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-base sm:text-lg mb-6 sm:mb-7">
              {founder.bio}
            </p>

            {/* TAG CHIPS */}
            <div className="flex flex-wrap gap-2 mb-7">
              {founder.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-600 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-700 transition-colors duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* SOCIALS */}
            <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
               <a
    href={
      founder.name === "SAM"
        ? "https://www.linkedin.com/in/princesamuel69/"
        : "https://www.linkedin.com/in/sanjay-sid/"
    }
    target="_blank"
    rel="noopener noreferrer"
    className="
      inline-flex
      items-center
      gap-2
      text-slate-800
      font-black
      tracking-wide
      text-sm
      hover:text-blue-600
      transition-all
      duration-300
      group
    "
  >

    View LinkedIn

    <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
      ↗
    </span>

  </a>
            </div>
          </div>
        </motion.div>
      ))}

    </div>
  </div>
</section>

{/* =========================
   PACKAGES SECTION
========================= */}
<section className="py-28 px-6 bg-[#f8f8f4] relative overflow-hidden">
  <div className="max-w-7xl mx-auto relative z-10">

    {/* HEADING */}
    <div className="text-center mb-16">
      <p className="uppercase tracking-[0.3em] text-sm text-blue-600 font-bold mb-5">
        Pricing
      </p>
      <h2 className="text-5xl md:text-6xl font-black leading-tight">
        Choose Your <span className="text-blue-600">Package</span>
      </h2>
      <p className="text-slate-500 text-lg mt-5 max-w-xl mx-auto">
        Simple, transparent pricing for every stage of your digital journey.
      </p>
    </div>

    {/* PACKAGE CARDS */}
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">

      {/* ---- BASIC ---- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="relative group"
      >
        <div className="relative bg-white border border-slate-200 rounded-[22px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
          <div className="p-7 sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 mb-3">Package</p>
            <h3 className="text-2xl font-black text-slate-900 mb-1">BASIC</h3>
            <p className="text-slate-400 text-sm mb-6">For businesses starting their digital presence.</p>
            <div className="flex items-baseline gap-2 mb-7">
              <span className="text-4xl font-black text-slate-900">₹1,999</span>
            </div>
            <div className="h-px bg-slate-100 mb-6" />
            <ul className="space-y-2.5 mb-8">
              {[
                "Social Media Setup",
                "WhatsApp Business Setup",
                "Google Business Profile",
                "Basic Digital Brand Setup",
                "Basic Lead Capture",
                "Google Review Setup",
                "Digital Growth Consultation",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                  <span className="text-sm text-slate-600">{f}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/919344532087?text=Hi%20Marca%20Rise%2C%20I%27m%20interested%20in%20the%20Basic%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-sm"
            >
              Get Started <ArrowRight size={16} />
            </a>
            <button
              onClick={() => setShowPackage(0)}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm py-2 transition-colors duration-200 cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---- STANDARD (HIGHLIGHTED) ---- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative group md:-mt-4"
      >
        {/* RECOMMENDED BADGE */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-white bg-blue-600 px-4 py-1.5 rounded-full shadow-lg shadow-blue-600/30">
            ★ Recommended
          </span>
        </div>
        <div className="relative bg-white border-2 border-blue-600 rounded-[22px] overflow-hidden shadow-[0_8px_30px_rgba(37,99,235,0.12)] hover:shadow-[0_16px_50px_rgba(37,99,235,0.18)] transition-all duration-500">
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="p-7 sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-blue-600 mb-3">Package</p>
            <h3 className="text-2xl font-black text-slate-900 mb-1">STANDARD</h3>
            <p className="text-slate-400 text-sm mb-6">For businesses ready to grow online.</p>
            <div className="flex items-baseline gap-2 mb-7">
              <span className="text-4xl font-black text-slate-900">₹4,999</span>
            </div>
            <div className="h-px bg-slate-100 mb-6" />
            <ul className="space-y-2.5 mb-8">
              {[
                { text: "Everything in Basic", bold: true },
                { text: "Professional Business Website" },
                { text: "Up to 5 standard pages" },
                { text: "Basic Local SEO" },
                { text: "Google Analytics & Search Console" },
                { text: "Lead Funnel Setup" },
                { text: "Professional Email Guidance" },
                { text: "30-Day Digital Roadmap" },
                { text: "1-Year Hosting Included", accent: true },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${f.bold ? "bg-blue-600" : f.accent ? "bg-green-500" : "bg-blue-400"}`} />
                  <span className={`text-sm ${f.bold ? "font-bold text-slate-900" : f.accent ? "font-semibold text-green-600" : "text-slate-600"}`}>{f.text}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/919344532087?text=Hi%20Marca%20Rise%2C%20I%27m%20interested%20in%20the%20Standard%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 text-sm"
            >
              Get Started <ArrowRight size={16} />
            </a>
            <button
              onClick={() => setShowPackage(1)}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm py-2 transition-colors duration-200 cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>

      {/* ---- PREMIUM ---- */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative group"
      >
        <div className="relative bg-white border border-slate-200 rounded-[22px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-500">
          <div className="h-1 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400" />
          <div className="p-7 sm:p-8">
            <div className="flex items-center gap-2 mb-3">
              <p className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400">Package</p>
              <span className="text-[9px] uppercase tracking-wider font-bold text-white bg-slate-900 px-2 py-0.5 rounded-full">Premium</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1">PREMIUM</h3>
            <p className="text-slate-400 text-sm mb-5">Digital Business Launch — complete setup.</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-slate-400 text-base line-through font-semibold">₹14,999</span>
              <span className="text-4xl font-black text-slate-900">₹9,999</span>
            </div>
            <span className="inline-block text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full mb-6">
              Launch Offer
            </span>
            <div className="h-px bg-slate-100 mb-6" />
            <ul className="space-y-2.5 mb-8">
              {[
                { text: "Everything in Standard", bold: true },
                { text: "Meta Business & Ad Account Setup" },
                { text: "Meta Ads Foundation" },
                { text: "Basic WhatsApp Automation" },
                { text: "Advanced Lead Capture System" },
                { text: "Complete Digital Platform Setup" },
                { text: "Digital Growth Consultation" },
                { text: "1-Year Hosting Included", accent: true },
              ].map((f) => (
                <li key={f.text} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${f.bold ? "bg-slate-900" : f.accent ? "bg-green-500" : "bg-slate-400"}`} />
                  <span className={`text-sm ${f.bold ? "font-bold text-slate-900" : f.accent ? "font-semibold text-green-600" : "text-slate-600"}`}>{f.text}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/919344532087?text=Hi%20Marca%20Rise%2C%20I%27m%20interested%20in%20the%20Premium%20package."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all duration-300 text-sm"
            >
              Get Started <ArrowRight size={16} />
            </a>
            <button
              onClick={() => setShowPackage(2)}
              className="w-full mt-3 inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm py-2 transition-colors duration-200 cursor-pointer"
            >
              View Details
            </button>
          </div>
        </div>
      </motion.div>

    </div>
  </div>
</section>

{/* =========================
   PACKAGE DETAIL MODAL
========================= */}
<AnimatePresence>
  {showPackage !== null && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[999] flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={() => setShowPackage(null)}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative bg-white rounded-[24px] w-full max-w-3xl shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="sticky top-0 bg-white rounded-t-[24px] border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {["Basic", "Standard", "Premium"][showPackage]} Package
            </h3>
            <p className="text-slate-500 text-sm mt-1">Full package details</p>
          </div>
          <button
            onClick={() => setShowPackage(null)}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors duration-200 cursor-pointer text-xl font-light"
          >
            ×
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="px-8 py-8 space-y-8">

          {/* PRICE BLOCK */}
          {showPackage === 0 && (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900">₹1,999</span>
            </div>
          )}
          {showPackage === 1 && (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-slate-900">₹4,999</span>
            </div>
          )}
          {showPackage === 2 && (
            <div className="flex items-baseline gap-3">
              <span className="text-slate-400 text-lg line-through font-semibold">₹14,999</span>
              <span className="text-4xl font-black text-slate-900">₹9,999</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full">Launch Offer</span>
            </div>
          )}

          {/* WHAT'S INCLUDED */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] font-black text-slate-900 mb-5">What's Included</h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {(showPackage === 0 ? [
                { title: "Social Media Setup", desc: "Instagram & Facebook profile setup" },
                { title: "WhatsApp Business Setup", desc: "Business account & basic auto-reply" },
                { title: "Google Business Profile", desc: "Local listing with maps & contact" },
                { title: "Basic Digital Brand Setup", desc: "Logo, colors & brand basics" },
                { title: "Basic Lead Capture", desc: "Simple enquiry form setup" },
                { title: "Google Review Setup", desc: "Review link & strategy" },
                { title: "Digital Growth Consultation", desc: "1-on-1 strategy call" },
              ] : showPackage === 1 ? [
                { title: "Everything in Basic", desc: "All Basic package features included" },
                { title: "Professional Business Website", desc: "Responsive, modern website" },
                { title: "Up to 5 Standard Pages", desc: "Home, About, Services, Contact, etc." },
                { title: "Basic Local SEO", desc: "Keyword & search optimization" },
                { title: "Google Analytics & Search Console", desc: "Traffic & performance tracking" },
                { title: "Lead Funnel Setup", desc: "Enquiry capture funnel" },
                { title: "Professional Email Guidance", desc: "Email setup instructions & tips" },
                { title: "30-Day Digital Roadmap", desc: "Step-by-step growth plan" },
                { title: "1-Year Hosting Included", desc: "Free hosting for the first year" },
              ] : [
                { title: "Everything in Standard", desc: "All Standard package features included" },
                { title: "Meta Business & Ad Account Setup", desc: "Business manager & ad account ready" },
                { title: "Meta Ads Foundation", desc: "Pixel, events & campaign structure" },
                { title: "Basic WhatsApp Automation", desc: "Welcome message & follow-up flows" },
                { title: "Advanced Lead Capture System", desc: "Multi-step forms & CRM routing" },
                { title: "Complete Digital Platform Setup", desc: "Full online presence across platforms" },
                { title: "Digital Growth Consultation", desc: "1-on-1 strategy & growth call" },
                { title: "1-Year Hosting Included", desc: "Free hosting for the first year" },
              ]).map((item) => (
                <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TERMS */}
          <div>
            <h4 className="text-sm uppercase tracking-[0.2em] font-black text-slate-900 mb-4">Terms & Notes</h4>
            <ul className="space-y-2 text-sm text-slate-500 leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Hosting free for 1 year, ₹1,999/year renewal after that.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Domain charges separate if not already owned.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Content (text, images) to be provided by the client.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Delivery within 7–10 business days after content receipt.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Revisions included: up to 2 rounds per deliverable.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Ad spend not included — paid directly to Meta/Google.</li>
              <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5">•</span> Full ownership transferred upon final payment.</li>
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <a
              href={`https://wa.me/919344532087?text=${encodeURIComponent("Hi Marca Rise, I'm interested in the " + ["Basic", "Standard", "Premium"][showPackage] + " package.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25"
            >
              Get Started on WhatsApp
              <ArrowRight size={18} />
            </a>
            <button
              onClick={() => setShowPackage(null)}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-8 py-4 rounded-xl transition-all duration-300 cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* FAQ SECTION */}
<section className="py-32 px-6 bg-[#f6f4ff]">

  <div className="max-w-5xl mx-auto">

    {/* HEADING */}
    <div className="text-center mb-20">

      <h2 className="text-5xl md:text-6xl font-black">
        Frequently Asked
        <span className="text-blue-600">
          {" "}Questions
        </span>
      </h2>

    </div>

    {/* FAQ ITEMS */}
    <div className="space-y-6">

      {[
        {
          q: "How long does a website project take?",
          a: "Most marketing websites ship in 2–4 weeks. Landing pages can go live in under 10 days depending on content readiness.",
        },

        {
          q: "Do you redesign existing websites?",
          a: "Yes. We audit, restructure and rebuild outdated sites into fast, modern experiences without losing your traffic or SEO equity.",
        },

        {
          q: "Do you edit short-form reels and TikToks?",
          a: "Yes. Hook-first edits, captions, motion and music — built for Reels, Shorts and TikTok. Typical turnaround is 48–72 hours per edit.",
        },

        {
          q: "Can you manage our social media end-to-end?",
          a: "Yes. Monthly calendars, reels, carousels, captions and community management — run by humans with your brand voice.",
        },

        {
          q: "Do you help founders with personal branding?",
          a: "Absolutely. We build founder content systems — positioning, talking points, short-form video and a consistent posting rhythm.",
        },

        {
          q: "Can you produce video content for businesses?",
          a: "Yes. We script, shoot and edit short-form video for product launches, founder content and ad creatives.",
        },

        {
          q: "Do you offer monthly content plans?",
          a: "Yes. Most clients work with us on monthly retainers — content strategy, calendar, production and reporting bundled together.",
        },

        {
          q: "How fast do you deliver edited videos?",
          a: "Standard short-form is delivered in 48–72 hours. Bigger productions and campaign videos get a clear timeline before kickoff.",
        },

      ].map((item, i) => {

        const isOpen = selected === i;

        return (

          <motion.div
            key={i}
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.18 }}
            className="
              bg-white
              rounded-[28px]
              border
              border-slate-100
              shadow-lg
              overflow-hidden
            "
          >

            {/* QUESTION */}
            <button
              onClick={() =>
                setSelected(isOpen ? null : i)
              }
              className="
                w-full
                flex
                items-center
                justify-between
                gap-5
                p-8
                text-left
              "
            >

              <h3 className="text-xl md:text-2xl font-black">
                {item.q}
              </h3>

              <motion.span
                animate={{
                  rotate: isOpen ? 45 : 0,
                }}
                transition={{
                  duration: 0.18,
                }}
                className="
                  text-blue-600
                  text-4xl
                  font-light
                  shrink-0
                "
              >
                +
              </motion.span>

            </button>

            {/* ANSWER */}
            <AnimatePresence>

              {isOpen && (

                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.22,
                  }}
                  className="overflow-hidden"
                >

                  <div className="px-8 pb-8">

                    <p className="text-slate-500 leading-relaxed text-lg">
                      {item.a}
                    </p>

                  </div>

                </motion.div>

              )}

            </AnimatePresence>

          </motion.div>

        );

      })}

    </div>

  </div>

</section>
      </main>

      <Footer />
    </div>
  );
}
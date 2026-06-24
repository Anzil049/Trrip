import { ArrowRight, CalendarDays, Menu, PlaneTakeoff, ShieldCheck, Users2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatedMarqueeHero } from "../components/ui/hero-3";
import { TopBar } from "../components/TopBar";
import { useAuth } from "../state/AuthContext";
import { api } from "../utils/api";
import logo from "../images/logo.png";

const destinations = [
  {
    templateId: "delhi",
    city: "Delhi, India",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: arrive and settle in", "Day 2: monuments and markets", "Day 3: old and new Delhi", "Day 4: buffer and depart"],
  },
  {
    templateId: "jaipur",
    city: "Jaipur, India",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: heritage arrival", "Day 2: forts and palaces", "Day 3: bazaars and cafes"],
  },
  {
    templateId: "goa",
    city: "Goa, India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: beach arrival", "Day 2: coastal highlights", "Day 3: relaxed food and sunset"],
  },
  {
    templateId: "kerala",
    city: "Kerala, India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: arrival and backwaters", "Day 2: houseboat or hill station", "Day 3: spices and slow travel"],
  },
  {
    templateId: "udaipur",
    city: "Udaipur, India",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: lake arrival", "Day 2: palaces and views", "Day 3: old city wandering"],
  },
  {
    templateId: "varanasi",
    city: "Varanasi, India",
    image: "https://images.unsplash.com/photo-1592639296346-560c37a0f711?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: ghat-side arrival", "Day 2: sunrise and river life", "Day 3: heritage lanes and temples"],
  },
  {
    templateId: "leh",
    city: "Leh-Ladakh, India",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: acclimatize and rest", "Day 2: local monasteries", "Day 3: mountain road day"],
  },
  {
    templateId: "mumbai",
    city: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=900&q=80",
    preview: ["Day 1: arrival and rest", "Day 2: landmarks and viewpoints", "Day 3: food and neighborhoods", "Day 4: departure buffer"],
  },
];

const stats = [
  { value: "50,000+", label: "Itineraries created" },
  { value: "4.9/5", label: "Traveler rating" },
  { value: "1,200+", label: "Saved trip plans" },
  { value: "50+", label: "Destinations" },
];



const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [creatingTemplateId, setCreatingTemplateId] = useState("");
  
  useEffect(() => {
    if (location.hash === "#builder") {
      setTimeout(() => {
        document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);
  
  // New Complex Form State
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(4);
  const [travelers, setTravelers] = useState("couple");
  const [budget, setBudget] = useState("mid-range");
  const [interests, setInterests] = useState([]);
  const [transport, setTransport] = useState("flight");
  const [accommodation, setAccommodation] = useState("hotel");
  const [foodPreference, setFoodPreference] = useState("no restrictions");
  const [travelPace, setTravelPace] = useState("balanced");
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("itineraryForm");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.startDate) setStartDate(parsed.startDate);
        if (parsed.days) setDays(parsed.days);
        if (parsed.travelers) setTravelers(parsed.travelers);
        if (parsed.budget) setBudget(parsed.budget);
        if (parsed.interests) setInterests(parsed.interests);
        if (parsed.transport) setTransport(parsed.transport);
        if (parsed.accommodation) setAccommodation(parsed.accommodation);
        if (parsed.foodPreference) setFoodPreference(parsed.foodPreference);
        if (parsed.travelPace) setTravelPace(parsed.travelPace);
        if (parsed.notes) setNotes(parsed.notes);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("itineraryForm", JSON.stringify({
      destination, startDate, days, travelers, budget, interests, transport, accommodation, foodPreference, travelPace, notes
    }));
  }, [destination, startDate, days, travelers, budget, interests, transport, accommodation, foodPreference, travelPace, notes]);

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    if (!user) {
      toast.error("Please login first to use auto-fill from documents.");
      navigate("/login", { state: { from: "/" } });
      return;
    }
    
    setFile(selectedFile);
    setExtracting(true);
    setExtractionProgress(10);
    
    const progressInterval = setInterval(() => {
      setExtractionProgress(prev => (prev < 90 ? prev + Math.floor(Math.random() * 10) : prev));
    }, 600);
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      const extractPromise = api.upload("/uploads/extract", formData);
      toast.promise(extractPromise, {
        loading: 'Extracting details from your document...',
        success: 'Auto-filled details from your document!',
        error: (err) => err.message || 'Failed to extract details',
      });
      
      const res = await extractPromise;
      clearInterval(progressInterval);
      setExtractionProgress(100);
      
      if (res.extractedData) {
         if (res.extractedData.destination) setDestination(res.extractedData.destination);
         if (res.extractedData.startDate) setStartDate(res.extractedData.startDate);
         if (res.extractedData.budget) setBudget(res.extractedData.budget);
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
    } finally {
      setTimeout(() => {
        setExtracting(false);
        setExtractionProgress(0);
      }, 800);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const toggleInterest = (interest) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first to generate an itinerary.");
      navigate("/login", { state: { from: "/" } });
      return;
    }
    
    setGenerating(true);

    try {
      // Validate destination
      const locRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`);
      if (locRes.ok) {
        const data = await locRes.json();
        if (!data || data.length === 0) {
          toast.error(`"${destination}" doesn't seem to be a recognized location. Please specify a valid city or place.`);
          setGenerating(false);
          return;
        }
      }
    } catch (e) {
      // If validation API fails, let it through so we don't permanently block the user
    }
    
    try {
      const payload = {
        destination, startDate, days, travelers, budget, interests, transport, accommodation, foodPreference, travelPace, notes
      };
      
      const generatePromise = api.post("/itineraries/generate", payload);
      
      toast.promise(generatePromise, {
        loading: 'Crafting your personalized itinerary (this may take up to 30s)...',
        success: 'Itinerary generated successfully!',
        error: (err) => err.message || 'Failed to generate itinerary',
      });
      
      const res = await generatePromise;
      localStorage.removeItem("itineraryForm");
      navigate(`/itineraries/${res.itinerary._id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const createItinerary = async (templateId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setCreatingTemplateId(templateId);
      const data = await api.post("/itineraries/templates", { templateId });
      navigate(`/itineraries/${data.itinerary._id}`);
    } catch (error) {
      navigate("/upload");
    } finally {
      setCreatingTemplateId("");
    }
  };

  return (
    <div style={{ paddingBottom: "48px" }}>
      <section className="flight-home" style={{ position: 'relative' }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 }}>
          <TopBar user={user} onLogout={logout} />
        </div>

        <AnimatedMarqueeHero
          tagline="Plan once, travel better."
          title={
            <>
              Build a trip plan
              <br />
              that feels effortless.
            </>
          }
          description="Upload travel details, organize every stop, and generate a clear itinerary for the entire journey. Clean itineraries for solo trips, getaways, and business travel."
          ctaText={user ? "Open Dashboard" : "Create Itinerary"}
          images={DEMO_IMAGES}
          onCtaClick={() => {
            if (user) {
              navigate("/dashboard");
            } else {
              document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      </section>

      <div className="container" id="builder" style={{ maxWidth: "1200px" }}>
        <section className="search-section card flex flex-col lg:flex-row gap-8 items-center" style={{ padding: 32, margin: "0 auto" }}>
          <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="search-header" style={{ marginBottom: 32 }}>
            <div>
              <div className="eyebrow">Itinerary builder</div>
              <h2 className="search-title">
                Organize your travel plan,
                <br />
                one day at a time.
              </h2>
            </div>
          </div>

          <form onSubmit={handleGenerateSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="booking-field">
                <label>Destination</label>
                <input className="booking-input" style={{width: '100%'}} placeholder="Where are you going?" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>
              <div className="booking-field">
                <label>Start date</label>
                <div className="booking-input iconized" style={{padding: '0 12px'}}>
                  <CalendarDays size={16} />
                  <input type="date" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'inherit'}} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div className="booking-field small">
                <label>Days</label>
                <div className="booking-input iconized" style={{padding: '0 12px'}}>
                  <Users2 size={16} />
                  <input type="number" min="1" max="60" style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'inherit'}} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                </div>
              </div>
              <div className="booking-field small">
                <label>Travelers</label>
                <select className="booking-input" style={{width: '100%'}} value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends Group</option>
                </select>
              </div>
              <div className="booking-field small">
                <label>Budget</label>
                <select className="booking-input" style={{width: '100%'}} value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="budget">Budget</option>
                  <option value="mid-range">Mid-range</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div className="booking-field small">
                <label>Transport Preference</label>
                <select className="booking-input" style={{width: '100%'}} value={transport} onChange={(e) => setTransport(e.target.value)}>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                  <option value="self-drive">Self-drive</option>
                  <option value="rental">Rental vehicle</option>
                </select>
              </div>
              <div className="booking-field small">
                <label>Accommodation</label>
                <select className="booking-input" style={{width: '100%'}} value={accommodation} onChange={(e) => setAccommodation(e.target.value)}>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                  <option value="hostel">Hostel</option>
                  <option value="airbnb">Airbnb / Homestay</option>
                  <option value="tent">Tent / Camping</option>
                </select>
              </div>
              <div className="booking-field small">
                <label>Food Preference</label>
                <select className="booking-input" style={{width: '100%'}} value={foodPreference} onChange={(e) => setFoodPreference(e.target.value)}>
                  <option value="no restrictions">No restrictions</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non-vegetarian">Non-vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                </select>
              </div>
            </div>

            <div className="booking-field">
              <label>Travel Interests</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {["Beaches", "Adventure", "Nature", "Historical", "Shopping", "Food", "Nightlife", "Religious", "Photography"].map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 20,
                      border: `1px solid ${interests.includes(interest) ? "#2563eb" : "#e2e8f0"}`,
                      background: interests.includes(interest) ? "#eff6ff" : "white",
                      color: interests.includes(interest) ? "#1d4ed8" : "#64748b",
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-field">
              <label>Travel Pace</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 8 }}>
                {["Relaxed", "Balanced", "Packed"].map((pace) => (
                  <button
                    key={pace}
                    type="button"
                    onClick={() => setTravelPace(pace.toLowerCase())}
                    style={{
                      padding: "10px",
                      borderRadius: 8,
                      border: `1px solid ${travelPace === pace.toLowerCase() ? "#2563eb" : "#e2e8f0"}`,
                      background: travelPace === pace.toLowerCase() ? "#eff6ff" : "white",
                      color: travelPace === pace.toLowerCase() ? "#1d4ed8" : "#64748b",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {pace}
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-field">
              <label htmlFor="notes">Special Requirements / Notes</label>
              <textarea id="notes" className="booking-input" style={{width: '100%', minHeight: 80, paddingTop: 12}} placeholder="e.g. Honeymoon trip, wheelchair accessible, kids friendly..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: "14px", fontSize: 16 }} disabled={generating || extracting}>
              {generating ? "Generating Itinerary..." : "Generate Itinerary"}
            </button>
          </form>
          </div>

        <div className="w-full lg:w-[350px] shrink-0">
          <div 
            style={{ 
              height: "auto",
              minHeight: "300px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: isDragging ? "3px dashed #2563eb" : "3px dashed #cbd5e1", 
              backgroundColor: isDragging ? "#eff6ff" : "#f8fafc",
              borderRadius: "24px", 
              padding: "32px", 
              textAlign: "center",
              transition: "all 0.2s"
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%", height: "100%", justifyContent: "center" }}>
              <div style={{ padding: "24px", background: isDragging ? "#dbeafe" : "#e2e8f0", borderRadius: "50%", transition: "all 0.2s" }}>
                <PlaneTakeoff size={48} color={isDragging ? "#2563eb" : "#64748b"} />
              </div>
              <div>
                <h3 style={{ color: isDragging ? "#1e40af" : "#334155", fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px", lineHeight: 1.2 }}>
                  {extracting ? `Extracting Details... ${extractionProgress}%` : "Auto-fill with your Booking"}
                </h3>
                <p style={{ color: "#64748b", fontSize: "1.05rem", margin: 0, lineHeight: 1.5 }}>
                  Drop your flight or hotel ticket here, and we'll automatically fill out the form for you.
                </p>
              </div>
              <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} style={{ display: "none" }} />
            </label>
          </div>
        </div>
        </section>
      </div>

      <section className="destinations-section container" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div className="destination-grid">
          {destinations.map((item) => (
            <article
              className="destination-card"
              key={item.city}
              onClick={() => {
                setDestination(item.city);
                document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDestination(item.city);
                  document.getElementById("builder")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              role="button"
              tabIndex={0}
            >
              <img src={item.image} alt={item.city} />
              <div className="destination-pill">
                <PlaneTakeoff size={12} />
                Trip
              </div>
              <div className="destination-overlay">
                <div className="destination-rating">★★★★★</div>
                <h3>{item.city}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-divider" />
        <div className="stats-row">
          {stats.map((item) => (
            <div className="stats-item" key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

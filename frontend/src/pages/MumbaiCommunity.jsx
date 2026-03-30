import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const sessions = [
  { name: "Morning Vinyasa Flow",    type: "Yoga · ZenYoga Studio",  time: "7:00 AM · 45 min", status: "live"     },
  { name: "HIIT Blast",              type: "Fitness · FitZone Gym",  time: "8:30 AM · 30 min", status: "upcoming" },
  { name: "Meditation & Breathwork", type: "Wellness · SoulSpace",   time: "9:00 AM · 60 min", status: "upcoming" },
  { name: "Outdoor Bootcamp",        type: "Fitness · Joggers Park", time: "6:00 PM · 50 min", status: "upcoming" },
  { name: "Evening Yin Yoga",        type: "Yoga · ZenYoga Studio",  time: "7:30 PM · 60 min", status: "upcoming" },
];

const events = [
  {
    name: "Mumbai Marathon Training",
    emoji: "🏃",
    desc: "Join our community training group for the upcoming Mumbai Marathon. All fitness levels welcome!",
    date: "Sat, Apr 5 · 6:00 AM",
    location: "Marine Drive",
    attendees: "127 going",
    lat: 18.9676,
    lng: 72.8194,
  },
  {
    name: "Yoga in the Park",
    emoji: "🧘",
    desc: "Outdoor yoga session with sunrise views. Bring your own mat and water bottle.",
    date: "Sun, Apr 6 · 7:00 AM",
    location: "Shivaji Park",
    attendees: "89 going",
    lat: 19.0176,
    lng: 72.8479,
  },
  {
    name: "Fitness Bootcamp Challenge",
    emoji: "💪",
    desc: "High-intensity group workout with prizes for top performers. Team challenges included!",
    date: "Wed, Apr 9 · 6:30 PM",
    location: "Oval Maidan",
    attendees: "156 going",
    lat: 18.9273,
    lng: 72.8344,
  },
  {
    name: "Meditation & Mindfulness Workshop",
    emoji: "🕯️",
    desc: "Learn breathing techniques and mindfulness practices from certified instructors.",
    date: "Fri, Apr 11 · 7:00 PM",
    location: "SoulSpace Wellness",
    attendees: "43 going",
    lat: 19.0596,
    lng: 72.8295,
  },
  {
    name: "Community Sports Day",
    emoji: "⚽",
    desc: "Cricket, football, badminton and more! Fun games and healthy competition for all ages.",
    date: "Sat, Apr 12 · 4:00 PM",
    location: "Azad Maidan",
    attendees: "203 going",
    lat: 18.9273,
    lng: 72.8344,
  },
];

const createCustomIcon = (emoji) =>
  L.divIcon({
    html: `<div style="
      background:#ea6e1e;border:3px solid #fff;border-radius:50%;
      width:40px;height:40px;display:flex;align-items:center;
      justify-content:center;font-size:20px;
      box-shadow:0 2px 8px rgba(234,110,30,0.4);">${emoji}</div>`,
    iconSize: [40, 40],
    className: "custom-marker",
  });

export default function MumbaiCommunity() {
  const [activeTab, setActiveTab] = useState("Sessions");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (activeTab === "Events" && mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([19.076, 72.8777], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      mapInstanceRef.current = map;

      events.forEach((event) => {
        const marker = L.marker([event.lat, event.lng], {
          icon: createCustomIcon(event.emoji),
        }).addTo(map);
        marker.bindPopup(`
          <div style="padding:8px;font-family:sans-serif;">
            <div style="font-weight:700;font-size:13px;color:#2a1f14;margin-bottom:4px;">${event.name}</div>
            <div style="font-size:11px;color:#8a7060;margin-bottom:6px;">📍 ${event.location}</div>
            <div style="font-size:10px;color:#ea6e1e;font-weight:600;">${event.attendees}</div>
          </div>`);
        markersRef.current.push(marker);
      });
    }
    return () => {
      if (mapInstanceRef.current && activeTab !== "Events") {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [activeTab]);

  const tabs = [
    { label: "Sessions", emoji: "🧘" },
    { label: "Events",   emoji: "🎯" },
  ];

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen w-full pb-14 overflow-x-hidden" style={{ background: "#f5efe6", fontFamily: "'DM Sans', sans-serif", color: "#2a1f14" }}>

        {/* ── HERO ── */}
        <div
          className="relative overflow-hidden rounded-b-[36px] px-8 pt-10 pb-10 mb-7"
          style={{ background: "#2a1f14" }}
        >
          {/* decorative blobs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(234,110,30,.25) 0%,transparent 70%)" }} />
          <div className="absolute -bottom-24 -left-16 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle,rgba(234,110,30,.10) 0%,transparent 70%)" }} />

          {/* Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest"
            style={{ background: "rgba(234,110,30,.15)", border: "1px solid rgba(234,110,30,.35)", color: "#f07030" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#f07030" }} />
            Mumbai Community
          </div>

          <h2 className="relative z-10 font-extrabold leading-[1.05] mb-4"
            style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(38px,5.5vw,56px)", color: "#f5efe6" }}>
            Move Together,<br />Grow Together
          </h2>

          <p className="relative z-10 text-sm leading-relaxed max-w-lg mb-8" style={{ color: "#a08870" }}>
            Join live sessions and attend exciting community events happening around you.
          </p>

          {/* Stats */}
          <div className="relative z-10 flex flex-wrap gap-3.5">
            <div className="flex-1 min-w-[110px] px-4 py-3.5 rounded-2xl"
              style={{ background: "rgba(234,110,30,.12)", border: "1px solid rgba(234,110,30,.22)" }}>
              <div className="text-[30px] font-bold leading-none mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#f5efe6" }}>1,240</div>
              <div className="text-xs" style={{ color: "#7a6050" }}>Active members</div>
            </div>
            <div className="flex-1 min-w-[110px] py-3.5">
              <div className="text-[30px] font-bold leading-none mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#f5efe6" }}>38</div>
              <div className="text-xs" style={{ color: "#7a6050" }}>Sessions today</div>
            </div>
            <div className="flex-1 min-w-[110px] py-3.5">
              <div className="text-[30px] font-bold leading-none mb-1" style={{ fontFamily: "'Syne',sans-serif", color: "#f5efe6" }}>5</div>
              <div className="text-xs" style={{ color: "#7a6050" }}>Events this week</div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-3 px-6 mb-6">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(t.label)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${activeTab === t.label
                  ? "text-white font-semibold"
                  : "hover:text-[#2a1f14]"
                }`}
              style={
                activeTab === t.label
                  ? { background: "#ea6e1e", border: "1.5px solid #ea6e1e", boxShadow: "0 6px 20px rgba(234,110,30,.32)", color: "#fff" }
                  : { background: "#ede4d8", border: "1.5px solid #d9cfc2", color: "#8a7060" }
              }
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ── SESSIONS ── */}
        {activeTab === "Sessions" && (
          <div className="mx-6 rounded-[28px] overflow-hidden" style={{ background: "#ede4d8", border: "1px solid #ddd3c4" }}>
            <div className="flex items-center justify-between flex-wrap gap-2 px-6 pt-6 pb-4">
              <span className="text-xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "#2a1f14" }}>Today's Sessions</span>
              <span className="text-xs" style={{ color: "#8a7060" }}>38 live</span>
            </div>

            <div className="px-4 pb-6 flex flex-col gap-2.5">
              {sessions.map((s, i) => (
                <div key={i} className="rounded-[18px] p-[18px] cursor-pointer transition-all duration-200 hover:shadow-lg"
                  style={{ background: "#f5efe6", border: "1.5px solid #ddd3c4" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#ea6e1e"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ddd3c4"; }}>
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <div>
                      <div className="font-bold text-[15px]" style={{ fontFamily: "'Syne',sans-serif", color: "#2a1f14" }}>{s.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#8a7060" }}>{s.type}</div>
                    </div>
                    {s.status === "live" ? (
                      <span className="shrink-0 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                        style={{ background: "rgba(234,110,30,.12)", color: "#c8500a", border: "1px solid rgba(234,110,30,.25)" }}>
                        ● Live
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                        style={{ background: "rgba(180,140,80,.1)", color: "#9a7030", border: "1px solid rgba(180,140,80,.22)" }}>
                        Soon
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#8a7060" }}>{s.time}</span>
                    <button className="text-[12px] font-bold px-5 py-2 rounded-full text-white cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{ background: "#ea6e1e", border: "none", fontFamily: "'Syne',sans-serif", boxShadow: "0 2px 10px rgba(234,110,30,.28)" }}>
                      {s.status === "live" ? "Join Now" : "Reserve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EVENTS ── */}
        {activeTab === "Events" && (
          <div className="mx-6 rounded-[28px] overflow-hidden" style={{ background: "#ede4d8", border: "1px solid #ddd3c4" }}>
            <div className="flex items-center justify-between flex-wrap gap-2 px-6 pt-6 pb-4">
              <span className="text-xl font-bold" style={{ fontFamily: "'Syne',sans-serif", color: "#2a1f14" }}>Upcoming Events</span>
              <span className="text-xs" style={{ color: "#8a7060" }}>Next 7 days</span>
            </div>

            {/* grid: list + map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {/* Events list */}
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[600px] pr-2"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#ea6e1e #ddd3c4" }}>
                {events.map((e, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedEvent(i)}
                    className="rounded-[18px] p-4 cursor-pointer transition-all duration-200 shrink-0"
                    style={{
                      background: "#f5efe6",
                      border: `1.5px solid ${selectedEvent === i ? "#ea6e1e" : "#ddd3c4"}`,
                      boxShadow: selectedEvent === i ? "0 4px 18px rgba(234,110,30,.13)" : "none",
                    }}
                    onMouseEnter={ev => { if (selectedEvent !== i) ev.currentTarget.style.borderColor = "#ea6e1e"; }}
                    onMouseLeave={ev => { if (selectedEvent !== i) ev.currentTarget.style.borderColor = "#ddd3c4"; }}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className="font-bold text-sm" style={{ fontFamily: "'Syne',sans-serif", color: "#2a1f14" }}>{e.name}</span>
                      <span className="text-xl shrink-0">{e.emoji}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: "#8a7060" }}>{e.desc}</p>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: "#2a1f14" }}>{e.date}</span>
                      <span className="text-[10px]" style={{ color: "#8a7060" }}>📍 {e.location}</span>
                      <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full w-fit uppercase tracking-wide"
                        style={{ background: "rgba(234,110,30,.12)", color: "#c8500a", border: "1px solid rgba(234,110,30,.25)" }}>
                        {e.attendees}
                      </span>
                      <button
                        className="w-full mt-1 text-[10px] font-bold py-1.5 rounded-full text-white cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                        style={{ background: "#ea6e1e", border: "none", fontFamily: "'Syne',sans-serif", boxShadow: "0 2px 8px rgba(234,110,30,.25)" }}>
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Leaflet Map */}
              <div
                ref={mapRef}
                className="w-full rounded-[18px] lg:h-[600px] h-[400px]"
                style={{ border: "1.5px solid #ddd3c4" }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
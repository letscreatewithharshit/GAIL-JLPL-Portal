import React, { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
// Always shows today's date. Re-checks every 30 s so it rolls over at midnight without a reload.
export default function TodayDate({ className = "" }) {
  const { language } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const locale = language === "hi" ? "hi-IN" : "en-IN";
  const full = now.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return (
    <></>
    // <div className={`today-date ${className}`} aria-label="Today's date">
    //   <CalendarDays size={16} />
    //   <time dateTime={now.toISOString().slice(0, 10)}>{full}</time>
    // </div>
  );
}

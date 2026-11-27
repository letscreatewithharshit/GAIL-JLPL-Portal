import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock3, Users, CalendarCheck2 } from "lucide-react";
import { usePortal } from "../context/PortalContext";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const localISO = (date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export default function Calendar() {
  const { regions, selectedRegionId, selectedRegion } = usePortal();
  const { language, localize, t } = useLanguage();
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [selected, setSelected] = useState(() => new Date());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const regionId = selectedRegionId;
  React.useEffect(() => {
    let active = true;
    const load = () => {
      const fromDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const toDate = new Date(month.getFullYear(), month.getMonth()+1, 1);
      api.get("/calendar", { params: { from: localISO(fromDate), to: localISO(toDate), regionId } })
        .then(({data}) => { if(active) { setItems([
          ...(data.events || []).map(item => ({...item,date:new Date(item.eventDate),type:"event"})),
          ...(data.meetings || []).map(item => ({...item,date:new Date(item.meetingDate),type:"meeting"}))
        ].filter(x => !Number.isNaN(x.date.getTime())).sort((a,b)=>a.date-b.date)); setLoading(false); }})
        .catch(() => { if(active) { setItems([]); setLoading(false); }});
    };
    setLoading(true); load();
    const timer = window.setInterval(load, 30000);
    return () => { active=false; window.clearInterval(timer); };
  }, [month, regionId]);
  const cells = useMemo(() => {
    const first = month.getDay(), count = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const result = [...Array(first).fill(null), ...Array.from({length:count},(_,i)=>i+1)];
    while(result.length%7) result.push(null);
    return result;
  },[month]);
  const selectedItems = items.filter(item => sameDay(item.date,selected));
  const upcoming = items.filter(item => item.date >= new Date(new Date().setHours(0,0,0,0))).slice(0,5);
  const monthLabel = month.toLocaleDateString(language==="hi"?"hi-IN":"en-IN",{month:"long",year:"numeric"});
  const weekdays = language==="hi"?["रवि","सोम","मंगल","बुध","गुरु","शुक्र","शनि"]:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const move = n => { const next=monthStart(new Date(month.getFullYear(),month.getMonth()+n,1)); setMonth(next); setSelected(next); };
  const fmt = d => d.toLocaleDateString(language==="hi"?"hi-IN":"en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  return <div className="calendar-page">
    <section className="calendar-hero"><div className="container calendar-hero-inner">
      <div><span className="hero-kicker">{t("GAIL INDIA · REGIONAL OPERATIONS")}</span><h1>{t("Events & Meetings")}</h1><p>{t("A clear view of regional events, important meetings and upcoming activities.")}</p></div>
      <div className="calendar-hero-icon"><CalendarDays size={42}/></div>
    </div></section>
    <div className="container page-content calendar-page-content">
      <div className="calendar-summary"><div><span className="summary-icon"><CalendarCheck2/></span><div><b>{items.length}</b><small>{t("Published this month")}</small></div></div><div><span className="summary-icon"><Users/></span><div><b>{regions.length}</b><small>{t("ED Regions")}</small></div></div><div className="calendar-summary-note">{t("Select any highlighted date to view its schedule.")}</div></div>
      <div className="calendar-toolbar"><div className="calendar-month-controls"><button className="btn btn-outline small" onClick={()=>{const today=new Date();setMonth(monthStart(today));setSelected(today);}}>{t("Today")}</button><button className="calendar-arrow" onClick={()=>move(-1)} aria-label={t("Previous month")}><ChevronLeft/></button><button className="calendar-arrow" onClick={()=>move(1)} aria-label={t("Next month")}><ChevronRight/></button><h2>{monthLabel}</h2></div><span className="calendar-region-label">{localize(selectedRegion, "name")||"Jaipur"}</span></div>
      <div className="calendar-layout"><section className="calendar-grid" aria-label={t("Calendar")}><div className="calendar-weekdays">{weekdays.map(day=><span key={day}>{day}</span>)}</div><div className="calendar-days">{cells.map((day,index)=>{const date=day?new Date(month.getFullYear(),month.getMonth(),day):null;const dayItems=date?items.filter(item=>sameDay(item.date,date)):[];const active=date&&sameDay(date,selected);const today=date&&sameDay(date,new Date());return <button key={index} disabled={!day} className={`calendar-day ${active?"selected":""} ${today?"today":""} ${dayItems.length?"has-items":""}`} onClick={()=>date&&setSelected(date)}><span>{day||""}</span>{dayItems.length>0&&<i>{dayItems.length}</i>}</button>;})}</div><div className="calendar-legend"><span><i className="legend-event"/> {t("Event")}</span><span><i className="legend-meeting"/> {t("Meeting")}</span></div></section>
      <aside className="calendar-agenda"><div className="agenda-heading"><span className="eyebrow">{t("YOUR SCHEDULE")}</span><h3>{fmt(selected)}</h3><p>{selectedItems.length} {t("items scheduled")}</p></div>
        {selectedItems.length?selectedItems.map(item=><article className={`calendar-agenda-item ${item.type}`} key={`${item.type}-${item.id}`} onClick={()=>item.type==="event"&&navigate(`/events/${item.id}`)} role={item.type==="event"?"link":undefined} tabIndex={item.type==="event"?0:undefined}><span className={`calendar-type ${item.type}`}>{item.type==="event"?t("Event"):t("Meeting")}</span><b>{localize(item,"title")}</b><p>{localize(item,"description")||localize(item,"venue")||t("Regional activity")}</p><small><Clock3 size={14}/>{item.date.toLocaleTimeString(language==="hi"?"hi-IN":"en-IN",{hour:"2-digit",minute:"2-digit"})}</small><small><MapPin size={14}/>{localize(item,"venue")||t("Venue to be announced")}</small></article>):<div className="calendar-empty-state"><span className="empty-calendar-icon"><CalendarDays size={27}/></span><b>{loading?t("Loading schedule…"):t("Nothing scheduled for this day")}</b><p>{t("Choose a marked date or explore the upcoming schedule below.")}</p></div>}
        {upcoming.length>0&&<div className="upcoming-block"><h4>{t("Coming up")}</h4>{upcoming.slice(0,3).map(item=><button className="upcoming-item" key={`up-${item.type}-${item.id}`} onClick={()=>item.type==="event"?navigate(`/events/${item.id}`):(setMonth(monthStart(item.date)),setSelected(item.date))}><span className={`upcoming-date ${item.type}`}><b>{item.date.getDate()}</b><small>{item.date.toLocaleDateString(language==="hi"?"hi-IN":"en-IN",{month:"short"})}</small></span><span><b>{localize(item,"title")}</b><small>{item.type==="event"?t("Event"):t("Meeting")}</small></span><ChevronRight size={16}/></button>)}</div>}
      </aside></div>
      <p className="calendar-note">{t("Calendar entries are automatically created from published Events and Meetings in the Admin Panel.")}</p>
    </div>
  </div>;
}

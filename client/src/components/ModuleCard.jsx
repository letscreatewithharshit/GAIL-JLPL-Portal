import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, ClipboardCheck, Activity, FileCheck, Gauge, Waves } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
const icons={ShieldCheck,ClipboardCheck,Activity,FileCheck,Gauge,Waves};
export default function ModuleCard({item,regionId}){const {language}=useLanguage();const Icon=icons[item.icon]||FileCheck;return <Link to={`/regions/${regionId||'central'}/modules/${item.id}`} className="module-card"><div className="module-icon"><Icon size={22}/></div><div><h3>{language==='hi' ? (item.titleHi||item.title) : item.title}</h3><p>{language==='hi' ? (item.descriptionHi||item.description) : item.description}</p></div><ArrowUpRight className="module-arrow" size={18}/></Link>}

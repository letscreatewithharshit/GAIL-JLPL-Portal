// Four operational document collections shown on the portal.
export const DOC_CATEGORIES = [
  { value: 'IQMS', hi: 'आईक्यूएमएस', icon: 'ShieldCheck', image: '/src/images/iqms-cover.svg', description: 'Quality systems, procedures & records' },
  { value: 'Audits', hi: 'ऑडिट', icon: 'ClipboardCheck', image: '/src/images/audits-cover.svg', description: 'Internal and external audit records' },
  { value: 'Pipeline Integrity', hi: 'पाइपलाइन अखंडता', icon: 'Activity', image: '/src/images/pipeline-integrity-cover.svg', description: 'ILI, corrosion, CP & inspection reports' },
  { value: 'Statutory Documents', hi: 'वैधानिक दस्तावेज़', icon: 'FileCheck', image: '/src/images/statutory-cover.svg', description: 'Regulatory, compliance & statutory records' },
];

export const KEY_FIGURE_SLOTS = [
  { slot: 1, label: 'Pipeline Length', hi: 'पाइपलाइन लंबाई', icon: 'Ruler' },
  { slot: 2, label: 'Throughput Capacity', hi: 'थ्रूपुट क्षमता', icon: 'Gauge' },
  { slot: 3, label: 'Dispatch Terminals', hi: 'डिस्पैच टर्मिनल', icon: 'Truck' },
  { slot: 4, label: 'Receipt Terminals (TOPs)', hi: 'रिसीप्ट टर्मिनल (TOPs)', icon: 'MapPin' },
  { slot: 5, label: 'Pumping Stations', hi: 'पंपिंग स्टेशन', icon: 'Zap' },
  { slot: 6, label: 'States Crossed', hi: 'पार किए गए राज्य', icon: 'Map' },
  { slot: 7, label: 'Pipe Diameters', hi: 'पाइप व्यास', icon: 'Waypoints' },
  { slot: 8, label: 'Sectionalizing Valves', hi: 'सेक्शनलाइजिंग वाल्व', icon: 'ShieldCheck' },
];

export const ALL_REGIONS = '__ALL__';

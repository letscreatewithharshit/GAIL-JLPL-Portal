import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const regions = [
  {
    id: "jaipur",
    name: "Jaipur",
    nameHi: "जयपुर",
    description: "Jaipur region",
    descriptionHi: "जयपुर  क्षेत्र",
    image: null,
  },
  {
    id: "jamnagar",
    name: "Jamnagar",
    nameHi: "जामनगर",
    description: "jamnagar region",
    descriptionHi: "जामनगर  क्षेत्र",
    image: null,
  },
  {
    id: "samakhali",
    name: "Samakhali",
    nameHi: "समाखियाली",
    description: "Samakhali region",
    descriptionHi: "समाखियाली क्षेत्र",
    image: null,
  },
  {
    id: "nasirabad",
    name: "Nasirabad",
    nameHi: "नसीराबाद",
    description: "Nasirabad region",
    descriptionHi: "नसीराबाद क्षेत्र",
    image: null,
  },
  {
    id: "aburoad",
    name: "AbuRoad",
    nameHi: "आबू रोड",
    description: "AbuRoad region",
    descriptionHi: "आबू रोड क्षेत्र",
    image: null,
  },
  {
    id: "mansarampura",
    name: "Mansarampura",
    nameHi: "मनसारामपुरा",
    description: "Mansarampura region",
    descriptionHi: "मनसारामपुरा क्षेत्र",
    image: null,
  },
];
// Pipelines / network names are added by the admin from the Pipelines section.
const pipelines = {
  jaipur:[],
  jamnagar:[],
  samakhali: [],
  nasirabad: [],
  aburoad: [],
  mansarampura: [],

};
async function main() {
  for (const r of regions) {
    await prisma.region.upsert({ where: { id: r.id }, update: r, create: r });
    for (const name of pipelines[r.id])
      await prisma.pipeline.upsert({
        where: { name_regionId: { name, regionId: r.id } },
        update: {},
        create: { name, regionId: r.id },
      });
  }
  for (const d of [
    {
      code: "RGMC",
      name: "RGMC",
      nameHi: "क्षेत्रीय गैस प्रबंधन एवं समन्वय",
      description: "Regional Gas Management & Coordination",
      descriptionHi: "क्षेत्रीय गैस प्रबंधन एवं समन्वय",
    },
    {
      code: "RIMG",
      name: "RIMG",
      nameHi: "क्षेत्रीय अखंडता एवं रखरखाव समूह",
      description: "Regional Integrity & Maintenance Group",
      descriptionHi: "क्षेत्रीय अखंडता एवं रखरखाव समूह",
    },
    {
      code: "FS",
      name: "F&S",
      nameHi: "अग्नि एवं सुरक्षा",
      description: "Fire & Safety",
      descriptionHi: "अग्नि एवं सुरक्षा",
    },
  ])
    await prisma.department.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    });
  const modules = [
    {
      id: "iqms",
      title: "IQMS",
      titleHi: "एकीकृत गुणवत्ता प्रबंधन प्रणाली",
      description:
        "Integrated quality management system resources, procedures and records.",
      descriptionHi:
        "एकीकृत गुणवत्ता प्रबंधन प्रणाली के संसाधन, प्रक्रियाएँ और रिकॉर्ड।",
      icon: "ShieldCheck",
      availableRegions: ["samakhali", "nasirabad", "aburoad", "mansarampura", "jaipur", "jamnagar"],
      sortOrder: 1,
    },
    {
      id: "audits",
      title: "Audits",
      titleHi: "ऑडिट",
      description:
        "Audit schedules, observations, reports and compliance records.",
      descriptionHi: "ऑडिट कार्यक्रम, टिप्पणियाँ, रिपोर्ट और अनुपालन रिकॉर्ड।",
      icon: "ClipboardCheck",
      availableRegions: ["samakhali", "nasirabad", "aburoad", "mansarampura", "jaipur", "jamnagar"],
      sortOrder: 2,
    },
    {
      id: "pipeline-integrity",
      title: "Pipeline Integrity",
      titleHi: "पाइपलाइन अखंडता",
      description:
        "Integrity management plans, inspection references and status documents.",
      descriptionHi:
        "अखंडता प्रबंधन योजनाएँ, निरीक्षण संदर्भ और स्थिति दस्तावेज़।",
      icon: "Activity",
      availableRegions: ["samakhali", "nasirabad", "aburoad", "mansarampura", "jaipur", "jamnagar"],
      sortOrder: 3,
    },
    {
      id: "statutory-documents",
      title: "Statutory Documents",
      titleHi: "वैधानिक दस्तावेज़",
      description:
        "Applicable statutory records, certificates and regulatory documents.",
      descriptionHi: "लागू वैधानिक रिकॉर्ड, प्रमाणपत्र और नियामक दस्तावेज़।",
      icon: "FileCheck",
      availableRegions: ["samakhali", "nasirabad", "aburoad", "mansarampura", "jaipur", "jamnagar"],
      sortOrder: 4,
    },
    {
      id: "compressor",
      title: "Compressor",
      titleHi: "कंप्रेसर",
      description:
        "Compressor station references, maintenance records and operating documents.",
      descriptionHi:
        "कंप्रेसर स्टेशन संदर्भ, रखरखाव रिकॉर्ड और संचालन दस्तावेज़।",
      icon: "Gauge",
      availableRegions: ["samakhali"],
      sortOrder: 5,
    },
    {
      id: "pumps",
      title: "Pumps",
      titleHi: "पंप",
      description:
        "Pump station references, maintenance records and operating documents.",
      descriptionHi: "पंप स्टेशन संदर्भ, रखरखाव रिकॉर्ड और संचालन दस्तावेज़।",
      icon: "Waves",
      availableRegions: ["mansarampura", "nasirabad"],
      sortOrder: 6,
    },
  ];
  for (const m of modules)
    await prisma.portalModule.upsert({
      where: { id: m.id },
      update: m,
      create: m,
    });
  const jlplFigures = [
    { slot: 1, label: "Pipeline Length", value: "1,426.6", unit: "km" },
    { slot: 2, label: "Throughput Capacity", value: "3.25", unit: "MMTPA" },
    { slot: 3, label: "Dispatch Terminals", value: "5", unit: "" },
    { slot: 4, label: "Receipt Terminals (TOPs)", value: "11", unit: "" },
    { slot: 5, label: "Pumping Stations", value: "4", unit: "" },
    { slot: 6, label: "States Crossed", value: "5", unit: "" },
    { slot: 7, label: "Pipe Diameters", value: "5", unit: "sizes" },
    { slot: 8, label: "Sectionalizing Valves", value: "78", unit: "SVs" },
  ];
  for (const region of regions) {
    for (const figure of jlplFigures) {
      await prisma.keyFigure.upsert({
        where: { regionId_slot: { regionId: region.id, slot: figure.slot } },
        update: { label: figure.label, value: figure.value, unit: figure.unit },
        create: { ...figure, regionId: region.id },
      });
    }
  }

  await prisma.portalSetting.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      heroTitle: "One network. Four regions. One connected team.",
      heroTitleHi: "एक नेटवर्क। चार क्षेत्र। एकजुट टीम।",
      heroSubtitle:
        "A regional information hub designed to bring operational resources, updates and teams closer together.",
      heroSubtitleHi:
        "परिचालन संसाधनों, अपडेट और टीमों को जोड़ने वाला क्षेत्रीय सूचना केंद्र।",
    },
  });
  console.log(
    "Seed complete: regions, pipelines, departments and editable O&M modules configured. Admin credentials are configured separately in server/.env.",
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

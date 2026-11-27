// One-time migration of an EXISTING database from the old 5 sample regions
// to the 4 real regions. Safe to run more than once.
//
//   cd server
//   node prisma/rename-regions.js
//
// It keeps all existing records (documents, meetings, highlights, ...) and just
// re-labels them:  central -> Samakhali, eastern -> Nasirabad,
//                  western -> AbuRoad,    northern -> Mansarampura
// The old "southern" region is removed only if nothing is attached to it.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const MAP = {
  central:  { id: 'samakhali',    name: 'Samakhali',    nameHi: 'समाखियाली', description: 'Samakhali region',    descriptionHi: 'समाखियाली क्षेत्र' },
  eastern:  { id: 'nasirabad',    name: 'Nasirabad',    nameHi: 'नसीराबाद',  description: 'Nasirabad region',    descriptionHi: 'नसीराबाद क्षेत्र' },
  western:  { id: 'aburoad',      name: 'AbuRoad',      nameHi: 'आबू रोड',   description: 'AbuRoad region',      descriptionHi: 'आबू रोड क्षेत्र' },
  northern: { id: 'mansarampura', name: 'Mansarampura', nameHi: 'मनसारामपुरा', description: 'Mansarampura region', descriptionHi: 'मनसारामपुरा क्षेत्र' }
};
// Sample pipeline names that the old seed attached to the old regions.
const OLD_SAMPLE_PIPELINES = ['HVJ', 'Gujarat', 'JHBDPL', 'SAPL', 'Agartala', 'Maharashtra', 'MNJPL', 'NCR', 'JLPL', 'Ramgarh', 'DBPL', 'KG Basin', 'Cauvery', 'KKBMPL', 'VSPL'];

async function main() {
  for (const [oldId, next] of Object.entries(MAP)) {
    const old = await prisma.region.findUnique({ where: { id: oldId } });
    const already = await prisma.region.findUnique({ where: { id: next.id } });
    if (old && !already) {
      // All foreign keys are ON UPDATE CASCADE, so changing the id moves every linked record with it.
      await prisma.$executeRawUnsafe(`UPDATE "Region" SET "id" = $1 WHERE "id" = $2`, next.id, oldId);
      console.log(`Renamed region id ${oldId} -> ${next.id}`);
    }
    await prisma.region.upsert({ where: { id: next.id }, update: { name: next.name, nameHi: next.nameHi, description: next.description, descriptionHi: next.descriptionHi }, create: { ...next } });
    // old sample pipelines belonged to the old regions; remove them so they do not show on the new ones
    const removed = await prisma.pipeline.deleteMany({ where: { regionId: next.id, name: { in: OLD_SAMPLE_PIPELINES } } });
    if (removed.count) console.log(`  removed ${removed.count} old sample pipeline label(s) from ${next.name}`);
  }

  // module availability list (stored as text[] of region ids)
  const modules = await prisma.portalModule.findMany();
  for (const m of modules) {
    const ids = [...new Set((m.availableRegions || []).map(id => MAP[id]?.id || id).filter(id => id !== 'southern'))];
    await prisma.portalModule.update({ where: { id: m.id }, data: { availableRegions: ids } });
  }

  // southern is not one of the 4 regions any more
  const southern = await prisma.region.findUnique({ where: { id: 'southern' } });
  if (southern) {
    const [d, m, g, e] = await Promise.all([
      prisma.document.count({ where: { regionId: 'southern' } }),
      prisma.meeting.count({ where: { regionId: 'southern' } }),
      prisma.galleryImage.count({ where: { regionId: 'southern' } }),
      prisma.employee.count({ where: { regionId: 'southern' } })
    ]);
    if (d + m + g + e === 0) {
      await prisma.region.delete({ where: { id: 'southern' } });
      console.log('Removed unused old region "southern".');
    } else {
      console.log(`WARNING: old region "southern" still has ${d} documents, ${m} meetings, ${g} photos, ${e} directory records.`);
      console.log('         Move or delete them from the Admin panel, then run this script again.');
    }
  }

  // homepage heading text
  await prisma.$executeRawUnsafe(`UPDATE "PortalSetting" SET "heroTitle" = REPLACE("heroTitle", 'Five regions', 'Four regions'), "heroTitleHi" = REPLACE("heroTitleHi", 'पाँच क्षेत्र', 'चार क्षेत्र')`);
  console.log('Done.');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

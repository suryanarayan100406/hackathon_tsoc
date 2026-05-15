const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function dedup() {
  const units = await prisma.unit.findMany({ orderBy: { id: 'asc' } })
  const seen = new Map()
  const toDelete = []

  for (const u of units) {
    const key = `${u.name}|${u.grade}|${u.subjectId}`
    if (seen.has(key)) toDelete.push(u.id)
    else seen.set(key, u.id)
  }

  if (toDelete.length) {
    await prisma.quest.deleteMany({ where: { unitId: { in: toDelete } } })
    await prisma.unit.deleteMany({ where: { id: { in: toDelete } } })
    console.log('Deleted', toDelete.length, 'duplicate units and their quests')
  } else {
    console.log('No duplicates found')
  }

  await prisma.$disconnect()
}

dedup().catch(e => { console.error(e); process.exit(1) })

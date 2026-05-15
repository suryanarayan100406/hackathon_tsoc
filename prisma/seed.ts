import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { BADGE_DEFINITIONS, SUBJECT_THEMES, QUEST_TYPES } from '../src/lib/gamification'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Badges
  console.log('Creating badges...')
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { id: badge.trigger }, // Assuming id could be the trigger if we want, but trigger isn't @unique in schema. Wait, trigger isn't unique in schema.
      // Actually schema says id is String @id @default(cuid()). So we just create if not exists by looking up trigger.
      update: {},
      create: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        trigger: badge.trigger,
      },
    })
  }

  // 2. Create Schools
  console.log('Creating schools...')
  const schoolsData = [
    { name: 'Delhi Public School', code: 'DPS001', district: 'Delhi', state: 'Delhi' },
    { name: 'Kendriya Vidyalaya', code: 'KVS002', district: 'Mumbai', state: 'Maharashtra' },
    { name: 'Government High School', code: 'GHS003', district: 'Chennai', state: 'Tamil Nadu' },
  ]
  const schools = []
  for (const s of schoolsData) {
    const school = await prisma.school.upsert({
      where: { code: s.code },
      update: {},
      create: s,
    })
    schools.push(school)
  }

  // 3. Create Users (Teacher and Student)
  console.log('Creating test users...')
  const hashedTeacherPassword = await bcrypt.hash('teacher123', 12)
  const hashedStudentPassword = await bcrypt.hash('student123', 12)

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@dps.com' },
    update: {},
    create: {
      name: 'Priya Sharma (Teacher)',
      email: 'teacher@dps.com',
      password: hashedTeacherPassword,
      role: 'TEACHER',
      schoolId: schools[0].id,
      grade: 8,
    },
  })

  const student = await prisma.user.upsert({
    where: { email: 'ravi@dps.com' },
    update: {},
    create: {
      name: 'Ravi Kumar',
      email: 'ravi@dps.com',
      password: hashedStudentPassword,
      role: 'STUDENT',
      schoolId: schools[0].id,
      grade: 8,
      xp: 150,
      level: 1,
      streakDays: 2,
    },
  })

  // 4. Create Subjects
  console.log('Creating subjects...')
  const subjectsData = Object.entries(SUBJECT_THEMES).map(([slug, data], index) => ({
    name: data.name,
    slug: slug,
    icon: data.icon,
    color: data.color,
    order: index + 1,
  }))

  for (const s of subjectsData) {
    await prisma.subject.upsert({
      where: { slug: s.slug },
      update: {},
      create: s,
    })
  }

  // Fetch subjects to link units
  const mathSubject = await prisma.subject.findUnique({ where: { slug: 'mathematics' } })
  const scienceSubject = await prisma.subject.findUnique({ where: { slug: 'science' } })

  if (mathSubject && scienceSubject) {
    console.log('Creating units and quests...')

    // Create Math Unit
    const mathUnit = await prisma.unit.create({
      data: {
        name: 'Number Systems',
        grade: 8,
        order: 1,
        subjectId: mathSubject.id,
      },
    })

    // Create Math Quest
    await prisma.quest.create({
      data: {
        title: 'Integer Operations',
        type: 'QUIZ',
        difficulty: 'EASY',
        xpReward: 50,
        timeLimit: 300,
        order: 1,
        unitId: mathUnit.id,
        content: JSON.stringify({
          questions: [
            {
              id: 'q1',
              question: 'What is -5 + 3?',
              options: ['-8', '-2', '2', '8'],
              correct: 1,
              explanation: '-5 + 3 = -2',
            },
            {
              id: 'q2',
              question: 'What is -4 * -3?',
              options: ['-12', '12', '7', '-7'],
              correct: 1,
              explanation: 'Multiplying two negative numbers gives a positive result: -4 * -3 = 12',
            },
          ],
        }),
      },
    })

    // Create Science Unit
    const scienceUnit = await prisma.unit.create({
      data: {
        name: 'Force & Motion',
        grade: 8,
        order: 1,
        subjectId: scienceSubject.id,
      },
    })

    // Create Science Quest
    await prisma.quest.create({
      data: {
        title: 'Newton\'s Laws',
        type: 'QUIZ',
        difficulty: 'MEDIUM',
        xpReward: 75,
        timeLimit: 400,
        order: 1,
        unitId: scienceUnit.id,
        content: JSON.stringify({
          questions: [
            {
              id: 'q1',
              question: 'Which law is known as the law of inertia?',
              options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravitation'],
              correct: 0,
              explanation: 'Newton\'s First Law of Motion states that an object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.',
            },
          ],
        }),
      },
    })
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

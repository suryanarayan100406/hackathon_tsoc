import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { BADGE_DEFINITIONS, SUBJECT_THEMES } from '../src/lib/gamification'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // 1. Create Badges
  console.log('Creating badges...')
  for (const badge of BADGE_DEFINITIONS) {
    const existing = await prisma.badge.findFirst({ where: { trigger: badge.trigger } })
    if (!existing) {
      await prisma.badge.create({
        data: { name: badge.name, description: badge.description, icon: badge.icon, trigger: badge.trigger },
      })
    }
  }

  // 2. Create Schools
  console.log('Creating schools...')
  const schoolsData = [
    { name: 'Delhi Public School', code: 'DPS001', district: 'Delhi', state: 'Delhi' },
    { name: 'Kendriya Vidyalaya', code: 'KVS002', district: 'Mumbai', state: 'Maharashtra' },
    { name: 'Government High School', code: 'GHS003', district: 'Chennai', state: 'Tamil Nadu' },
  ]
  const schools: any[] = []
  for (const s of schoolsData) {
    const school = await prisma.school.upsert({ where: { code: s.code }, update: {}, create: s })
    schools.push(school)
  }

  // 3. Create Users
  console.log('Creating test users...')
  const hashedTeacher = await bcrypt.hash('teacher123', 12)
  const hashedStudent = await bcrypt.hash('student123', 12)

  await prisma.user.upsert({
    where: { email: 'teacher@dps.com' },
    update: {},
    create: { name: 'Priya Sharma', email: 'teacher@dps.com', password: hashedTeacher, role: 'TEACHER', schoolId: schools[0].id, grade: 8 },
  })
  await prisma.user.upsert({
    where: { email: 'ravi@dps.com' },
    update: {},
    create: { name: 'Ravi Kumar', email: 'ravi@dps.com', password: hashedStudent, role: 'STUDENT', schoolId: schools[0].id, grade: 8, xp: 150, level: 1, streakDays: 2 },
  })

  // 4. Create Subjects
  console.log('Creating subjects...')
  const subjectsData = Object.entries(SUBJECT_THEMES).map(([slug, data], index) => ({
    name: data.name, slug, icon: data.icon, color: data.color, order: index + 1,
  }))
  for (const s of subjectsData) {
    await prisma.subject.upsert({ where: { slug: s.slug }, update: {}, create: s })
  }

  const math = await prisma.subject.findUnique({ where: { slug: 'mathematics' } })
  const science = await prisma.subject.findUnique({ where: { slug: 'science' } })
  const tech = await prisma.subject.findUnique({ where: { slug: 'technology' } })
  const english = await prisma.subject.findUnique({ where: { slug: 'english' } })
  const evs = await prisma.subject.findUnique({ where: { slug: 'environmental_studies' } })

  // Helper to create unit + quests
  async function createUnit(name: string, grade: number, order: number, subjectId: string, quests: any[]) {
    const unit = await prisma.unit.create({ data: { name, grade, order, subjectId } })
    for (let i = 0; i < quests.length; i++) {
      await prisma.quest.create({ data: { ...quests[i], unitId: unit.id, order: i + 1 } })
    }
    return unit
  }

  console.log('Creating units and quests...')

  // ───── MATHEMATICS ─────
  if (math) {
    await createUnit('Number Systems', 8, 1, math.id, [
      {
        title: 'Integer Operations', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'What is -5 + 3?', options: ['-8', '-2', '2', '8'], correct: 1, explanation: '-5 + 3 = -2' },
          { id: 'q2', question: 'What is -4 × -3?', options: ['-12', '12', '7', '-7'], correct: 1, explanation: 'Two negatives make a positive: -4 × -3 = 12' },
          { id: 'q3', question: 'What is 15 ÷ -3?', options: ['5', '-5', '45', '-45'], correct: 1, explanation: 'Positive ÷ negative = negative: 15 ÷ -3 = -5' },
        ]})
      },
      {
        title: 'Rational Numbers', type: 'QUIZ', difficulty: 'EASY', xpReward: 60, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Which of these is a rational number?', options: ['√2', 'π', '3/4', '∞'], correct: 2, explanation: '3/4 can be expressed as a fraction p/q where q≠0' },
          { id: 'q2', question: 'What is 1/2 + 1/3?', options: ['2/5', '5/6', '2/6', '1/6'], correct: 1, explanation: '1/2 + 1/3 = 3/6 + 2/6 = 5/6' },
          { id: 'q3', question: 'Is -7 a rational number?', options: ['Yes', 'No', 'Maybe', 'Only if positive'], correct: 0, explanation: '-7 = -7/1, so it is rational' },
        ]})
      },
      {
        title: 'Powers & Exponents', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 75, timeLimit: 360,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'What is 2⁵?', options: ['10', '25', '32', '64'], correct: 2, explanation: '2⁵ = 2×2×2×2×2 = 32' },
          { id: 'q2', question: 'What is 3⁰?', options: ['0', '1', '3', '9'], correct: 1, explanation: 'Any non-zero number raised to power 0 is 1' },
          { id: 'q3', question: 'Simplify: 2³ × 2²', options: ['2⁵', '2⁶', '4⁵', '8'], correct: 0, explanation: 'When multiplying same base, add exponents: 2³ × 2² = 2⁵' },
        ]})
      },
    ])

    await createUnit('Algebra Basics', 8, 2, math.id, [
      {
        title: 'Linear Equations', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 80, timeLimit: 400,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Solve: 2x + 5 = 15. What is x?', options: ['5', '10', '7.5', '4'], correct: 0, explanation: '2x = 15 - 5 = 10, so x = 5' },
          { id: 'q2', question: 'Solve: 3x - 9 = 0. What is x?', options: ['0', '9', '3', '-3'], correct: 2, explanation: '3x = 9, so x = 3' },
          { id: 'q3', question: 'If 4x = 20, then x =?', options: ['80', '24', '5', '16'], correct: 2, explanation: 'x = 20 ÷ 4 = 5' },
        ]})
      },
      {
        title: 'Algebraic Identities', type: 'QUIZ', difficulty: 'HARD', xpReward: 100, timeLimit: 480,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: '(a + b)² = ?', options: ['a² + b²', 'a² + 2ab + b²', 'a² - 2ab + b²', '2a + 2b'], correct: 1, explanation: '(a+b)² expands to a² + 2ab + b²' },
          { id: 'q2', question: '(a - b)(a + b) = ?', options: ['a² + b²', 'a² - b²', '(a-b)²', '2ab'], correct: 1, explanation: 'Difference of squares: (a-b)(a+b) = a² - b²' },
          { id: 'q3', question: 'Expand (x + 3)²', options: ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', '2x + 6'], correct: 1, explanation: '(x+3)² = x² + 2(x)(3) + 3² = x² + 6x + 9' },
        ]})
      },
    ])

    await createUnit('Geometry', 8, 3, math.id, [
      {
        title: 'Area & Perimeter', type: 'QUIZ', difficulty: 'EASY', xpReward: 55, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Area of a rectangle with length 8 and width 5?', options: ['13', '26', '40', '45'], correct: 2, explanation: 'Area = length × width = 8 × 5 = 40' },
          { id: 'q2', question: 'Perimeter of a square with side 7?', options: ['14', '28', '49', '7'], correct: 1, explanation: 'Perimeter = 4 × side = 4 × 7 = 28' },
          { id: 'q3', question: 'Area of a triangle with base 10 and height 6?', options: ['60', '30', '16', '32'], correct: 1, explanation: 'Area = ½ × base × height = ½ × 10 × 6 = 30' },
        ]})
      },
      {
        title: 'Pythagoras Theorem', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 85, timeLimit: 420,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'In a right triangle with legs 3 and 4, hypotenuse = ?', options: ['5', '7', '12', '25'], correct: 0, explanation: '√(3² + 4²) = √(9 + 16) = √25 = 5' },
          { id: 'q2', question: 'Pythagoras theorem: a² + b² = ?', options: ['a+b', 'c²', '2c', 'ab'], correct: 1, explanation: 'a² + b² = c² where c is the hypotenuse' },
          { id: 'q3', question: 'Is a triangle with sides 5, 12, 13 a right triangle?', options: ['Yes', 'No', 'Cannot say', 'Only if acute'], correct: 0, explanation: '5² + 12² = 25 + 144 = 169 = 13². Yes!' },
        ]})
      },
    ])
  }

  // ───── SCIENCE ─────
  if (science) {
    await createUnit('Force & Motion', 8, 1, science.id, [
      {
        title: "Newton's Laws", type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 75, timeLimit: 400,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: "Which law is Newton's law of inertia?", options: ['First', 'Second', 'Third', 'Zeroth'], correct: 0, explanation: "Newton's 1st Law: Objects stay at rest or in motion unless acted on by force" },
          { id: 'q2', question: 'F = ma is Newton\'s which law?', options: ['First', 'Second', 'Third', 'Law of Gravitation'], correct: 1, explanation: 'F = ma is Newton\'s Second Law of Motion' },
          { id: 'q3', question: 'Every action has an equal and opposite reaction — which law?', options: ['First', 'Second', 'Third', 'None'], correct: 2, explanation: "Newton's Third Law of Motion" },
        ]})
      },
      {
        title: 'Friction & Gravity', type: 'QUIZ', difficulty: 'EASY', xpReward: 55, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Friction always acts __ to motion', options: ['Parallel in same direction', 'Opposite to motion', 'Perpendicular', 'Randomly'], correct: 1, explanation: 'Friction opposes the direction of motion' },
          { id: 'q2', question: 'Value of g (acceleration due to gravity) near Earth?', options: ['9.8 m/s²', '10 m/s²', '8 m/s²', '6.7 m/s²'], correct: 0, explanation: 'g ≈ 9.8 m/s² on Earth\'s surface' },
          { id: 'q3', question: 'An object in free fall experiences:', options: ['Air friction only', 'No gravity', 'Only gravity', 'No force'], correct: 2, explanation: 'In free fall, only gravitational force acts on the object' },
        ]})
      },
    ])

    await createUnit('Matter & States', 8, 2, science.id, [
      {
        title: 'States of Matter', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Which state of matter has definite shape and volume?', options: ['Gas', 'Liquid', 'Solid', 'Plasma'], correct: 2, explanation: 'Solids have both definite shape and definite volume' },
          { id: 'q2', question: 'Boiling converts liquid to?', options: ['Solid', 'Gas', 'Plasma', 'Stays liquid'], correct: 1, explanation: 'Boiling converts liquid to gas (vapour)' },
          { id: 'q3', question: 'Which process converts gas directly to solid?', options: ['Evaporation', 'Condensation', 'Deposition', 'Sublimation'], correct: 2, explanation: 'Deposition is when gas converts directly to solid' },
        ]})
      },
      {
        title: 'Atoms & Molecules', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 80, timeLimit: 380,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Smallest unit of an element?', options: ['Molecule', 'Atom', 'Proton', 'Cell'], correct: 1, explanation: 'Atom is the smallest unit of an element that retains its chemical properties' },
          { id: 'q2', question: 'Chemical formula of water?', options: ['HO', 'H²O', 'H₂O', 'OH₂'], correct: 2, explanation: 'Water = H₂O (2 hydrogen atoms + 1 oxygen atom)' },
          { id: 'q3', question: 'How many atoms are in one molecule of CO₂?', options: ['2', '3', '4', '1'], correct: 1, explanation: 'CO₂ has 1 Carbon + 2 Oxygen = 3 atoms total' },
        ]})
      },
      {
        title: 'Chemical Reactions', type: 'QUIZ', difficulty: 'HARD', xpReward: 100, timeLimit: 450,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Rusting of iron is a __ reaction', options: ['Physical', 'Chemical', 'Nuclear', 'Biological'], correct: 1, explanation: 'Rusting (oxidation) is a chemical reaction producing iron oxide' },
          { id: 'q2', question: 'What is produced when acids and bases react?', options: ['Acid', 'Base', 'Salt and water', 'Gas only'], correct: 2, explanation: 'Acid + Base → Salt + Water (neutralization)' },
          { id: 'q3', question: 'pH of pure water is?', options: ['0', '7', '14', '1'], correct: 1, explanation: 'Pure water is neutral with pH = 7' },
        ]})
      },
    ])
  }

  // ───── TECHNOLOGY ─────
  if (tech) {
    await createUnit('Computer Basics', 8, 1, tech.id, [
      {
        title: 'Input & Output Devices', type: 'QUIZ', difficulty: 'EASY', xpReward: 45, timeLimit: 250,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Which is an INPUT device?', options: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], correct: 2, explanation: 'Keyboard is used to input data into the computer' },
          { id: 'q2', question: 'Which is an OUTPUT device?', options: ['Mouse', 'Scanner', 'Webcam', 'Monitor'], correct: 3, explanation: 'Monitor displays output from the computer' },
          { id: 'q3', question: 'CPU stands for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Power Unit', 'Core Processing Unit'], correct: 1, explanation: 'CPU = Central Processing Unit, the brain of the computer' },
        ]})
      },
      {
        title: 'Software & Hardware', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 280,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Which of these is SOFTWARE?', options: ['RAM', 'Hard disk', 'Windows OS', 'Motherboard'], correct: 2, explanation: 'Windows OS is software — programs/instructions that run on hardware' },
          { id: 'q2', question: 'RAM stands for?', options: ['Read Access Memory', 'Random Access Memory', 'Rapid Application Memory', 'Readable Array Memory'], correct: 1, explanation: 'RAM = Random Access Memory, temporary storage used by running programs' },
          { id: 'q3', question: 'Which stores data permanently?', options: ['RAM', 'Cache', 'Hard Drive', 'CPU registers'], correct: 2, explanation: 'Hard drives (HDD/SSD) store data permanently even without power' },
        ]})
      },
    ])

    await createUnit('Internet & Networking', 8, 2, tech.id, [
      {
        title: 'How the Internet Works', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 70, timeLimit: 360,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'HTTP stands for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Home Text Transfer Protocol', 'Hyper Terminal Transfer Process'], correct: 0, explanation: 'HTTP = HyperText Transfer Protocol, used for web communication' },
          { id: 'q2', question: 'IP address identifies a?', options: ['Website name', 'File', 'Device on a network', 'Program'], correct: 2, explanation: 'IP address uniquely identifies a device on a network' },
          { id: 'q3', question: 'What does a router do?', options: ['Stores data', 'Directs network traffic', 'Processes data', 'Displays web pages'], correct: 1, explanation: 'A router directs data packets between networks' },
        ]})
      },
      {
        title: 'Cybersecurity Basics', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 80, timeLimit: 380,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'A strong password should contain?', options: ['Only letters', 'Only numbers', 'Letters, numbers and symbols', 'Your name'], correct: 2, explanation: 'Strong passwords mix uppercase, lowercase, numbers, and special characters' },
          { id: 'q2', question: 'Phishing is?', options: ['A fishing game', 'Tricking users to reveal personal info', 'A type of virus', 'Blocking websites'], correct: 1, explanation: 'Phishing tricks you into giving sensitive information via fake emails/sites' },
          { id: 'q3', question: 'What does a firewall do?', options: ['Cools the computer', 'Blocks unauthorized network access', 'Speeds up internet', 'Stores passwords'], correct: 1, explanation: 'A firewall monitors and controls incoming/outgoing network traffic for security' },
        ]})
      },
    ])

    await createUnit('Programming Concepts', 8, 3, tech.id, [
      {
        title: 'Intro to Coding', type: 'QUIZ', difficulty: 'EASY', xpReward: 60, timeLimit: 300,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'What is an algorithm?', options: ['A programming language', 'Step-by-step problem solving instructions', 'A type of computer', 'A software bug'], correct: 1, explanation: 'An algorithm is a set of step-by-step instructions to solve a problem' },
          { id: 'q2', question: 'Which of these is a programming language?', options: ['HTML alone', 'Python', 'Google', 'Windows'], correct: 1, explanation: 'Python is a popular programming language used for many applications' },
          { id: 'q3', question: 'A loop in programming is used to?', options: ['Stop a program', 'Repeat a set of instructions', 'Connect to internet', 'Create graphics'], correct: 1, explanation: 'Loops repeat a block of code multiple times' },
        ]})
      },
    ])
  }

  // ───── ENGLISH ─────
  if (english) {
    await createUnit('Grammar Foundations', 8, 1, english.id, [
      {
        title: 'Parts of Speech', type: 'QUIZ', difficulty: 'EASY', xpReward: 45, timeLimit: 250,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: '"Quickly" is an example of?', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], correct: 3, explanation: '"Quickly" modifies a verb, so it is an adverb' },
          { id: 'q2', question: '"Beautiful" is a/an?', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], correct: 2, explanation: '"Beautiful" describes a noun, so it is an adjective' },
          { id: 'q3', question: 'Identify the noun: "The dog ran fast"', options: ['The', 'dog', 'ran', 'fast'], correct: 1, explanation: '"dog" is a noun — a person, place, or thing' },
        ]})
      },
      {
        title: 'Tenses', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 65, timeLimit: 320,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: '"She is eating" is in which tense?', options: ['Simple Present', 'Present Continuous', 'Past Simple', 'Future'], correct: 1, explanation: '"is eating" is present continuous (is/are + verb-ing)' },
          { id: 'q2', question: 'Past tense of "go" is?', options: ['goed', 'went', 'gone', 'going'], correct: 1, explanation: '"went" is the simple past tense of "go"' },
          { id: 'q3', question: '"Will you come?" uses which tense?', options: ['Past', 'Present', 'Future', 'Perfect'], correct: 2, explanation: '"will" signals simple future tense' },
        ]})
      },
    ])

    await createUnit('Reading & Comprehension', 8, 2, english.id, [
      {
        title: 'Synonyms & Antonyms', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 280,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Synonym of "happy"?', options: ['Sad', 'Joyful', 'Angry', 'Tired'], correct: 1, explanation: '"Joyful" means the same as happy' },
          { id: 'q2', question: 'Antonym of "brave"?', options: ['Strong', 'Cowardly', 'Bold', 'Fierce'], correct: 1, explanation: '"Cowardly" is the opposite of brave' },
          { id: 'q3', question: 'Synonym of "begin"?', options: ['End', 'Stop', 'Start', 'Pause'], correct: 2, explanation: '"Start" means the same as begin' },
        ]})
      },
    ])
  }

  // ───── ENVIRONMENTAL STUDIES ─────
  if (evs) {
    await createUnit("Our Environment", 8, 1, evs.id, [
      {
        title: 'Ecosystems', type: 'QUIZ', difficulty: 'EASY', xpReward: 50, timeLimit: 280,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Producers in an ecosystem are?', options: ['Animals', 'Plants', 'Fungi', 'Bacteria'], correct: 1, explanation: 'Plants are producers — they make food through photosynthesis' },
          { id: 'q2', question: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correct: 2, explanation: 'Plants absorb CO₂ and release O₂ during photosynthesis' },
          { id: 'q3', question: 'Decomposers break down?', options: ['Sunlight', 'Dead organic matter', 'Rocks', 'Air'], correct: 1, explanation: 'Decomposers (fungi, bacteria) break down dead plants and animals' },
        ]})
      },
      {
        title: 'Climate & Weather', type: 'QUIZ', difficulty: 'EASY', xpReward: 55, timeLimit: 290,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'Global warming is caused mainly by?', options: ['Sunlight', 'Greenhouse gases', 'Wind', 'Rain'], correct: 1, explanation: 'Greenhouse gases (CO₂, methane) trap heat and cause global warming' },
          { id: 'q2', question: 'The ozone layer protects us from?', options: ['Rain', 'Wind', 'UV radiation', 'Earthquakes'], correct: 2, explanation: 'The ozone layer blocks harmful ultraviolet (UV) radiation from the sun' },
          { id: 'q3', question: 'Which is a renewable energy source?', options: ['Coal', 'Petroleum', 'Solar Energy', 'Natural Gas'], correct: 2, explanation: 'Solar energy is renewable — it comes from the sun and is unlimited' },
        ]})
      },
    ])

    await createUnit('Natural Resources', 8, 2, evs.id, [
      {
        title: 'Water Conservation', type: 'QUIZ', difficulty: 'MEDIUM', xpReward: 70, timeLimit: 340,
        content: JSON.stringify({ questions: [
          { id: 'q1', question: 'What percentage of Earth\'s water is fresh water?', options: ['50%', '3%', '25%', '10%'], correct: 1, explanation: 'Only about 3% of Earth\'s water is freshwater' },
          { id: 'q2', question: 'Which is NOT a water conservation method?', options: ['Drip irrigation', 'Rainwater harvesting', 'Leaving taps open', 'Recycling water'], correct: 2, explanation: 'Leaving taps open wastes water — it is not conservation' },
          { id: 'q3', question: 'The water cycle process of water rising as vapour is?', options: ['Condensation', 'Precipitation', 'Evaporation', 'Infiltration'], correct: 2, explanation: 'Evaporation converts liquid water to water vapour' },
        ]})
      },
    ])
  }

  // ───── GAMIFICATION CURRICULUM CHAPTERS ─────
  // Seed Chapter data for game.js (from CURRICULUM object)
  console.log('Creating gamification curriculum chapters...')
  const curriculumData: Record<string, any> = {
    math: {
      label: 'Mathematics',
      chapters: [
        { id: 'm1', title: 'Number Systems', icon: '🔢', type: 'lesson', xpReward: 50 },
        { id: 'm2', title: 'Number Systems Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'm3', title: 'Algebra Basics', icon: '📐', type: 'lesson', xpReward: 50 },
        { id: 'm4', title: 'Algebra Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'm5', title: 'Linear Equations', icon: '📏', type: 'lesson', xpReward: 60 },
        { id: 'm6', title: 'Linear Equations Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'm7', title: 'Geometry', icon: '📐', type: 'lesson', xpReward: 60 },
        { id: 'm8', title: 'Geometry Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'm9', title: 'Statistics', icon: '📊', type: 'lesson', xpReward: 70 },
        { id: 'm10', title: 'Statistics Boss Quiz', icon: '🏆', type: 'boss', xpReward: 200, passMark: 70 }
      ]
    },
    physics: {
      label: 'Physics',
      chapters: [
        { id: 'p1', title: 'Motion & Force', icon: '🏃', type: 'lesson', xpReward: 50 },
        { id: 'p2', title: 'Motion Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'p3', title: 'Laws of Motion', icon: '⚖️', type: 'lesson', xpReward: 60 },
        { id: 'p4', title: 'Laws Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'p5', title: 'Gravitation', icon: '🌍', type: 'lesson', xpReward: 60 },
        { id: 'p6', title: 'Gravitation Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'p7', title: 'Light & Optics', icon: '🔦', type: 'lesson', xpReward: 70 },
        { id: 'p8', title: 'Physics Boss Quiz', icon: '🏆', type: 'boss', xpReward: 200, passMark: 70 }
      ]
    },
    chemistry: {
      label: 'Chemistry',
      chapters: [
        { id: 'c1', title: 'Matter & Atoms', icon: '⚛️', type: 'lesson', xpReward: 50 },
        { id: 'c2', title: 'Matter Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'c3', title: 'Periodic Table', icon: '📋', type: 'lesson', xpReward: 60 },
        { id: 'c4', title: 'Periodic Table Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'c5', title: 'Chemical Reactions', icon: '💥', type: 'lesson', xpReward: 70 },
        { id: 'c6', title: 'Reactions Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'c7', title: 'Acids & Bases', icon: '🧫', type: 'lesson', xpReward: 70 },
        { id: 'c8', title: 'Chemistry Boss Quiz', icon: '🏆', type: 'boss', xpReward: 200, passMark: 70 }
      ]
    },
    biology: {
      label: 'Biology',
      chapters: [
        { id: 'b1', title: 'Cell Biology', icon: '🔬', type: 'lesson', xpReward: 50 },
        { id: 'b2', title: 'Cell Biology Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'b3', title: 'Human Digestive System', icon: '🫀', type: 'lesson', xpReward: 60 },
        { id: 'b4', title: 'Digestive System Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'b5', title: 'Plant Kingdom', icon: '🌱', type: 'lesson', xpReward: 60 },
        { id: 'b6', title: 'Plant Kingdom Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'b7', title: 'Genetics & Evolution', icon: '🧬', type: 'lesson', xpReward: 70 },
        { id: 'b8', title: 'Biology Boss Quiz', icon: '🏆', type: 'boss', xpReward: 200, passMark: 70 }
      ]
    },
    coding: {
      label: 'Coding',
      chapters: [
        { id: 'co1', title: 'Intro to Programming', icon: '👋', type: 'lesson', xpReward: 50 },
        { id: 'co2', title: 'Intro Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'co3', title: 'Variables & Data Types', icon: '📦', type: 'lesson', xpReward: 60 },
        { id: 'co4', title: 'Variables Quiz', icon: '📝', type: 'quiz', xpReward: 100, passMark: 70 },
        { id: 'co5', title: 'Loops & Conditions', icon: '🔁', type: 'lesson', xpReward: 70 },
        { id: 'co6', title: 'Loops Quiz', icon: '📝', type: 'quiz', xpReward: 120, passMark: 70 },
        { id: 'co7', title: 'Functions', icon: '⚙️', type: 'lesson', xpReward: 70 },
        { id: 'co8', title: 'Coding Boss Quiz', icon: '🏆', type: 'boss', xpReward: 200, passMark: 70 }
      ]
    }
  }

  for (const [subject, data] of Object.entries(curriculumData)) {
    for (let i = 0; i < data.chapters.length; i++) {
      const chap = data.chapters[i]
      try {
        await prisma.chapter.upsert({
          where: {
            chapterId_subject: {
              chapterId: chap.id,
              subject
            }
          },
          update: {},
          create: {
            chapterId: chap.id,
            subject,
            title: chap.title,
            type: chap.type,
            xpReward: chap.xpReward,
            passMark: chap.passMark || 70,
            icon: chap.icon,
            order: i + 1
          }
        })
      } catch (e) {
        console.warn(`[Seed] Chapter ${chap.id} seed issue:`, (e as Error).message)
      }
    }
  }

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })

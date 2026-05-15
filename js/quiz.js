/* ============================================================
   VIDYASPARK — quiz.js
   Quiz Engine (Phase 6)
   Handles: MCQ rendering, timer, scoring, pass/fail,
            XP award, level unlock, result persistence
   ============================================================ */

'use strict';

/* ── Question Bank ──────────────────────────────────────────
   Format per question:
   { id, q: text, options: [A,B,C,D], answer: 0-based index,
     explanation: text }
   ──────────────────────────────────────────────────────── */
const QUESTION_BANK = {
  /* ── MATH ── */
  m2: [
    { id:'m2q1', q:'What type of number is √2?',                             options:['Rational','Irrational','Integer','Natural'],    answer:1, explanation:'√2 cannot be expressed as p/q, so it is irrational.' },
    { id:'m2q2', q:'Which of these is NOT a real number?',                   options:['π','√(-1)','0.333…','100'],                    answer:1, explanation:'√(-1) = i, an imaginary number, not real.' },
    { id:'m2q3', q:'The decimal expansion of 1/3 is:',                      options:['0.333…','0.5','0.25','1.3'],                   answer:0, explanation:'1÷3 = 0.333… (non-terminating repeating).' },
    { id:'m2q4', q:'Every integer is a:',                                   options:['Irrational number','Rational number','Neither','Only natural'], answer:1, explanation:'Any integer n = n/1, satisfying the rational definition.' },
    { id:'m2q5', q:'√9 equals:',                                            options:['4','±3','3','81'],                             answer:2, explanation:'√9 = 3 (principal/positive square root).' },
  ],
  m4: [
    { id:'m4q1', q:'Solve: 2x + 5 = 13',                                    options:['x=3','x=4','x=9','x=5'],                      answer:1, explanation:'2x = 13–5 = 8, x = 4.' },
    { id:'m4q2', q:'Which property says a(b+c) = ab + ac?',                  options:['Commutative','Associative','Distributive','Identity'],answer:2, explanation:'Distributive property of multiplication over addition.' },
    { id:'m4q3', q:'Simplify: 3x + 2x – x',                                options:['4x','5x','6x','3x'],                           answer:0, explanation:'3x + 2x – x = (3+2–1)x = 4x.' },
    { id:'m4q4', q:'If x = 5, find 3x² – 2x + 1',                         options:['64','66','70','76'],                           answer:1, explanation:'3(25) – 2(5) + 1 = 75 – 10 + 1 = 66.' },
    { id:'m4q5', q:'The degree of polynomial 4x³ – x² + 7 is:',            options:['1','2','3','7'],                               answer:2, explanation:'Highest power of x is 3.' },
  ],
  m6: [
    { id:'m6q1', q:'Solve: x/2 + 3 = 7',                                   options:['x=4','x=8','x=2','x=10'],                     answer:1, explanation:'x/2 = 4, so x = 8.' },
    { id:'m6q2', q:'Two numbers differ by 4; their sum is 20. Smaller = ?', options:['6','7','8','9'],                               answer:2, explanation:'x + (x+4) = 20 → x = 8.' },
    { id:'m6q3', q:'What is the solution of 3x – 9 = 0?',                  options:['x=0','x=3','x=6','x=9'],                      answer:1, explanation:'3x = 9, x = 3.' },
    { id:'m6q4', q:'A linear equation in two variables has:',               options:['One solution','Two solutions','Infinitely many','No solution'], answer:2, explanation:'A line contains infinitely many points.' },
    { id:'m6q5', q:'In ax + b = 0, x equals:',                             options:['-b/a','a/b','-a/b','b/a'],                    answer:0, explanation:'ax = –b, so x = –b/a.' },
  ],
  m8: [
    { id:'m8q1', q:'Sum of angles in a triangle is:',                       options:['90°','180°','270°','360°'],                   answer:1, explanation:'Triangle angle sum = 180°.' },
    { id:'m8q2', q:'Area of a circle with radius 7 cm (π≈22/7):',           options:['44 cm²','154 cm²','22 cm²','308 cm²'],        answer:1, explanation:'A = πr² = (22/7)×49 = 154 cm².' },
    { id:'m8q3', q:'Pythagoras: If a=3, b=4, hypotenuse c = ?',             options:['5','6','7','8'],                               answer:0, explanation:'c = √(9+16) = √25 = 5.' },
    { id:'m8q4', q:'Parallel lines cut by transversal: alternate angles are:', options:['Supplementary','Equal','Complementary','Adjacent'], answer:1, explanation:'Alternate interior angles are equal.' },
    { id:'m8q5', q:'Perimeter of equilateral triangle with side 6 cm:',     options:['12 cm','18 cm','24 cm','36 cm'],              answer:1, explanation:'P = 3×6 = 18 cm.' },
  ],
  m10: [
    { id:'m10q1', q:'Mean of 4, 8, 12, 16, 20 is:',                        options:['10','12','14','16'],                           answer:1, explanation:'Sum=60, count=5, mean=12.' },
    { id:'m10q2', q:'Median of 3, 7, 9, 15, 21 is:',                       options:['7','9','10','15'],                             answer:1, explanation:'Middle value of sorted data = 9.' },
    { id:'m10q3', q:'Mode of 2, 3, 3, 5, 7, 7, 7 is:',                    options:['2','3','5','7'],                               answer:3, explanation:'7 appears 3 times (most frequent).' },
    { id:'m10q4', q:'P(A) of rolling a "6" on a fair die:',                options:['1/2','1/3','1/6','1/12'],                      answer:2, explanation:'One favorable out of 6 outcomes = 1/6.' },
    { id:'m10q5', q:'Range of 10, 15, 20, 25, 30 is:',                     options:['10','15','20','25'],                           answer:2, explanation:'Range = max – min = 30 – 10 = 20.' },
  ],

  /* ── PHYSICS ── */
  p2: [
    { id:'p2q1', q:'Speed = Distance ÷ ?',                                  options:['Mass','Time','Force','Acceleration'],          answer:1, explanation:'Speed = Distance / Time.' },
    { id:'p2q2', q:'Velocity is a __ quantity.',                            options:['Scalar','Vector','Constant','Base'],           answer:1, explanation:'Velocity has both magnitude and direction.' },
    { id:'p2q3', q:'SI unit of acceleration:',                              options:['m/s','m/s²','km/h','N'],                       answer:1, explanation:'Acceleration = m/s².' },
    { id:'p2q4', q:'A car goes 60 km in 2 h. Its average speed =',         options:['30 km/h','60 km/h','120 km/h','15 km/h'],      answer:0, explanation:'Speed = 60/2 = 30 km/h.' },
    { id:'p2q5', q:'Uniform motion means:',                                 options:['Constant speed','Changing speed','Acceleration','None'], answer:0, explanation:'Equal distances in equal time intervals.' },
  ],
  p4: [
    { id:'p4q1', q:'Newton\'s 1st Law is also called:',                     options:['Law of Force','Law of Inertia','Law of Action','Gravity'], answer:1, explanation:'Objects remain at rest or uniform motion unless acted upon.' },
    { id:'p4q2', q:'F = m × a stands for Newton\'s __ Law',                options:['1st','2nd','3rd','4th'],                       answer:1, explanation:'Second Law: Net force = mass × acceleration.' },
    { id:'p4q3', q:'Unit of force in SI system:',                           options:['Joule','Watt','Newton','Pascal'],              answer:2, explanation:'Force is measured in Newtons (N).' },
    { id:'p4q4', q:'Action and reaction forces act on:',                    options:['Same body','Different bodies','Neither','Air'], answer:1, explanation:'Newton\'s 3rd Law: forces act on different bodies.' },
    { id:'p4q5', q:'A 5 kg object with acceleration 3 m/s² has force:',    options:['8 N','15 N','2 N','1.67 N'],                   answer:1, explanation:'F = 5 × 3 = 15 N.' },
  ],
  p6: [
    { id:'p6q1', q:'Value of g on Earth\'s surface (approx):',             options:['9.8 m/s²','10.8 m/s²','5.4 m/s²','1.6 m/s²'],answer:0, explanation:'g ≈ 9.8 m/s² near Earth\'s surface.' },
    { id:'p6q2', q:'Weight of 10 kg mass (g=10):',                         options:['1 N','10 N','100 N','1000 N'],                 answer:2, explanation:'W = mg = 10 × 10 = 100 N.' },
    { id:'p6q3', q:'Gravitational force between objects depends on:',       options:['Color','Mass & Distance','Temperature','Volume'], answer:1, explanation:'F = Gm₁m₂/r².' },
    { id:'p6q4', q:'On the Moon, g is about __ of Earth\'s g:',            options:['1/2','1/4','1/6','1/10'],                      answer:2, explanation:'Moon gravity ≈ 1/6 of Earth.' },
    { id:'p6q5', q:'Escape velocity from Earth ≈:',                        options:['7 km/s','11.2 km/s','20 km/s','3 km/s'],       answer:1, explanation:'≈ 11.2 km/s.' },
  ],
  p8: [
    { id:'p8q1', q:'Speed of light in vacuum:',                             options:['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], answer:1, explanation:'c ≈ 3×10⁸ m/s.' },
    { id:'p8q2', q:'Angle of incidence = Angle of reflection is:',         options:['Refraction','Reflection','Diffraction','Dispersion'], answer:1, explanation:'Law of reflection.' },
    { id:'p8q3', q:'Convex lens is used to correct:',                      options:['Myopia','Hypermetropia','Astigmatism','Color blindness'], answer:1, explanation:'Converging lens corrects far-sightedness.' },
    { id:'p8q4', q:'Rainbow is formed due to:',                            options:['Reflection only','Refraction & Dispersion','Absorption','Scattering'], answer:1, explanation:'White light splits into colors via prism/water droplets.' },
    { id:'p8q5', q:'Focal length of a concave mirror is:',                 options:['Positive','Negative','Zero','Infinite'],       answer:1, explanation:'Concave mirror has negative focal length by convention.' },
  ],

  /* ── CHEMISTRY ── */
  c2: [
    { id:'c2q1', q:'Smallest particle of an element:',                      options:['Molecule','Ion','Atom','Electron'],            answer:2, explanation:'Atom is the smallest unit of an element.' },
    { id:'c2q2', q:'Protons are found in the:',                            options:['Electron shell','Nucleus','Neutron','Orbit'],   answer:1, explanation:'Protons reside in the nucleus.' },
    { id:'c2q3', q:'Atomic number = number of:',                           options:['Neutrons','Protons','Electrons','Nucleons'],    answer:1, explanation:'Atomic number = number of protons.' },
    { id:'c2q4', q:'Atoms with same Z but different mass numbers are:',     options:['Isobars','Isotopes','Ions','Molecules'],       answer:1, explanation:'Isotopes: same protons, different neutrons.' },
    { id:'c2q5', q:'Matter in its gaseous state has:',                     options:['Fixed shape & volume','Fixed volume only','No fixed shape or volume','Fixed shape only'], answer:2, explanation:'Gases have no fixed shape or volume.' },
  ],
  c4: [
    { id:'c4q1', q:'Periods in the modern periodic table:',                options:['6','7','8','9'],                               answer:1, explanation:'7 horizontal rows (periods).' },
    { id:'c4q2', q:'Element in Group 1 (alkali metals):',                  options:['He','Mg','Na','Ca'],                           answer:2, explanation:'Sodium (Na) is in Group 1.' },
    { id:'c4q3', q:'Noble gases are in Group:',                            options:['1','7','17','18'],                             answer:3, explanation:'Group 18 = noble/inert gases.' },
    { id:'c4q4', q:'Atomic size generally __ across a period:',            options:['Increases','Stays same','Decreases','Doubles'], answer:2, explanation:'Z increases → stronger pull → smaller radius.' },
    { id:'c4q5', q:'Valency of Oxygen:',                                   options:['1','2','3','4'],                               answer:1, explanation:'O needs 2 electrons → valency 2.' },
  ],
  c6: [
    { id:'c6q1', q:'H₂ + O₂ → H₂O is a __ reaction',                     options:['Decomposition','Combination','Displacement','Double'], answer:1, explanation:'Two reactants combine to form one product.' },
    { id:'c6q2', q:'Rusting of iron is an example of:',                    options:['Physical change','Reduction','Oxidation','Synthesis'], answer:2, explanation:'Iron reacts with O₂ and H₂O → rust (oxidation).' },
    { id:'c6q3', q:'Balanced equation for burning of methane:',            options:['CH₄+O₂→CO₂+H₂O','CH₄+2O₂→CO₂+2H₂O','CH₄+O₂→CO+H₂O','2CH₄+O₂→2CO+H₂O'], answer:1, explanation:'Balanced: CH₄ + 2O₂ → CO₂ + 2H₂O.' },
    { id:'c6q4', q:'Exothermic reactions:',                                options:['Absorb heat','Release heat','Need light','None'], answer:1, explanation:'Exo = out; energy is released.' },
    { id:'c6q5', q:'CaCO₃ → CaO + CO₂ is:',                              options:['Combination','Decomposition','Displacement','Redox'], answer:1, explanation:'One compound breaks into two = decomposition.' },
  ],
  c8: [
    { id:'c8q1', q:'pH of pure water:',                                    options:['0','7','14','5'],                              answer:1, explanation:'Pure water is neutral, pH = 7.' },
    { id:'c8q2', q:'Acid turns blue litmus:',                              options:['Green','Yellow','Red','Colorless'],            answer:2, explanation:'Acids turn blue litmus red.' },
    { id:'c8q3', q:'Neutralization reaction produces:',                    options:['Acid & Base','Salt & Water','Gas & Water','None'], answer:1, explanation:'Acid + Base → Salt + Water.' },
    { id:'c8q4', q:'HCl is a __ acid:',                                   options:['Weak','Strong','Neutral','Organic'],           answer:1, explanation:'Hydrochloric acid fully dissociates → strong acid.' },
    { id:'c8q5', q:'pH below 7 indicates:',                                options:['Base','Neutral','Acid','Salt'],                answer:2, explanation:'pH < 7 = acidic solution.' },
  ],

  /* ── BIOLOGY ── */
  b2: [
    { id:'b2q1', q:'Cell is the __ unit of life.',                         options:['Chemical','Structural','Functional','Both B & C'], answer:3, explanation:'Cell is both the structural and functional unit.' },
    { id:'b2q2', q:'Mitochondria is the __ of the cell.',                  options:['Brain','Powerhouse','Control center','Security'], answer:1, explanation:'Mitochondria produce ATP energy.' },
    { id:'b2q3', q:'Cell wall is absent in:',                              options:['Plant cells','Fungi','Animal cells','Bacteria'], answer:2, explanation:'Animal cells lack a cell wall.' },
    { id:'b2q4', q:'DNA is found in the:',                                 options:['Cytoplasm','Vacuole','Nucleus','Ribosome'],     answer:2, explanation:'Nucleus houses the DNA/chromosomes.' },
    { id:'b2q5', q:'Photosynthesis occurs in:',                            options:['Mitochondria','Chloroplasts','Nucleus','Ribosomes'], answer:1, explanation:'Chloroplasts contain chlorophyll for photosynthesis.' },
  ],
  b4: [
    { id:'b4q1', q:'Digestion of starch begins in the:',                   options:['Stomach','Small intestine','Mouth','Large intestine'], answer:2, explanation:'Salivary amylase in mouth starts starch digestion.' },
    { id:'b4q2', q:'HCl is secreted by:',                                  options:['Liver','Pancreas','Stomach','Intestine'],       answer:2, explanation:'Gastric glands in stomach produce HCl.' },
    { id:'b4q3', q:'Bile is produced by the:',                             options:['Stomach','Pancreas','Liver','Kidney'],          answer:2, explanation:'Liver produces bile, stored in gall bladder.' },
    { id:'b4q4', q:'Absorption of nutrients mainly occurs in:',            options:['Stomach','Large intestine','Small intestine','Mouth'], answer:2, explanation:'Villi in small intestine absorb nutrients.' },
    { id:'b4q5', q:'Appendix is part of:',                                 options:['Small intestine','Large intestine','Stomach','Rectum'], answer:1, explanation:'Appendix is a vestigial part of the large intestine.' },
  ],
  b6: [
    { id:'b6q1', q:'Photosynthesis equation: 6CO₂ + 6H₂O + light → ?',   options:['C₆H₁₂O₆ + 6O₂','CO₂ + H₂O','C₆H₁₂ + O₂','6CO + H₂O'], answer:0, explanation:'Glucose and oxygen produced.' },
    { id:'b6q2', q:'Xylem transports:',                                    options:['Food','Water & minerals','Both','Oxygen'],      answer:1, explanation:'Xylem = upward transport of water/minerals.' },
    { id:'b6q3', q:'Phloem transports:',                                   options:['Water','Minerals','Prepared food','Air'],       answer:2, explanation:'Phloem carries sugars from leaves.' },
    { id:'b6q4', q:'Stomata is involved in:',                              options:['Absorption','Transpiration & gas exchange','Photosynthesis only','Root growth'], answer:1, explanation:'Stomata regulate gas exchange and transpiration.' },
    { id:'b6q5', q:'Chlorophyll absorbs mostly:',                          options:['Green light','Red & Blue light','Yellow light','UV light'], answer:1, explanation:'Chlorophyll absorbs red and blue wavelengths.' },
  ],
  b8: [
    { id:'b8q1', q:'DNA full form:',                                       options:['Deoxyribonucleic Acid','Diribonucleic Acid','Dinucleic Acid','Deoxyribose Acid'], answer:0, explanation:'DNA = Deoxyribonucleic Acid.' },
    { id:'b8q2', q:'Human body has __ pairs of chromosomes.',              options:['23','24','46','48'],                           answer:0, explanation:'23 pairs = 46 total chromosomes.' },
    { id:'b8q3', q:'Darwin\'s theory is called:',                          options:['Cell theory','Germ theory','Natural Selection','Big Bang'], answer:2, explanation:'Darwin proposed evolution by natural selection.' },
    { id:'b8q4', q:'Mendel used __ plants for his experiments.',           options:['Rose','Pea','Wheat','Maize'],                  answer:1, explanation:'Gregor Mendel used pea plants.' },
    { id:'b8q5', q:'XX chromosomes produce:',                              options:['Male','Female','Neither','Both'],              answer:1, explanation:'XX = female, XY = male.' },
  ],

  /* ── CODING ── */
  co2: [
    { id:'co2q1', q:'An algorithm is:',                                    options:['A program','A step-by-step solution','Hardware','Database'], answer:1, explanation:'An algorithm is a finite set of instructions to solve a problem.' },
    { id:'co2q2', q:'Which is NOT a programming language?',                options:['Python','HTML is a markup but counts','Java','Photoshop'], answer:3, explanation:'Photoshop is software, not a programming language.' },
    { id:'co2q3', q:'Binary uses how many digits?',                        options:['8','10','2','16'],                             answer:2, explanation:'Binary = base-2 system: 0 and 1.' },
    { id:'co2q4', q:'Output of print("Hello") in Python:',                options:['hello','HELLO','Hello','None'],                answer:2, explanation:'Python is case-sensitive; prints exactly Hello.' },
    { id:'co2q5', q:'A bug in code is:',                                   options:['Insect','Error','Feature','None'],             answer:1, explanation:'Bug = an error or flaw in a program.' },
  ],
  co4: [
    { id:'co4q1', q:'int, float, str are examples of:',                   options:['Functions','Variables','Data types','Loops'],  answer:2, explanation:'They define the type of data stored.' },
    { id:'co4q2', q:'x = 5 in Python is:',                                options:['Comparison','Assignment','Function call','Error'], answer:1, explanation:'= is the assignment operator.' },
    { id:'co4q3', q:'Concatenation joins:',                                options:['Numbers','Strings','Lists','Files'],           answer:1, explanation:'String concatenation joins text together.' },
    { id:'co4q4', q:'Which stores True/False values?',                     options:['int','float','bool','str'],                   answer:2, explanation:'Boolean (bool) stores True or False.' },
    { id:'co4q5', q:'len("VidyaSpark") returns:',                         options:['9','10','11','8'],                             answer:1, explanation:'"VidyaSpark" has 10 characters.' },
  ],
  co6: [
    { id:'co6q1', q:'for i in range(5): executes body __ times.',          options:['4','5','6','∞'],                              answer:1, explanation:'range(5) = 0,1,2,3,4 → 5 iterations.' },
    { id:'co6q2', q:'while loop runs until its condition is:',             options:['True','False','Zero','None'],                 answer:1, explanation:'Loop exits when condition becomes False.' },
    { id:'co6q3', q:'if x > 0: else: — the else block runs when:',       options:['x>0','x<=0','x==0','Never'],                  answer:1, explanation:'else runs when the if condition is False.' },
    { id:'co6q4', q:'break statement:',                                    options:['Skips current iteration','Ends loop entirely','Pauses loop','Repeats'], answer:1, explanation:'break immediately exits the loop.' },
    { id:'co6q5', q:'continue statement:',                                 options:['Ends loop','Skips rest of iteration, continues next','Restarts loop','Does nothing'], answer:1, explanation:'continue skips to the next iteration.' },
  ],
  co8: [
    { id:'co8q1', q:'def is used to:',                                     options:['Import module','Define a function','Declare variable','Loop'], answer:1, explanation:'def keyword defines a function in Python.' },
    { id:'co8q2', q:'return in a function:',                               options:['Prints output','Sends back a value','Ends program','Loops'], answer:1, explanation:'return passes the result back to the caller.' },
    { id:'co8q3', q:'Recursion means a function calls:',                   options:['Another function','Itself','A loop','None'],  answer:1, explanation:'Recursive functions call themselves.' },
    { id:'co8q4', q:'def add(a,b): return a+b → add(3,4) = ?',           options:['34','7','12','Error'],                        answer:1, explanation:'3 + 4 = 7.' },
    { id:'co8q5', q:'A function without return gives:',                   options:['0','None','Error','Empty string'],            answer:1, explanation:'Python functions return None implicitly.' },
  ],
};

/* ── Quiz Engine ──────────────────────────────────────────*/
const QuizEngine = (() => {

  let _state = {
    subject: null,
    chapterId: null,
    questions: [],
    current: 0,
    answers: [],          // user's chosen index per question
    timer: null,
    timeLeft: 0,
    started: false,
    finished: false,
    uid: null,
    lang: 'en'
  };

  const SECONDS_PER_QUESTION = 30;
  const PASS_MARK = 70;

  /* ── init ── */
  async function init(chapterId, subject, uid, lang = 'en') {
    _state.subject   = subject;
    _state.chapterId = chapterId;
    _state.uid       = uid;
    _state.lang      = lang;
    _state.current   = 0;
    _state.answers   = [];
    _state.finished  = false;

    // Load questions
    const bank = QUESTION_BANK[chapterId];
    if (!bank || bank.length === 0) {
      _state.questions = generateFallbackQuestions(chapterId);
    } else {
      // Shuffle questions
      _state.questions = shuffleArray([...bank]);
    }
    _state.answers = new Array(_state.questions.length).fill(null);
    _state.timeLeft = _state.questions.length * SECONDS_PER_QUESTION;

    renderQuiz();
  }

  /* ── shuffleArray ── */
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /* ── generateFallbackQuestions (generic) ── */
  function generateFallbackQuestions(chapterId) {
    return [
      { id:'fq1', q:'This is a sample question. Choose the correct answer.', options:['Option A','Option B','Option C','Option D'], answer:0, explanation:'Option A is correct for this placeholder.' },
      { id:'fq2', q:'Which of the following is TRUE?',                       options:['All of the above','None of the above','Only A','Depends'], answer:0, explanation:'Placeholder explanation.' },
      { id:'fq3', q:'What is the best approach to learning?',                options:['Practice daily','Cram before exam','Skip topics','None'], answer:0, explanation:'Consistent daily practice is most effective.' },
    ];
  }

  /* ── renderQuiz ── */
  function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const q = _state.questions[_state.current];
    const total = _state.questions.length;
    const pct = Math.round((_state.current / total) * 100);
    const letters = ['A', 'B', 'C', 'D'];

    container.innerHTML = `
      <div class="quiz-container">
        <!-- Progress bar -->
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" id="quiz-fill" style="width:${pct}%;"></div>
        </div>

        <!-- Header -->
        <div class="quiz-header">
          <div>
            <span style="font-weight:800;font-size:1rem;">Question ${_state.current+1} of ${total}</span>
            <div style="font-size:.8rem;color:var(--text-muted);" id="quiz-chapter-label"></div>
          </div>
          <div class="quiz-timer" id="quiz-timer">⏱ ${formatTime(_state.timeLeft)}</div>
        </div>

        <!-- Question card -->
        <div class="card" style="margin-bottom:1.5rem;">
          <div class="quiz-question" id="quiz-q-text">${q.q}</div>
          <div class="quiz-options" id="quiz-options">
            ${q.options.map((opt, i) => `
              <div class="quiz-option ${_state.answers[_state.current]===i?'selected':''}"
                   data-index="${i}"
                   onclick="QuizEngine.selectOption(${i})"
                   id="opt-${i}">
                <div class="option-letter">${letters[i]}</div>
                <div>${opt}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Navigation -->
        <div style="display:flex;gap:1rem;justify-content:space-between;align-items:center;">
          <button class="btn btn-outline btn-sm" onclick="QuizEngine.prev()"
            ${_state.current===0?'disabled':''}>← Previous</button>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;justify-content:center;" id="dot-nav">
            ${_state.questions.map((_,i)=>`
              <div style="width:10px;height:10px;border-radius:50%;background:${
                i===_state.current?'var(--primary)':
                _state.answers[i]!==null?'var(--success)':
                'var(--border)'
              };cursor:pointer;transition:background .2s;" onclick="QuizEngine.goTo(${i})"></div>
            `).join('')}
          </div>
          ${_state.current < total-1
            ? `<button class="btn btn-primary btn-sm" onclick="QuizEngine.next()">Next →</button>`
            : `<button class="btn btn-success btn-sm" onclick="QuizEngine.submit()">Submit Quiz ✅</button>`
          }
        </div>
      </div>
    `;

    // Start timer if not started
    if (!_state.started) {
      _state.started = true;
      startTimer();
    }
  }

  /* ── selectOption ── */
  function selectOption(index) {
    if (_state.finished) return;
    _state.answers[_state.current] = index;

    // Update UI
    document.querySelectorAll('.quiz-option').forEach((el, i) => {
      el.classList.toggle('selected', i === index);
    });

    // Dot nav update
    const dots = document.querySelectorAll('#dot-nav div');
    if (dots[_state.current]) dots[_state.current].style.background = 'var(--success)';

    // Auto-advance after 600ms
    if (_state.current < _state.questions.length - 1) {
      setTimeout(() => next(), 600);
    }
  }

  /* ── navigation ── */
  function next() {
    if (_state.current < _state.questions.length - 1) {
      _state.current++;
      renderQuiz();
    }
  }

  function prev() {
    if (_state.current > 0) {
      _state.current--;
      renderQuiz();
    }
  }

  function goTo(index) {
    _state.current = index;
    renderQuiz();
  }

  /* ── timer ── */
  function startTimer() {
    _state.timer = setInterval(() => {
      _state.timeLeft--;
      const el = document.getElementById('quiz-timer');
      if (el) {
        el.textContent = '⏱ ' + formatTime(_state.timeLeft);
        if (_state.timeLeft <= 30) el.classList.add('warning');
        if (_state.timeLeft <= 10) el.style.background = '#dc2626';
      }
      if (_state.timeLeft <= 0) {
        clearInterval(_state.timer);
        submit(true);
      }
    }, 1000);
  }

  function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2,'0');
    const s = (secs % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  /* ── submit ── */
  async function submit(timedOut = false) {
    clearInterval(_state.timer);
    _state.finished = true;

    // Score calculation
    let correct = 0;
    _state.questions.forEach((q, i) => {
      if (_state.answers[i] === q.answer) correct++;
    });
    const score = Math.round((correct / _state.questions.length) * 100);
    const passed = score >= PASS_MARK;

    // Get XP from curriculum
    const subj = window.CURRICULUM?.[_state.subject];
    const ch   = subj?.chapters.find(c => c.id === _state.chapterId);
    const xpEarned = passed ? (ch?.xpReward || 100) : Math.floor((ch?.xpReward || 100) * 0.25);

    // Save result
    await saveResult(score, passed, xpEarned, correct);

    // Render results screen
    renderResults(score, passed, correct, xpEarned, timedOut);
  }

  /* ── saveResult ── */
  async function saveResult(score, passed, xpEarned, correct) {
    if (!_state.uid) return;

    const result = {
      chapterId: _state.chapterId,
      subject:   _state.subject,
      score,
      passed,
      xpEarned,
      correct,
      total: _state.questions.length,
      timestamp: Date.now()
    };

    try {
      const userRef = firebase.firestore().collection('users').doc(_state.uid);
      await userRef.update({
        [`quizResults.${_state.chapterId}`]: result,
        xp: firebase.firestore.FieldValue.increment(xpEarned),
      });

      if (passed) {
        await userRef.update({
          [`progress.${_state.subject}.${_state.chapterId}`]: {
            status: 'done',
            score,
            completedAt: Date.now()
          }
        });
      }
    } catch(e) {
      // localStorage fallback
      const key = `quiz_${_state.uid}_${_state.chapterId}`;
      localStorage.setItem(key, JSON.stringify(result));
      const profile = JSON.parse(localStorage.getItem(`profile_${_state.uid}`) || '{}');
      profile.xp = (profile.xp || 0) + xpEarned;
      if (passed) {
        const progKey = `progress_${_state.uid}_${_state.subject}`;
        const prog = JSON.parse(localStorage.getItem(progKey) || '{}');
        prog[_state.chapterId] = { status:'done', score, completedAt: Date.now() };
        localStorage.setItem(progKey, JSON.stringify(prog));
      }
      localStorage.setItem(`profile_${_state.uid}`, JSON.stringify(profile));
    }
  }

  /* ── renderResults ── */
  function renderResults(score, passed, correct, xpEarned, timedOut) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    // Confetti for pass
    if (passed) {
      setTimeout(() => window.launchConfetti?.(), 300);
    }

    // Show XP popup
    setTimeout(() => window.XPSystem?.showPopup(xpEarned), 600);

    const reviewHtml = _state.questions.map((q, i) => {
      const chosen = _state.answers[i];
      const isRight = chosen === q.answer;
      const letters = ['A','B','C','D'];
      return `
        <div style="margin-bottom:1.25rem;padding:1rem;border-radius:var(--radius);background:${isRight?'#d1fae5':'#fee2e2'};border:2px solid ${isRight?'var(--success)':'var(--danger)'};">
          <div style="font-weight:700;margin-bottom:.5rem;">${i+1}. ${q.q}</div>
          ${q.options.map((opt,oi) => `
            <div style="padding:.35rem .75rem;border-radius:8px;margin:.2rem 0;
              background:${oi===q.answer?'#d1fae5':oi===chosen&&!isRight?'#fee2e2':'transparent'};
              font-weight:${oi===q.answer?'700':'400'};
              color:${oi===q.answer?'#065f46':oi===chosen&&!isRight?'#991b1b':'inherit'}">
              ${oi===q.answer?'✅':oi===chosen&&!isRight?'❌':'⬜'} ${letters[oi]}. ${opt}
            </div>
          `).join('')}
          <div style="margin-top:.5rem;font-size:.85rem;color:var(--text-muted);font-style:italic;">💡 ${q.explanation}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="quiz-container">
        <div class="score-display">
          ${timedOut ? '<div style="color:var(--warning);font-weight:700;margin-bottom:.5rem;">⏱ Time\'s up!</div>' : ''}
          <div class="score-circle ${passed?'pass':'fail'}">
            <div class="score-pct">${score}%</div>
            <div class="score-label">${passed?'PASSED':'FAILED'}</div>
          </div>
          <h2>${passed ? '🎉 Congratulations!' : '😔 Keep Trying!'}</h2>
          <p style="color:var(--text-muted);margin:.5rem 0;">
            You got <strong>${correct} / ${_state.questions.length}</strong> correct.
            ${passed ? `You earned <strong>+${xpEarned} XP</strong>!` : `You need ${PASS_MARK}% to pass. You earned +${xpEarned} XP for trying.`}
          </p>
          ${!passed ? `<p style="color:var(--danger);font-size:.9rem;">Pass mark: ${PASS_MARK}% — Try again!</p>` : ''}
        </div>

        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;margin:1.5rem 0;">
          ${passed
            ? `<a href="/student/game.html?subject=${_state.subject}" class="btn btn-success">Continue Map 🗺️</a>`
            : `<button class="btn btn-primary" onclick="QuizEngine.retry()">Try Again 🔄</button>`
          }
          <a href="/student/dashboard.html" class="btn btn-outline">Dashboard 🏠</a>
        </div>

        <!-- Answer Review -->
        <div class="card">
          <h3 style="margin-bottom:1rem;">📋 Answer Review</h3>
          ${reviewHtml}
        </div>
      </div>
    `;
  }

  /* ── retry ── */
  function retry() {
    _state.started  = false;
    _state.finished = false;
    clearInterval(_state.timer);
    init(_state.chapterId, _state.subject, _state.uid, _state.lang);
  }

  return {
    init, selectOption, next, prev, goTo, submit, retry
  };
})();

window.QuizEngine = QuizEngine;
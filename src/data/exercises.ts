export interface Exercise {
  name: string;
  nameAr: string;
  muscle: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  nameAr: string;
  emoji: string;
  exercises: Exercise[];
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: "glutes",
    name: "Glutes",
    nameAr: "الجلوتس",
    emoji: "🍑",
    exercises: [
      { name: "Hip Thrust", nameAr: "هيب ثرست", muscle: "Glutes" },
      { name: "Glute Bridge", nameAr: "جلوت بريدج", muscle: "Glutes" },
      { name: "Romanian Deadlift", nameAr: "روماني ديد ليفت", muscle: "Glutes" },
      { name: "Sumo Deadlift", nameAr: "سومو ديد ليفت", muscle: "Glutes" },
      { name: "Cable Kickback", nameAr: "كيبل كيك باك", muscle: "Glutes" },
      { name: "Donkey Kick", nameAr: "دوني كيك", muscle: "Glutes" },
      { name: "Fire Hydrant", nameAr: "فاير هايدرانت", muscle: "Glutes" },
      { name: "Single Leg Hip Thrust", nameAr: "هيب ثرست رجل واحدة", muscle: "Glutes" },
    ],
  },
  {
    id: "legs",
    name: "Legs",
    nameAr: "الرجل",
    emoji: "🦵",
    exercises: [
      { name: "Barbell Squat", nameAr: "باربيل سكوات", muscle: "Legs" },
      { name: "Leg Press", nameAr: "ليج بريس", muscle: "Legs" },
      { name: "Leg Extension", nameAr: "ليج اكستنشن", muscle: "Legs" },
      { name: "Lunge", nameAr: "لانج", muscle: "Legs" },
      { name: "Bulgarian Split Squat", nameAr: "بولجاريان سبليت سكوات", muscle: "Legs" },
      { name: "Goblet Squat", nameAr: "جوبليت سكوات", muscle: "Legs" },
      { name: "Hack Squat", nameAr: "هاك سكوات", muscle: "Legs" },
      { name: "Sumo Squat", nameAr: "سومو سكوات", muscle: "Legs" },
      { name: "Lying Leg Curl", nameAr: "ليج كيرل مستلقي", muscle: "Legs" },
      { name: "Seated Leg Curl", nameAr: "ليج كيرل جلوس", muscle: "Legs" },
      { name: "Stiff Leg Deadlift", nameAr: "ستيف ليج ديد ليفت", muscle: "Legs" },
      { name: "Good Morning", nameAr: "جود مورنينج", muscle: "Legs" },
      { name: "Standing Calf Raise", nameAr: "ستاندينج كالف ريز", muscle: "Legs" },
      { name: "Seated Calf Raise", nameAr: "سيتيد كالف ريز", muscle: "Legs" },
      { name: "Leg Press Calf Raise", nameAr: "ليج بريس كالف ريز", muscle: "Legs" },
      { name: "Donkey Calf Raise", nameAr: "دوني كالف ريز", muscle: "Legs" },
    ],
  },
  {
    id: "chest",
    name: "Chest",
    nameAr: "الصدر",
    emoji: "💪",
    exercises: [
      { name: "Barbell Bench Press", nameAr: "باربيل بنش بريس", muscle: "Chest" },
      { name: "Incline Bench Press", nameAr: "انكلاين بنش بريس", muscle: "Chest" },
      { name: "Decline Bench Press", nameAr: "ديكلاين بنش بريس", muscle: "Chest" },
      { name: "Dumbbell Fly", nameAr: "دمبل فلاي", muscle: "Chest" },
      { name: "Cable Chest Fly", nameAr: "كيبل فلاي للصدر", muscle: "Chest" },
      { name: "Push Up", nameAr: "بوش اب", muscle: "Chest" },
      { name: "Dumbbell Bench Press", nameAr: "دمبل بنش بريس", muscle: "Chest" },
      { name: "Chest Dip", nameAr: "ديب للصدر", muscle: "Chest" },
    ],
  },
  {
    id: "back",
    name: "Back",
    nameAr: "الظهر",
    emoji: "🏋️",
    exercises: [
      { name: "Lat Pulldown", nameAr: "لات بول داون", muscle: "Back" },
      { name: "Pull Up", nameAr: "بول اب", muscle: "Back" },
      { name: "Seated Cable Row", nameAr: "سيتيد كيبل رو", muscle: "Back" },
      { name: "Bent Over Row", nameAr: "بنت اوفر رو", muscle: "Back" },
      { name: "One Arm Dumbbell Row", nameAr: "دمبل رو يد واحدة", muscle: "Back" },
      { name: "Deadlift", nameAr: "ديد ليفت", muscle: "Back" },
      { name: "T-Bar Row", nameAr: "تي بار رو", muscle: "Back" },
      { name: "Face Pull", nameAr: "فيس بول", muscle: "Back" },
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders",
    nameAr: "الكتف",
    emoji: "🎯",
    exercises: [
      { name: "Barbell Overhead Press", nameAr: "باربيل اوفر هيد بريس", muscle: "Shoulders" },
      { name: "Dumbbell Shoulder Press", nameAr: "دمبل شولدر بريس", muscle: "Shoulders" },
      { name: "Lateral Raise", nameAr: "لاترال ريز", muscle: "Shoulders" },
      { name: "Front Raise", nameAr: "فرونت ريز", muscle: "Shoulders" },
      { name: "Arnold Press", nameAr: "ارنولد بريس", muscle: "Shoulders" },
      { name: "Upright Row", nameAr: "ابرايت رو", muscle: "Shoulders" },
      { name: "Reverse Fly", nameAr: "ريفيرس فلاي", muscle: "Shoulders" },
      { name: "Cable Lateral Raise", nameAr: "كيبل لاترال ريز", muscle: "Shoulders" },
    ],
  },
  {
    id: "arms",
    name: "Arms",
    nameAr: "الذراع",
    emoji: "💪",
    exercises: [
      { name: "Barbell Curl", nameAr: "باربيل كيرل", muscle: "Biceps" },
      { name: "Dumbbell Curl", nameAr: "دمبل كيرل", muscle: "Biceps" },
      { name: "Hammer Curl", nameAr: "هامر كيرل", muscle: "Biceps" },
      { name: "Concentration Curl", nameAr: "كونسنتريشن كيرل", muscle: "Biceps" },
      { name: "Cable Pushdown", nameAr: "كيبل بوش داون", muscle: "Triceps" },
      { name: "Skull Crusher", nameAr: "سكال كراشر", muscle: "Triceps" },
      { name: "Overhead Tricep Extension", nameAr: "اوفر هيد تراي سبس", muscle: "Triceps" },
      { name: "Tricep Dip", nameAr: "تراي سبس ديب", muscle: "Triceps" },
    ],
  },
  {
    id: "core",
    name: "Core & Abs",
    nameAr: "البطن والكور",
    emoji: "⚡",
    exercises: [
      { name: "Plank", nameAr: "بلانك", muscle: "Core" },
      { name: "Crunch", nameAr: "كرانش", muscle: "Core" },
      { name: "Leg Raise", nameAr: "ليج ريز", muscle: "Core" },
      { name: "Russian Twist", nameAr: "روسيان تويست", muscle: "Core" },
      { name: "Bicycle Crunch", nameAr: "بايسيكل كرانش", muscle: "Core" },
      { name: "Side Plank", nameAr: "سايد بلانك", muscle: "Core" },
      { name: "Mountain Climber", nameAr: "ماونتن كلايمبر", muscle: "Core" },
      { name: "Ab Wheel Rollout", nameAr: "اب ويل رول اوت", muscle: "Core" },
    ],
  },
  {
    id: "cardio",
    name: "Cardio",
    nameAr: "كارديو",
    emoji: "🏃",
    exercises: [
      { name: "Jump Rope", nameAr: "حبل قفز", muscle: "Cardio" },
      { name: "Jumping Jacks", nameAr: "جامبينج جاكس", muscle: "Cardio" },
      { name: "Burpee", nameAr: "بيربي", muscle: "Cardio" },
      { name: "High Knees", nameAr: "هاي نيز", muscle: "Cardio" },
      { name: "Box Jump", nameAr: "بوكس جامب", muscle: "Cardio" },
      { name: "Battle Ropes", nameAr: "باتل روبس", muscle: "Cardio" },
      { name: "Tuck Jump", nameAr: "تاك جامب", muscle: "Cardio" },
      { name: "Bear Crawl", nameAr: "بير كرول", muscle: "Cardio" },
    ],
  },
];

export const ALL_EXERCISES = MUSCLE_GROUPS.flatMap((g) => g.exercises);

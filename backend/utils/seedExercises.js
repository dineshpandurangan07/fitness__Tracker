const Exercise = require('../models/Exercise');

const initialExercises = [
  // CHEST
  {
    name: 'Push Ups',
    muscleGroup: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'A fundamental bodyweight movement that builds chest, shoulder, and tricep strength while activating the core.',
    instructions: [
      'Start in a high plank position with hands slightly wider than shoulder-width.',
      'Lower your body until your chest almost touches the floor, keeping elbows at a 45-degree angle.',
      'Push through your palms to press back up to the starting position.'
    ]
  },
  {
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    equipment: 'Barbell & Bench',
    difficulty: 'Intermediate',
    description: 'The premier compound barbell lift for developing upper body pushing power and pectoral hypertrophy.',
    instructions: [
      'Lie flat on the bench with eyes beneath the racked bar and feet planted firmly on the floor.',
      'Grip the bar slightly wider than shoulder-width and unrack it directly over your chest.',
      'Lower the bar under control to mid-chest, then press forcefully back up to full lockout.'
    ]
  },
  {
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    equipment: 'Dumbbells & Incline Bench',
    difficulty: 'Intermediate',
    description: 'Focuses heavily on the clavicular head (upper chest) and anterior deltoids.',
    instructions: [
      'Set an adjustable bench to an incline angle between 30 and 45 degrees.',
      'Hold dumbbells at chest height and press them upward until arms are extended.',
      'Lower dumbbells slowly until you feel a deep stretch in the upper pectorals.'
    ]
  },
  {
    name: 'Cable Chest Flyes',
    muscleGroup: 'Chest',
    equipment: 'Cable Machine',
    difficulty: 'Intermediate',
    description: 'Provides constant tension throughout the entire pectoral contraction arc.',
    instructions: [
      'Set cable pulleys at chest height and grasp handles with a slight bend in the elbows.',
      'Step forward slightly and bring hands together in front of your chest in a hugging motion.',
      'Slowly reverse the movement until you feel a stretch across your chest.'
    ]
  },

  // BACK
  {
    name: 'Pull Ups',
    muscleGroup: 'Back',
    equipment: 'Pull Up Bar',
    difficulty: 'Advanced',
    description: 'The gold standard bodyweight pulling movement for widening the latissimus dorsi.',
    instructions: [
      'Grasp the bar with an overhand grip wider than shoulder width.',
      'Pull your chest up toward the bar by driving your elbows down and back.',
      'Pause when chin clears the bar, then lower with full control to full extension.'
    ]
  },
  {
    name: 'Barbell Deadlift',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    description: 'A master compound lift targeting the posterior chain, lower back, traps, glutes, and hamstrings.',
    instructions: [
      'Stand with feet hip-width apart and bar over midfoot. Hinge at hips and grip the bar.',
      'Flatten spine, pull slack out of the bar, and drive through heels to stand upright.',
      'Lock out hips and knees, then return the bar along your shins back to the floor.'
    ]
  },
  {
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'Builds back thickness, mid-trap strength, and rhomboid muscularity.',
    instructions: [
      'Hinge forward at the hips with a flat back at roughly 45 degrees.',
      'Pull the bar up toward your lower ribcage, squeezing your shoulder blades together.',
      'Lower under control without rounding your lower back.'
    ]
  },
  {
    name: 'Lat Pulldown',
    muscleGroup: 'Back',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Great for developing lat engagement and upper body vertical pulling strength.',
    instructions: [
      'Sit comfortably at the lat pulldown machine and grip the wide bar.',
      'Pull the bar down towards your upper collarbone while arching chest slightly.',
      'Slowly return the bar to the top position with arms extended.'
    ]
  },

  // SHOULDERS
  {
    name: 'Overhead Shoulder Press',
    muscleGroup: 'Shoulders',
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    description: 'Builds boulder shoulders and overhead stabilization power.',
    instructions: [
      'Hold the bar or dumbbells at collarbone level with core braced.',
      'Press straight up overhead until elbows lock out, keeping head neutral.',
      'Lower under control back to front deltoids.'
    ]
  },
  {
    name: 'Lateral Dumbbell Raises',
    muscleGroup: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Isolates the lateral deltoid to create wider, broader shoulder capping.',
    instructions: [
      'Stand upright holding dumbbells at sides with a slight forward lean.',
      'Raise arms out to sides until parallel to the floor, leading with elbows.',
      'Pause momentarily and lower slowly.'
    ]
  },
  {
    name: 'Face Pulls',
    muscleGroup: 'Shoulders',
    equipment: 'Cable Machine & Rope',
    difficulty: 'Beginner',
    description: 'Crucial for posture, rear deltoid development, and rotator cuff longevity.',
    instructions: [
      'Attach a rope to a cable pulley set at eye level.',
      'Pull the rope towards your face, separating hands and rotating forearms up.',
      'Squeeze shoulder blades together and return slowly.'
    ]
  },

  // ARMS
  {
    name: 'Bicep Barbell Curls',
    muscleGroup: 'Arms',
    equipment: 'Barbell',
    difficulty: 'Beginner',
    description: 'Classic bicep mass builder targeting both short and long heads of the biceps.',
    instructions: [
      'Stand tall with feet shoulder-width apart, holding barbell with underhand grip.',
      'Curl the bar upward toward shoulders while pinning elbows to your sides.',
      'Contract biceps firmly at the peak and lower smoothly under tension.'
    ]
  },
  {
    name: 'Tricep Dips',
    muscleGroup: 'Arms',
    equipment: 'Parallel Dip Bars',
    difficulty: 'Intermediate',
    description: 'Intense compound movement isolating triceps and lower chest fibers.',
    instructions: [
      'Support your bodyweight on parallel bars with arms straight.',
      'Bend elbows to lower your body until upper arms are roughly parallel to ground.',
      'Press through palms to lockout at the top.'
    ]
  },
  {
    name: 'Hammer Curls',
    muscleGroup: 'Arms',
    equipment: 'Dumbbells',
    difficulty: 'Beginner',
    description: 'Develops the brachialis and brachioradialis for forearm and arm thickness.',
    instructions: [
      'Hold dumbbells with palms facing each other (neutral grip).',
      'Curl dumbbells upward while maintaining the neutral hand position.',
      'Lower slowly to full arm extension.'
    ]
  },
  {
    name: 'Tricep Cable Pushdowns',
    muscleGroup: 'Arms',
    equipment: 'Cable Machine',
    difficulty: 'Beginner',
    description: 'Effective isolation movement targeting the lateral and medial heads of the triceps.',
    instructions: [
      'Attach a straight bar or rope to a high cable pulley.',
      'Keep elbows pinned at sides and press down until arms are completely straight.',
      'Return up to chest level with control.'
    ]
  },

  // LEGS
  {
    name: 'Barbell Back Squats',
    muscleGroup: 'Legs',
    equipment: 'Barbell & Squat Rack',
    difficulty: 'Advanced',
    description: 'The king of lower body exercises for quadriceps, hamstrings, and glute development.',
    instructions: [
      'Rest barbell securely across upper traps and step back with feet shoulder-width.',
      'Descend by breaking at hips and knees, keeping chest high until thighs pass parallel.',
      'Drive forcefully through mid-foot to stand up.'
    ]
  },
  {
    name: 'Walking Lunges',
    muscleGroup: 'Legs',
    equipment: 'Dumbbells or Bodyweight',
    difficulty: 'Beginner',
    description: 'Unilateral leg builder that challenges balance, quads, and glutes.',
    instructions: [
      'Step forward with one leg and lower back knee toward the floor.',
      'Keep front knee behind toes and torso upright.',
      'Push off front foot and step through directly into the next lunge.'
    ]
  },
  {
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    equipment: 'Barbell or Dumbbells',
    difficulty: 'Intermediate',
    description: 'Exceptional hip-hinge builder emphasizing hamstrings and glutes.',
    instructions: [
      'Hold weight in front of thighs with slight knee bend.',
      'Hinge hips backwards while sliding weight down along the shins.',
      'Feel deep stretch in hamstrings, then thrust hips forward to return to standing.'
    ]
  },
  {
    name: 'Leg Press',
    muscleGroup: 'Legs',
    equipment: 'Leg Press Machine',
    difficulty: 'Beginner',
    description: 'Safely loads quadriceps and glutes with heavy weight support.',
    instructions: [
      'Sit back securely with feet hip-width on sled platform.',
      'Release safety handles and lower sled until knees reach 90 degrees.',
      'Press sled back up without locking knees aggressively.'
    ]
  },

  // CORE
  {
    name: 'Plank',
    muscleGroup: 'Core',
    equipment: 'Bodyweight / Mat',
    difficulty: 'Beginner',
    description: 'Isometric core stability builder strengthening the transverse abdominis.',
    instructions: [
      'Place forearms on the floor directly beneath shoulders, legs extended behind.',
      'Engage glutes, tighten abs, and maintain a straight line from heels to head.',
      'Hold the position without sagging or piking hips.'
    ]
  },
  {
    name: 'Hanging Leg Raises',
    muscleGroup: 'Core',
    equipment: 'Pull Up Bar',
    difficulty: 'Advanced',
    description: 'Targets the lower rectus abdominis and hip flexors.',
    instructions: [
      'Hang from a pull-up bar with straight arms.',
      'Contract lower abdominals to raise legs up until parallel with floor or higher.',
      'Lower legs slowly without swinging your torso.'
    ]
  },
  {
    name: 'Russian Twists',
    muscleGroup: 'Core',
    equipment: 'Bodyweight or Medicine Ball',
    difficulty: 'Beginner',
    description: 'Rotational core exercise strengthening internal and external obliques.',
    instructions: [
      'Sit on the floor with knees bent and lean torso back at a 45-degree angle.',
      'Rotate your torso from side to side, touching the floor on each side.',
      'Elevate feet for higher difficulty.'
    ]
  },

  // CARDIO
  {
    name: 'Treadmill Running / Jogging',
    muscleGroup: 'Cardio',
    equipment: 'Treadmill',
    difficulty: 'Beginner',
    description: 'Aerobic and cardiovascular conditioning to boost endurance and torch calories.',
    instructions: [
      'Warm up with a brisk walk for 3-5 minutes.',
      'Increase speed to a steady jog or run maintaining an upright posture.',
      'Cool down with 3 minutes of slow walking.'
    ]
  },
  {
    name: 'Stationary Cycling (Spin)',
    muscleGroup: 'Cardio',
    equipment: 'Stationary Bike',
    difficulty: 'Beginner',
    description: 'Low-impact cardiovascular conditioning that is gentle on knees while burning high energy.',
    instructions: [
      'Adjust seat height so leg has slight bend at bottom of pedal stroke.',
      'Maintain steady cadence (80-100 RPM) with moderate resistance.',
      'Incorporate sprint intervals for HIIT conditioning.'
    ]
  }
];

const seedExercises = async () => {
  try {
    const count = await Exercise.countDocuments();
    if (count === 0) {
      console.log('Seeding initial exercise database (24 exercises)...');
      await Exercise.insertMany(initialExercises);
      console.log('Exercises seeded successfully!');
    } else {
      console.log(`Exercise database already contains ${count} exercises.`);
    }
  } catch (error) {
    console.error('Error seeding exercises:', error.message);
  }
};

module.exports = { seedExercises, initialExercises };

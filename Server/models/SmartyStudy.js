const mongoose = require("mongoose");

// =========================================================
// FLASHCARD
// =========================================================

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);


// =========================================================
// MCQ
// =========================================================

const mcqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      default: [],
    },

    correctAnswer: {
      type: String,
      default: "",
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);


// =========================================================
// SHORT ANSWER
// =========================================================

const shortAnswerSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      answer: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// DESCRIPTIVE QUESTION
// =========================================================

const questionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      answer: {
        type: String,
        default: "",
      },

      marks: {
        type: Number,
        default: 2,
      },
    },
    { _id: false }
  );


// =========================================================
// SOCRATIC QUESTION
// =========================================================

const socraticSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      expectedDirection: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// TEACH BACK
// =========================================================

const teachBackSchema =
  new mongoose.Schema(
    {
      prompt: {
        type: String,
        default: "",
      },

      keyPointsExpected: {
        type: [String],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// STUDY QUEST
// =========================================================

const studyQuestSchema =
  new mongoose.Schema(
    {
      stage: {
        type: String,
        enum: [
          "learn",
          "practice",
          "challenge",
          "master",
        ],
        default: "learn",
      },

      task: {
        type: String,
        default: "",
      },

      question: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// FIND THE MISTAKE
// =========================================================

const findMistakeSchema =
  new mongoose.Schema(
    {
      incorrectStatement: {
        type: String,
        default: "",
      },

      mistake: {
        type: String,
        default: "",
      },

      correctVersion: {
        type: String,
        default: "",
      },

      explanation: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// REAL LIFE SCENARIO
// =========================================================

const realLifeSchema =
  new mongoose.Schema(
    {
      scenario: {
        type: String,
        default: "",
      },

      question: {
        type: String,
        default: "",
      },

      expectedAnswer: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// EXAM ANSWER
// =========================================================

const examAnswerSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      answer: {
        type: String,
        default: "",
      },

      keywords: {
        type: [String],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// EXAM ANSWERS
// =========================================================

const examAnswersSchema =
  new mongoose.Schema(
    {
      twoMarks: {
        type: [examAnswerSchema],
        default: [],
      },

      fiveMarks: {
        type: [examAnswerSchema],
        default: [],
      },

      tenMarks: {
        type: [examAnswerSchema],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// EXAM NIGHT
// =========================================================

const examNightSchema =
  new mongoose.Schema(
    {
      mustLearn: {
        type: [String],
        default: [],
      },

      importantQuestions: {
        type: [String],
        default: [],
      },

      weakTopicCheck: {
        type: [String],
        default: [],
      },

      quickRevision: {
        type: [String],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// TOPIC
// =========================================================

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    summary: {
      type: String,
      default: "",
    },

    importantPoints: {
      type: [String],
      default: [],
    },

    simpleExplanation: {
      type: String,
      default: "",
    },

    shortAnswers: {
      type: [shortAnswerSchema],
      default: [],
    },

    flashcards: {
      type: [flashcardSchema],
      default: [],
    },

    mcqs: {
      type: [mcqSchema],
      default: [],
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    socratic: {
      type: [socraticSchema],
      default: [],
    },

    teachBack: {
      type: teachBackSchema,
      default: () => ({
        prompt: "",
        keyPointsExpected: [],
      }),
    },

    studyQuest: {
      type: [studyQuestSchema],
      default: [],
    },

    findMistake: {
      type: [findMistakeSchema],
      default: [],
    },

    realLifeScenarios: {
      type: [realLifeSchema],
      default: [],
    },

    examAnswers: {
      type: examAnswersSchema,
      default: () => ({
        twoMarks: [],
        fiveMarks: [],
        tenMarks: [],
      }),
    },

    examNight: {
      type: examNightSchema,
      default: () => ({
        mustLearn: [],
        importantQuestions: [],
        weakTopicCheck: [],
        quickRevision: [],
      }),
    },
  },
  { _id: false }
);


// =========================================================
// MASTERY
// =========================================================

const masterySchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },

    keyConcepts: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: [
        "mastered",
        "needs-practice",
        "needs-attention",
      ],
      default: "needs-attention",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);


// =========================================================
// MOCK TEST
// =========================================================

const mockTestQuestionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      options: {
        type: [String],
        default: [],
      },

      correctAnswer: {
        type: String,
        default: "",
      },

      explanation: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// BOSS BATTLE QUESTION
// =========================================================

const bossBattleQuestionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        default: "",
      },

      type: {
        type: String,
        default: "mcq",
      },

      options: {
        type: [String],
        default: [],
      },

      correctAnswer: {
        type: String,
        default: "",
      },

      explanation: {
        type: String,
        default: "",
      },
    },
    { _id: false }
  );


// =========================================================
// BOSS BATTLE
// =========================================================

const bossBattleSchema =
  new mongoose.Schema(
    {
      unlocked: {
        type: Boolean,
        default: false,
      },

      completed: {
        type: Boolean,
        default: false,
      },

      score: {
        type: Number,
        default: 0,
      },

      performance: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      questions: {
        type: [bossBattleQuestionSchema],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// SPACED REPETITION
// =========================================================

const spacedRepetitionSchema =
  new mongoose.Schema(
    {
      generated: {
        type: Boolean,
        default: false,
      },

      reviews: {
        type: [mongoose.Schema.Types.Mixed],
        default: [],
      },
    },
    { _id: false }
  );


// =========================================================
// SMARTY STUDY
// =========================================================

const smartyStudySchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyMaterial",
      required: true,
      unique: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "ready",
        "failed",
      ],
      default: "pending",
    },

    sourceText: {
      type: String,
      default: "",
    },

    // =====================================================
    // AI GENERATED TOPICS
    // =====================================================

    topics: {
      type: [topicSchema],
      default: [],
    },

    // =====================================================
    // MASTERY MAP
    // =====================================================

    mastery: {
      type: [masterySchema],
      default: [],
    },

    // =====================================================
    // LEARNING PROGRESS
    // =====================================================

    learningProgress: {
      type: Map,
      of: Number,
      default: {},
    },

    // =====================================================
    // MOCK TEST
    // =====================================================

    mockTest: {
      type: [mockTestQuestionSchema],
      default: [],
    },

    // =====================================================
    // BOSS BATTLE
    // =====================================================

    bossBattle: {
      type: bossBattleSchema,
      default: () => ({
        unlocked: false,
        completed: false,
        score: 0,
        performance: null,
        questions: [],
      }),
    },

    // =====================================================
    // SPACED REPETITION
    // =====================================================

    spacedRepetition: {
      type: spacedRepetitionSchema,
      default: () => ({
        generated: false,
        reviews: [],
      }),
    },
  },
  {
    timestamps: true,
  }
);


// =========================================================
// EXPORT
// =========================================================

module.exports = mongoose.model(
  "SmartyStudy",
  smartyStudySchema
);
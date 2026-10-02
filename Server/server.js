const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authMiddleware = require("./middleware/authMiddleware");
const nodemailer = require("nodemailer");
const webpush = require("web-push");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const User = require("./models/User");
const Message = require("./models/Message");
const Project = require("./models/Project");
const Query = require("./models/Query");
const Answer = require("./models/Answer");
const SavedAnswer = require("./models/SavedAnswer");
const StudyMaterial = require("./models/StudyMaterial");
const SmartyStudy = require("./models/SmartyStudy");
const Connection = require("./models/Connection");
const Block = require("./models/Block");
const Notification = require("./models/Notification");
const NotificationSetting = require("./models/NotificationSetting");

const normalizeSmartyAnswer = (answer, options = []) => {
  if (typeof answer === "number" && Number.isInteger(answer)) {
    return answer;
  }

  if (typeof answer !== "string") {
    return answer;
  }

  const value = answer.trim();

  // "0", "1", "2", "3"
  if (/^[0-9]+$/.test(value)) {
    const index = Number(value);

    if (index >= 0 && index < options.length) {
      return index;
    }
  }

  // "A", "B", "C", "D"
  if (/^[A-Da-d]$/.test(value)) {
    return value.toUpperCase().charCodeAt(0) - 65;
  }

  // Exact option text
  const optionIndex = options.findIndex(
    (option) =>
      String(option).trim().toLowerCase() ===
      value.toLowerCase()
  );

  if (optionIndex !== -1) {
    return optionIndex;
  }

  return answer;
};
const canSendNotification = async (
  userId,
  settingName = null
) => {
  try {
    const settings =
      await NotificationSetting.findOne({
        user: userId,
      }).lean();

    // Settings record nahi hai to default notifications ON hain
    if (!settings) {
      return true;
    }

    // Mute All sab notifications ko stop karega
    if (settings.muteAll) {
      return false;
    }

    // Agar specific setting nahi di gayi
    // to sirf Mute All check hoga
    if (!settingName) {
      return true;
    }

    // Sirf explicitly false hone par notification stop hoga
    return settings[settingName] !== false;
  } catch (error) {
    console.error(
      "Notification setting check error:",
      error
    );

    // Error ki situation mein notification ko completely break nahi karna
    return true;
  }
};

// =========================================================
// SMARTY STUDY — FILE TEXT EXTRACTION
// =========================================================

const extractStudyMaterialText = async (
  filePath,
  originalFileName
) => {
  try {
    const extension = path
      .extname(originalFileName || filePath)
      .toLowerCase();

    // -------------------------------------------------------
    // PDF
    // -------------------------------------------------------
    if (extension === ".pdf") {
      const fileBuffer = fs.readFileSync(filePath);

      const parser = new PDFParse({
        data: fileBuffer,
      });

      const result = await parser.getText();

      await parser.destroy();

      return {
        success: true,
        text: result.text || "",
        type: "pdf",
      };
    }

    // -------------------------------------------------------
    // DOCX
    // -------------------------------------------------------
    if (extension === ".docx") {
      const result = await mammoth.extractRawText({
        path: filePath,
      });

      return {
        success: true,
        text: result.value || "",
        type: "docx",
      };
    }

    // -------------------------------------------------------
    // Unsupported file type
    // -------------------------------------------------------
    return {
      success: false,
      text: "",
      type: extension,
      message:
        "This file type is not supported for text extraction yet.",
    };
  } catch (error) {
    console.error(
      "Smarty Study text extraction error:",
      error.message
    );

    return {
      success: false,
      text: "",
      type: "unknown",
      message:
        "Unable to extract text from this file.",
    };
  }
};

// =========================================================
// SMARTY STUDY — GEMINI MATERIAL ANALYSIS
// =========================================================

const analyzeStudyMaterialWithAI = async (sourceText) => {
  try {
    if (!sourceText || !sourceText.trim()) {
      return {
        success: false,
        message: "No extracted study material text found.",
      };
    }

    const prompt = `
You are Smarty Study, an educational AI inside a college student learning platform.

Your job is to transform ONLY the provided study material into a complete interactive learning system.

=========================================================
STRICT SOURCE RULES
=========================================================

1. Use ONLY information supported by the provided material.
2. Do NOT invent chapters, concepts, facts, formulas or examples.
3. Do NOT use outside knowledge unless absolutely necessary to explain wording already present.
4. Preserve important terminology from the material.
5. Every generated question and answer must be based on the material.
6. If something is not present in the material, return an empty array or empty string.
7. Do not create fake/sample content.
8. Keep the content useful for college students.
9. Return ONLY valid JSON.
10. Do NOT use markdown code fences.

=========================================================
RETURN EXACTLY THIS JSON STRUCTURE
=========================================================

{
  "topics": [
    {
      "title": "",
      "summary": "",

      "importantPoints": [
        ""
      ],

      "simpleExplanation": "",

      "shortAnswers": [
        {
          "question": "",
          "answer": ""
        }
      ],

      "flashcards": [
        {
          "question": "",
          "answer": ""
        }
      ],

      "mcqs": [
        {
          "question": "",
          "options": [
            "",
            "",
            "",
            ""
          ],
          "correctAnswer": "",
          "explanation": ""
        }
      ],

      "questions": [
        {
          "question": "",
          "answer": "",
          "marks": 2
        }
      ],

      "socratic": [
        {
          "question": "",
          "expectedDirection": ""
        }
      ],

      "teachBack": {
        "prompt": "",
        "keyPointsExpected": [
          ""
        ]
      },

      "studyQuest": [
        {
          "stage": "learn",
          "task": "",
          "question": ""
        },
        {
          "stage": "practice",
          "task": "",
          "question": ""
        },
        {
          "stage": "challenge",
          "task": "",
          "question": ""
        },
        {
          "stage": "master",
          "task": "",
          "question": ""
        }
      ],

      "findMistake": [
        {
          "incorrectStatement": "",
          "mistake": "",
          "correctVersion": "",
          "explanation": ""
        }
      ],

      "realLifeScenarios": [
        {
          "scenario": "",
          "question": "",
          "expectedAnswer": ""
        }
      ],

      "examAnswers": {
        "twoMarks": [
          {
            "question": "",
            "answer": "",
            "keywords": [
              ""
            ]
          }
        ],

        "fiveMarks": [
          {
            "question": "",
            "answer": "",
            "keywords": [
              ""
            ]
          }
        ],

        "tenMarks": [
          {
            "question": "",
            "answer": "",
            "keywords": [
              ""
            ]
          }
        ]
      },

      "examNight": {
        "mustLearn": [
          ""
        ],
        "importantQuestions": [
          ""
        ],
        "weakTopicCheck": [
          ""
        ],
        "quickRevision": [
          ""
        ]
      }
    }
  ],

  "globalQuestions": {
    "mockTest": [
      {
        "question": "",
        "options": [
          "",
          "",
          "",
          ""
        ],
        "correctAnswer": "",
        "explanation": ""
      }
    ]
  },

  "masteryMap": [
    {
      "topic": "",
      "keyConcepts": [
        ""
      ],
      "status": "needs-attention"
    }
  ],

  "bossBattle": {
    "questions": [
      {
        "question": "",
        "type": "mcq",
        "options": [
          "",
          "",
          "",
          ""
        ],
        "correctAnswer": "",
        "explanation": ""
      }
    ]
  }
}

=========================================================
CONTENT REQUIREMENTS
=========================================================

IMPORTANT POINTS:
Extract the genuinely important points from the material.

SIMPLE EXPLANATION:
Explain the topic in simple student-friendly language without adding unsupported facts.

SHORT ANSWERS:
Create concise questions and answers directly from the material.

FLASHCARDS:
Create useful front/back style recall questions.

MCQs:
Create four-option questions.
Only one option must be correct.

QUESTIONS:
Create descriptive questions suitable for college study.
Use marks such as 2, 5 or 10.

SOCRATIC:
Do NOT directly provide the answer.
Create guiding questions that help the student discover the answer.

TEACH BACK:
Create a prompt asking the student to explain the concept in their own words.
List the key points an accurate explanation should contain.

STUDY QUEST:
Create a progression:
learn → practice → challenge → master.

FIND THE MISTAKE:
Create intentionally incorrect statements only when the material supports a clear correction.
Do not invent facts.

REAL-LIFE SCENARIOS:
Create realistic application situations based only on concepts present in the material.

EXAM ANSWERS:
Create 2-mark, 5-mark and 10-mark answers only when enough material exists.
Include important keywords.

EXAM NIGHT:
Extract:
- must learn concepts
- important questions
- weak-topic checks
- quick revision points

MASTERY MAP:
Create one entry for every major topic.
Initial status must be "needs-attention".

BOSS BATTLE:
Create difficult mixed questions based only on the uploaded material.
Do not reveal any answer outside the JSON.

=========================================================
IMPORTANT QUALITY RULE
=========================================================

If the uploaded material contains only a small amount of information:

DO NOT artificially generate large amounts of content.

Generate only what can genuinely be supported by the material.

Empty arrays are acceptable.

=========================================================
STUDY MATERIAL
=========================================================

${sourceText}
`;

    let response = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Smarty Study Gemini attempt ${attempt}/3`
        );

        response =
          await geminiAI.models.generateContent({
            model: "gemini-2.5-flash-lite",

            contents: prompt,

            config: {
              responseMimeType: "application/json",

              httpOptions: {
                timeout: 30000,
              },
            },
          });

        if (response?.text) {
          console.log(
            `Smarty Study Gemini attempt ${attempt} succeeded`
          );

          break;
        }

        throw new Error(
          "Gemini returned an empty response."
        );
      } catch (error) {
        lastError = error;

        console.error(
          `Smarty Study Gemini attempt ${attempt} failed:`,
          error.message
        );

        if (attempt < 3) {
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              3000 * attempt
            )
          );
        }
      }
    }

    if (!response?.text) {
      throw (
        lastError ||
        new Error(
          "Gemini did not return a response."
        )
      );
    }

    const responseText =
      response.text || "";

    const cleanedText =
      responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const parsedResult =
      JSON.parse(cleanedText);

    if (
      !parsedResult ||
      !Array.isArray(parsedResult.topics)
    ) {
      throw new Error(
        "Invalid Smarty Study AI structure."
      );
    }

    return {
      success: true,
      data: parsedResult,
    };
  } catch (error) {
    console.error(
      "Smarty Study Gemini analysis error:",
      error.message
    );

    return {
      success: false,
      message:
        "Unable to analyze study material with AI.",
    };
  }
};
const PushSubscription = require("./models/PushSubscription");
const sendPushNotification = async (userId, payload) => {
  try {
    const subscriptions =
      await PushSubscription.find({
        user: userId,
      })

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          JSON.stringify(payload)
        )
      } catch (error) {
        if (
          error.statusCode === 404 ||
          error.statusCode === 410
        ) {
          await PushSubscription.findByIdAndDelete(
            subscription._id
          )
        } else {
          console.error(
            "Push notification error:",
            error
          )
        }
      }
    }
  } catch (error) {
    console.error(
      "Send push notification error:",
      error
    )
  }
}



const app = express();

// ======================================================
// PERMANENTLY DELETE USER ACCOUNT + ALL RELATED DATA
// ======================================================

const permanentlyDeleteUser = async (userId) => {
  try {
        // -----------------------------------------------
    // USER KE PROJECT FILES + STUDY MATERIAL FILES
    // PHYSICALLY DELETE KARO
    // -----------------------------------------------

    const userProjects = await Project.find({
      owner: userId,
    }).select("projectFileUrl");

    const userStudyMaterials =
      await StudyMaterial.find({
        owner: userId,
      }).select("fileUrl");


    // -----------------------------------------------
    // DELETE PROJECT FILES
    // -----------------------------------------------

    for (const project of userProjects) {
      if (project.projectFileUrl) {
        const filePath = path.join(
          __dirname,
          project.projectFileUrl.replace(
            "/uploads/",
            "uploads/"
          )
        );

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error(
            "Project file deletion error:",
            error
          );
        }
      }
    }


    // -----------------------------------------------
    // DELETE STUDY MATERIAL FILES
    // -----------------------------------------------

    for (const material of userStudyMaterials) {
      if (material.fileUrl) {
        const filePath = path.join(
          __dirname,
          material.fileUrl.replace(
            "/uploads/",
            "uploads/"
          )
        );

        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error(
            "Study material file deletion error:",
            error
          );
        }
      }
    }
    // -----------------------------------------------
    // 1. USER KI QUERIES FIND KARO
    // -----------------------------------------------

    const userQueries = await Query.find({
      owner: userId,
    }).select("_id");

    const queryIds = userQueries.map(
      (query) => query._id
    );


    // -----------------------------------------------
    // 2. USER KE ANSWERS FIND KARO
    //    - Jo user ne khud diye
    //    - Ya jo user ki queries par diye gaye
    // -----------------------------------------------

    const userAnswers = await Answer.find({
      $or: [
        {
          author: userId,
        },
        {
          query: {
            $in: queryIds,
          },
        },
      ],
    }).select("_id");

    const answerIds = userAnswers.map(
      (answer) => answer._id
    );


    // -----------------------------------------------
    // 3. USER KE PROJECTS DELETE
    // -----------------------------------------------

    await Project.deleteMany({
      owner: userId,
    });


    // -----------------------------------------------
    // 4. USER KI QUERIES DELETE
    // -----------------------------------------------

    await Query.deleteMany({
      owner: userId,
    });


    // -----------------------------------------------
    // 5. USER KE ANSWERS DELETE
    // -----------------------------------------------

    if (answerIds.length > 0) {
      await Answer.deleteMany({
        _id: {
          $in: answerIds,
        },
      });
    }


    // -----------------------------------------------
    // 6. SAVED ANSWERS DELETE
    //    - User ke saved answers
    //    - Deleted answers ke saved records
    // -----------------------------------------------

    await SavedAnswer.deleteMany({
      $or: [
        {
          user: userId,
        },
        {
          answer: {
            $in: answerIds,
          },
        },
      ],
    });


    // -----------------------------------------------
    // 7. STUDY MATERIAL DELETE
    // -----------------------------------------------

    await StudyMaterial.deleteMany({
      owner: userId,
    });


    // -----------------------------------------------
    // 8. MESSAGES DELETE
    // -----------------------------------------------

    await Message.deleteMany({
      $or: [
        {
          sender: userId,
        },
        {
          receiver: userId,
        },
      ],
    });


    // -----------------------------------------------
    // 9. CONNECTIONS DELETE
    // -----------------------------------------------

    await Connection.deleteMany({
      $or: [
        {
          requester: userId,
        },
        {
          recipient: userId,
        },
      ],
    });


    // -----------------------------------------------
    // 10. BLOCKS DELETE
    // -----------------------------------------------

    await Block.deleteMany({
      $or: [
        {
          blocker: userId,
        },
        {
          blocked: userId,
        },
      ],
    });


    // -----------------------------------------------
    // 11. NOTIFICATIONS DELETE
    // -----------------------------------------------

    await Notification.deleteMany({
      user: userId,
    });


    // -----------------------------------------------
    // 12. NOTIFICATION SETTINGS DELETE
    // -----------------------------------------------

    await NotificationSetting.deleteOne({
      user: userId,
    });


    // -----------------------------------------------
    // 13. PUSH SUBSCRIPTIONS DELETE
    // -----------------------------------------------

    await PushSubscription.deleteMany({
      user: userId,
    });


    // -----------------------------------------------
    // 14. USER ACCOUNT DELETE
    // -----------------------------------------------

    const deletedUser =
      await User.findByIdAndDelete(userId);


    if (!deletedUser) {
      throw new Error(
        "User account not found during permanent deletion."
      );
    }


    console.log(
      `Permanently deleted user and related data: ${userId}`
    );

    return true;

  } catch (error) {

    console.error(
      "Permanent account deletion error:",
      error
    );

    throw error;
  }
};
// ======================================================
// AUTO DELETE DEACTIVATED ACCOUNTS
// ======================================================

const deleteExpiredDeactivatedAccounts = async () => {
  try {
    const now = new Date();

    const expiredUsers =
      await User.find({
        accountStatus: "deactivated",
        deletionScheduledAt: {
          $lte: now,
        },
      }).select("_id");

    if (expiredUsers.length === 0) {
      return;
    }

    for (const user of expiredUsers) {

      await permanentlyDeleteUser(
        user._id
      );

      console.log(
        `Expired deactivated account permanently deleted: ${user._id}`
      );
    }

  } catch (error) {

    console.error(
      "Expired deactivated account cleanup error:",
      error
    );
  }
};


// Har 1 hour mein expired accounts check honge
setInterval(
  deleteExpiredDeactivatedAccounts,
  60 * 60 * 1000
);
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.use(cors());
app.use(express.json());

app.post(
  "/api/push/subscribe",
  authMiddleware,
  async (req, res) => {
    try {
      const subscription = req.body;

      if (
        !subscription ||
        !subscription.endpoint ||
        !subscription.keys ||
        !subscription.keys.p256dh ||
        !subscription.keys.auth
      ) {
        return res.status(400).json({
          message: "Invalid push subscription.",
        });
      }

      const userId = req.user._id;

      await PushSubscription.findOneAndUpdate(
        {
          endpoint: subscription.endpoint,
        },
        {
          user: userId,
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      res.status(201).json({
        message: "Push notifications enabled successfully.",
      });
    } catch (error) {
      console.error(
        "Push subscription error:",
        error
      );

      res.status(500).json({
        message: "Unable to save push subscription.",
      });
    }
  }
);


// ======================================================
// UPLOADS
// ======================================================

const uploadsDirectory = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

app.use("/uploads", express.static(uploadsDirectory));


// ======================================================
// MULTER STORAGE
// ======================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".jpg",
      ".jpeg",
      ".png",
      ".zip",
    ];

    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Only PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG and ZIP files are allowed."
        )
      );
    }

    cb(null, true);
  },
});


// ======================================================
// HOME / TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "College Connect API is running",
  });
});


// ======================================================
// REGISTER API
// ======================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      level,
      degree,
      year,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !level ||
      !degree ||
      !year
    ) {
      return res.status(400).json({
        message:
          "Name, email, password, level, degree and year are required.",
      });
    }

    if (!["UG", "PG"].includes(level)) {
      return res.status(400).json({
        message: "Level must be UG or PG.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "Email already registered. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      level,
      degree: degree.trim(),
      year: year.trim(),
    });

    res.status(201).json({
      message: "Registration successful.",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        degree: user.degree,
        year: user.year,
        college: user.college,
        skills: user.skills,
        city: user.city,
        state: user.state,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error.message
    );

    res.status(500).json({
      message:
        "Something went wrong. Please try again.",
    });
  }
});


// ======================================================
// LOGIN API
// ======================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password.",
      });
    }
    // ======================================================
// REACTIVATE DEACTIVATED ACCOUNT
// ======================================================

if (user.accountStatus === "deactivated") {

  const now = new Date();

  // 30 days ke andar login kiya hai
  if (
    user.deletionScheduledAt &&
    now < user.deletionScheduledAt
  ) {
    user.accountStatus = "active";
    user.deactivatedAt = null;
    user.deletionScheduledAt = null;

    await user.save();
  } else {

    // 30 days complete ho chuke hain
    await permanentlyDeleteUser(
  user._id
);

    return res.status(401).json({
      message:
        "Your account was permanently deleted because it was deactivated for more than 30 days.",
    });
  }
}

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        level: user.level,
        degree: user.degree,
        year: user.year,
        college: user.college,
        skills: user.skills,
        city: user.city,
        state: user.state,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      message:
        "Something went wrong. Please try again.",
    });
  }
});


// ======================================================
// FORGOT PASSWORD
// ======================================================

app.post(
  "/api/auth/forgot-password",
  async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required.",
        });
      }

      const cleanEmail =
        email.toLowerCase().trim();

      const user = await User.findOne({
        email: cleanEmail,
      });

      if (!user) {
        return res.status(200).json({
          message:
            "If this email is registered, a password reset link has been sent.",
        });
      }

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

      user.resetPasswordToken = hashedToken;

      user.resetPasswordExpires =
        Date.now() + 5 * 60 * 1000;

      await user.save();

      const clientUrl =
        process.env.CLIENT_URL ||
        "http://localhost:5173";

      const resetLink =
        `${clientUrl}/reset-password/${resetToken}`;

      if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
      ) {
        console.error(
          "EMAIL_USER or EMAIL_PASS is missing in .env"
        );

        return res.status(500).json({
          message:
            "Email service is not configured.",
        });
      }

      const transporter =
        nodemailer.createTransport({
          service: "gmail",

          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      await transporter.sendMail({
        from: `"College Connect" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject:
          "College Connect - Reset Your Password",

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 30px;
          ">

            <h2>Reset Your College Connect Password</h2>

            <p>Hello ${user.name},</p>

            <p>
              We received a request to reset your
              College Connect password.
            </p>

            <p>
              Click the button below to create a new password.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:8px;
              "
            >
              Reset Password
            </a>

            <p style="margin-top:20px;">
              This link will expire in 5 minutes.
            </p>

            <p>
              If you did not request this, you can ignore this email.
            </p>

          </div>
        `,
      });

      res.status(200).json({
        message:
          "Password reset link has been sent to your email.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to send password reset email.",
      });
    }
  }
);


// ======================================================
// RESET PASSWORD
// ======================================================

app.post(
  "/api/auth/reset-password/:token",
  async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({
          message: "New password is required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters.",
        });
      }

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,

        resetPasswordExpires: {
          $gt: new Date(),
        },
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Reset link is invalid or expired.",
        });
      }

      user.password =
        await bcrypt.hash(password, 10);

      user.resetPasswordToken = "";
      user.resetPasswordExpires = null;

      await user.save();

      res.status(200).json({
        message:
          "Password reset successfully. You can now login.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to reset password.",
      });
    }
  }
);


// ======================================================
// STUDENTS API
// SAME DEGREE + SAME YEAR ONLY
// ======================================================

app.get(
  "/api/students",
  authMiddleware,
  async (req, res) => {
    try {

      // IMPORTANT:
      // Degree + Year are taken from the
      // authenticated user.
      // We do NOT trust req.query.degree/year.

      const currentUser =
        await User.findById(req.user._id)
          .select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const degree = String(currentUser.degree || "").trim();
      const year = String(currentUser.year || "").trim();

      if (!degree || !year) {
        return res.status(400).json({
          message: "Add your degree and year to your account before viewing students.",
        });
      }

      const exactTextMatch = (value) => {
        const escapedParts = value
          .split(/\s+/)
          .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        return new RegExp(`^\\s*${escapedParts.join("\\s+")}\\s*$`, "i");
      };

      const students =
        await User.find({
          degree: exactTextMatch(degree),
          year: exactTextMatch(year),
          // Include old accounts created before accountStatus existed.
          $or: [
            { accountStatus: "active" },
            { accountStatus: { $exists: false } },
            { accountStatus: null },
          ],
          // Don't show the logged-in user.
          _id: { $ne: currentUser._id },
        })
          .select(
            "name level degree year college skills city state profilePhoto createdAt"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        students,
      });

    } catch (error) {
      console.error(
        "Students fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch students.",
      });
    }
  }
);


// ======================================================
// GET PUBLIC USER PROFILE
// ======================================================

app.get(
  "/api/users/:id",
  async (req, res) => {
    try {
      const { id } = req.params;

      const user =
  await User.findById(id).select(
    "name level degree year college skills city state profilePhoto accountStatus"
  );
      if (!user) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      if (user.accountStatus !== "active") {
  return res.status(404).json({
    message: "Student not found.",
  });
}

      res.status(200).json({
        user,
      });

    } catch (error) {

      console.error(
        "Public profile fetch error:",
        error.message
      );

      res.status(500).json({
        message: "Unable to load profile.",
      });
    }
  }
);

// ======================================================
// CHANGE EMAIL
// ======================================================

app.put(
  "/api/settings/email",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const {
        currentPassword,
        newEmail,
      } = req.body;

      if (!currentPassword || !newEmail) {
        return res.status(400).json({
          message:
            "Current password and new email are required.",
        });
      }

      const cleanEmail =
        newEmail.toLowerCase().trim();

      if (!cleanEmail) {
        return res.status(400).json({
          message: "Please enter a valid email.",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const isPasswordCorrect =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Current password is incorrect.",
        });
      }

      const existingUser =
        await User.findOne({
          email: cleanEmail,
          _id: { $ne: userId },
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "This email is already registered.",
        });
      }

      user.email = cleanEmail;

      await user.save();

      res.status(200).json({
        message:
          "Email changed successfully.",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          level: user.level,
          degree: user.degree,
          year: user.year,
          college: user.college,
          skills: user.skills,
          city: user.city,
          state: user.state,
          profilePhoto: user.profilePhoto,
        },
      });
    } catch (error) {
      console.error(
        "Change email error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to change email.",
      });
    }
  }
);


// ======================================================
// CHANGE PASSWORD
// ======================================================

app.put(
  "/api/settings/password",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message:
            "Current password and new password are required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters.",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const isPasswordCorrect =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Current password is incorrect.",
        });
      }

      const isSamePassword =
        await bcrypt.compare(
          newPassword,
          user.password
        );

      if (isSamePassword) {
        return res.status(400).json({
          message:
            "New password must be different from your current password.",
        });
      }

      user.password =
        await bcrypt.hash(
          newPassword,
          10
        );

      await user.save();

      res.status(200).json({
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to change password.",
      });
    }
  }
);

// ======================================================
// NOTIFICATION SETTINGS
// ======================================================

app.get(
  "/api/settings/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const settings =
        await NotificationSetting.findOne({
          user: req.user._id,
        });

      if (!settings) {
        const newSettings =
          await NotificationSetting.create({
            user: req.user._id,
          });

        return res.status(200).json({
          settings: newSettings,
        });
      }

      res.status(200).json({
        settings,
      });
    } catch (error) {
      console.error(
        "Get notification settings error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to load notification settings.",
      });
    }
  }
);


app.put(
  "/api/settings/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const allowedFields = [
  "connectRequests",
  "requestAccepted",
  "studyMaterial",
  "chatMessages",
  "queries",
  "projectUpdates",
  "importantWebsiteUpdates",
  "muteAll",
];

      const updateData = {};

      allowedFields.forEach((field) => {
        if (
          typeof req.body[field] ===
          "boolean"
        ) {
          updateData[field] =
            req.body[field];
        }
      });

      const settings =
        await NotificationSetting.findOneAndUpdate(
          {
            user: req.user._id,
          },
          {
            $set: updateData,
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          }
        );

      res.status(200).json({
        message:
          "Notification settings updated successfully.",
        settings,
      });
    } catch (error) {
      console.error(
        "Update notification settings error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update notification settings.",
      });
    }
  }
);

// =======================================================
// DEACTIVATE ACCOUNT
// =======================================================

app.put(
  "/api/account/deactivate",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          message: "Account not found.",
        });
      }

      if (user.accountStatus === "deactivated") {
        return res.status(400).json({
          message: "Account is already deactivated.",
        });
      }

      const now = new Date();

      const deletionDate = new Date(now);
      deletionDate.setDate(
        deletionDate.getDate() + 30
      );

      user.accountStatus = "deactivated";
      user.deactivatedAt = now;
      user.deletionScheduledAt = deletionDate;

      await user.save();

      res.status(200).json({
        message:
          "Account deactivated successfully.",
      });
    } catch (error) {
      console.error(
        "Deactivate account error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to deactivate account.",
      });
    }
  }
);

// =======================================================
// DELETE ACCOUNT - PERMANENT
// =======================================================

app.delete(
  "/api/account",
  authMiddleware,
  async (req, res) => {
    try {
      await permanentlyDeleteUser(
        req.user._id
      );

      res.status(200).json({
        message:
          "Account deleted permanently.",
      });
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete account.",
      });
    }
  }
);
// ======================================================
// UPDATE PROFILE
// Degree + Year are NOT editable
// ======================================================

app.put(
  "/api/users/:id/profile",
  authMiddleware,
  async (req, res) => {
    try {

      if (
        String(req.user._id) !==
        String(req.params.id)
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own profile.",
        });
      }

      const { id } = req.params;

      const {
        name,
        college,
        skills,
        city,
        state,
        profilePhoto,
      } = req.body;

      const updatedUser =
        await User.findByIdAndUpdate(
          id,

          {
            name,
            college,
            skills,
            city,
            state,
            profilePhoto,
          },

          {
            new: true,
            runValidators: true,
          }
        ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.status(200).json({
        message:
          "Profile updated successfully.",

        user: updatedUser,
      });

    } catch (error) {

      console.error(
        "Profile update error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to update profile.",
      });
    }
  }
);


// ======================================================
// PROJECTS
// ======================================================


// ======================================================
// GET PROJECTS
// SAME DEGREE + SAME YEAR ONLY
// ======================================================

app.get(
  "/api/projects",
  authMiddleware,
  async (req, res) => {
    try {

      // Get logged-in user's Degree + Year
      const currentUser =
        await User.findById(req.user._id)
          .select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // Find students who belong to
      // the same Degree + Year
      const matchingUsers =
  await User.find({
    degree: currentUser.degree,
    year: currentUser.year,
    accountStatus: "active",
  }).select("_id");

      const matchingUserIds =
        matchingUsers.map(
          (user) => user._id
        );

      // Only projects owned by those students
      const projects =
        await Project.find({
          owner: {
            $in: matchingUserIds,
          },
        })
          .populate(
            "owner",
            "name level degree year college profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        projects,
      });

    } catch (error) {

      console.error(
        "Projects fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch projects.",
      });
    }
  }
);


// ======================================================
// ADD PROJECT
// Project file: PDF, PPT, PPTX, DOC, DOCX or ZIP
// ======================================================

app.post(
  "/api/projects",
  authMiddleware,
  upload.single("projectFile"),

  async (req, res) => {
    try {

      const {
        title,
        description,
        skills,
        branch,
        projectLink,
      } = req.body;

      // IMPORTANT:
      // Owner comes ONLY from authenticated user
      const owner = req.user._id;


      // -----------------------------------------------
      // BASIC VALIDATION
      // -----------------------------------------------

      if (
        !title ||
        !description ||
        !owner
      ) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "Title, description and owner are required.",
        });
      }

      if (!title.trim()) {

        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "Project title cannot be empty.",
        });
      }

      if (!description.trim()) {

        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "Project description cannot be empty.",
        });
      }


      // -----------------------------------------------
      // FIND AUTHENTICATED USER
      // -----------------------------------------------

      const user =
        await User.findById(owner);

      if (!user) {

        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(404).json({
          message: "User not found.",
        });
      }


      // -----------------------------------------------
      // PARSE SKILLS
      // -----------------------------------------------

      let projectSkills = [];

      if (skills) {

        try {

          const parsedSkills =
            JSON.parse(skills);

          if (
            Array.isArray(parsedSkills)
          ) {

            projectSkills =
              parsedSkills
                .map((skill) =>
                  String(skill).trim()
                )
                .filter(
                  (skill) =>
                    skill.length > 0
                );
          }

        } catch {

          projectSkills =
            skills
              .split(",")
              .map((skill) =>
                skill.trim()
              )
              .filter(
                (skill) =>
                  skill.length > 0
              );
        }
      }

      if (
        projectSkills.length === 0
      ) {

        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(400).json({
          message:
            "At least one skill is required.",
        });
      }


      // -----------------------------------------------
      // ACADEMIC YEAR
      // Academic year starts in June
      // -----------------------------------------------

      const today = new Date();

      const currentYear =
        today.getFullYear();

      const currentMonth =
        today.getMonth() + 1;

      let academicYear;

      if (currentMonth >= 6) {

        academicYear =
          `${currentYear}–${String(
            currentYear + 1
          ).slice(-2)}`;

      } else {

        academicYear =
          `${currentYear - 1}–${String(
            currentYear
          ).slice(-2)}`;
      }


      // -----------------------------------------------
      // PROJECT FILE
      // -----------------------------------------------

      let projectFileUrl = "";
      let projectFileName = "";

      if (req.file) {

        projectFileUrl =
          `/uploads/${req.file.filename}`;

        projectFileName =
          req.file.originalname;
      }


      // -----------------------------------------------
      // CREATE PROJECT
      // Degree comes from authenticated USER
      // -----------------------------------------------

      const newProject =
        await Project.create({

          title:
            title.trim(),

          description:
            description.trim(),

          skills:
            projectSkills,

          level:
            user.level,

          degree:
            user.degree,

          branch:
            branch
              ? branch.trim()
              : "",

          academicYear,

          projectLink:
            projectLink
              ? projectLink.trim()
              : "",

          projectFileUrl,

          projectFileName,

          owner:
            user._id,
        });


      // -----------------------------------------------
      // GET CREATED PROJECT
      // -----------------------------------------------

      const project =
        await Project.findById(
          newProject._id
        ).populate(
          "owner",
          "name level degree year college profilePhoto"
        );


      // -----------------------------------------------
      // NOTIFY SAME DEGREE + YEAR STUDENTS
      // Uploader excluded
      // -----------------------------------------------

      const matchingStudents =
  await User.find({
    degree: user.degree,
    year: user.year,
    accountStatus: "active",
    _id: { $ne: user._id },
  }).select("_id");
  
// 🔔 WEBSITE NOTIFICATION — ALWAYS
if (matchingStudents.length > 0) {
  await Notification.insertMany(
    matchingStudents.map(
      (student) => ({
        user: student._id,
        type: "project",
        message: `💻 ${user.name} shared a new project`,
        relatedId: newProject._id,
        isRead: false,
      })
    )
  );
}

// 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
if (matchingStudents.length > 0) {
  for (const student of matchingStudents) {

    const canSendBrowserPush =
      await canSendNotification(
        student._id,
        "projectUpdates"
      );

    if (canSendBrowserPush) {
      await sendPushNotification(
        student._id,
        {
          title: "College Connect",
          body: `💻 ${user.name} shared a new project`,
          url: "/",
        }
      );
    }
  }
}


      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      res.status(201).json({

        message:
          "Project added successfully.",

        project,

      });

    } catch (error) {

      console.error(
        "Project add error:",
        error.message
      );

      // Delete uploaded file if
      // database save fails
      if (req.file) {

        try {

          if (
            fs.existsSync(
              req.file.path
            )
          ) {

            fs.unlinkSync(
              req.file.path
            );

          }

        } catch {}
      }

      res.status(500).json({
        message:
          "Unable to add project.",
      });
    }
  }
);


// ======================================================
// DELETE PROJECT
// ======================================================

app.delete(
  "/api/projects/:id",
  authMiddleware,
  async (req, res) => {
    try {

      const { id } = req.params;

      // IMPORTANT:
      // Owner comes from token,
      // not from req.body
      const owner = req.user._id;


      const project =
        await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          message:
            "Project not found.",
        });
      }


      if (
        String(project.owner) !==
        String(owner)
      ) {

        return res.status(403).json({
          message:
            "You can only delete your own project.",
        });
      }


      // -----------------------------------------------
      // DELETE PROJECT FILE
      // -----------------------------------------------

      if (
        project.projectFileUrl
      ) {

        const filePath =
          path.join(
            __dirname,
            project.projectFileUrl.replace(
              "/uploads/",
              "uploads/"
            )
          );

        if (
          fs.existsSync(filePath)
        ) {

          fs.unlinkSync(
            filePath
          );
        }
      }


      await Project.findByIdAndDelete(
        id
      );


      res.status(200).json({
        message:
          "Project deleted successfully.",
      });

    } catch (error) {

      console.error(
        "Project delete error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete project.",
      });
    }
  }
);
// ======================================================
// QUERIES
// ======================================================

// GET QUERIES
// ONLY SAME DEGREE + SAME YEAR

app.get(
  "/api/queries",
  authMiddleware,
  async (req, res) => {
    try {

      // Get logged-in user's academic group
      const currentUser =
        await User.findById(req.user._id)
          .select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      // Find students from same Degree + Year
      const matchingStudents =
  await User.find({
    degree: currentUser.degree,
    year: currentUser.year,
    accountStatus: "active",
  }).select("_id");

      const matchingStudentIds =
        matchingStudents.map(
          (student) => student._id
        );

      // Get only queries posted by
      // students from same Degree + Year
      const queries =
        await Query.find({
          owner: {
            $in: matchingStudentIds,
          },
        })
          .populate(
            "owner",
            "name level degree year profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      const queryIds =
        queries.map(
          (query) => query._id
        );

      let answers = [];

      if (queryIds.length > 0) {

        answers =
          await Answer.find({
            query: {
              $in: queryIds,
            },
          })
            .populate(
              "author",
              "name degree"
            )
            .sort({
              createdAt: -1,
            });
      }

      const queriesWithAnswers =
        queries.map((query) => ({
          ...query.toObject(),

          answers:
            answers.filter(
              (answer) =>
                String(answer.query) ===
                String(query._id)
            ),
        }));

      res.status(200).json({
        queries:
          queriesWithAnswers,
      });

    } catch (error) {

      console.error(
        "Queries fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch queries.",
      });
    }
  }
);
// ======================================================
// ADD QUERY
// ======================================================

app.post(
  "/api/queries",
  authMiddleware,
  async (req, res) => {
    try {

      const { text } = req.body;

      // Owner ALWAYS comes from login token
      const owner = req.user._id;

      if (!text || !owner) {
        return res.status(400).json({
          message:
            "Query text and owner are required.",
        });
      }

      if (!text.trim()) {
        return res.status(400).json({
          message:
            "Query cannot be empty.",
        });
      }

      const user =
        await User.findById(owner);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      // Create query
      const newQuery =
        await Query.create({
          text: text.trim(),
          owner,
        });

      const query =
        await Query.findById(
          newQuery._id
        ).populate(
          "owner",
          "name level degree year profilePhoto"
        );


      // ==================================================
      // NOTIFY SAME DEGREE + SAME YEAR ONLY
      // Uploader excluded
      // ==================================================

      const matchingStudents =
  await User.find({
    degree: user.degree,
    year: user.year,
    accountStatus: "active",
    _id: { $ne: user._id },
  }).select("_id");

// 🔔 WEBSITE NOTIFICATION — ALWAYS
if (matchingStudents.length > 0) {
  await Notification.insertMany(
    matchingStudents.map(
      (student) => ({
        user: student._id,
        type: "query",
        message: `${user.name} posted a new query.`,
        relatedId: newQuery._id,
        isRead: false,
      })
    )
  );
}

// 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
if (matchingStudents.length > 0) {
  for (const student of matchingStudents) {

    const canSendBrowserPush =
      await canSendNotification(
        student._id,
        "queries"
      );

    if (canSendBrowserPush) {
      await sendPushNotification(
        student._id,
        {
          title: "College Connect",
          body: `${user.name} posted a new query.`,
          url: "/",
        }
      );
    }
  }
}


      res.status(201).json({

        message:
          "Query added successfully.",

        query,

      });

    } catch (error) {

      console.error(
        "Query add error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to add query.",
      });
    }
  }
);
// ======================================================
// STUDY MATERIAL
// ======================================================

// GET STUDY MATERIAL
// ONLY SAME DEGREE + SAME YEAR

app.get(
  "/api/study-materials",
  authMiddleware,
  async (req, res) => {
    try {

      const { category } = req.query;

      // IMPORTANT:
      // Degree + Year comes from authenticated user.
      // Frontend query parameters are NOT trusted.

      const currentUser =
        await User.findById(req.user._id)
          .select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // Base filter
const filter = {

  degree:
    currentUser.degree,

  year:
    currentUser.year,

  owner: {
    $in: activeStudentIds,
  },

};

      // Only ACTIVE students from the same degree + year
const activeStudents =
  await User.find({
    degree: currentUser.degree,
    year: currentUser.year,
    accountStatus: "active",
  }).select("_id");

const activeStudentIds =
  activeStudents.map(
    (student) => student._id
  );


      // Optional category filter
      if (
        category &&
        category !== "All"
      ) {

        filter.category =
          category;
      }


      const materials =
        await StudyMaterial.find(
          filter
        )
          .populate(
            "owner",
            "name degree year profilePhoto"
          )
          .sort({
            createdAt: -1,
          });


      res.status(200).json({
        materials,
      });

    } catch (error) {

      console.error(
        "Study material fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch study material.",
      });
    }
  }
);
// ======================================================
// UPLOAD STUDY MATERIAL
// ======================================================

app.post(
  "/api/study-materials",
  authMiddleware,
  upload.single("file"),

  async (req, res) => {
    try {

      const {
        title,
        description,
        category,
      } = req.body;


      // Owner comes ONLY from authenticated user
      const owner =
        req.user._id;


      // -----------------------------------------------
      // BASIC VALIDATION
      // -----------------------------------------------

      if (
        !title ||
        !category
      ) {

        if (req.file) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          message:
            "Title and category are required.",
        });
      }


      if (!title.trim()) {

        if (req.file) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(400).json({
          message:
            "Title cannot be empty.",
        });
      }


      if (!req.file) {

        return res.status(400).json({
          message:
            "Please select a file.",
        });
      }


      // -----------------------------------------------
      // FIND AUTHENTICATED USER
      // -----------------------------------------------

      const user =
        await User.findById(owner)
          .select(
            "name degree year"
          );


      if (!user) {

        fs.unlinkSync(
          req.file.path
        );

        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // -----------------------------------------------
      // CREATE STUDY MATERIAL
      // -----------------------------------------------

      const material =
        await StudyMaterial.create({

          title:
            title.trim(),

          description:
            description
              ? description.trim()
              : "",

          category,

          fileUrl:
            `/uploads/${req.file.filename}`,

          originalFileName:
            req.file.originalname,

          // IMPORTANT
          // These values come from
          // authenticated user's profile

          owner:
            user._id,

          degree:
            user.degree,

          year:
            user.year,
        });

       // =========================================================
// SMARTY STUDY — AI ANALYSIS API
// =========================================================

app.post(
  "/api/smarty-study/analyze/:materialId",
  authMiddleware,
  async (req, res) => {
    try {
      const { materialId } = req.params;

      // ---------------------------------------------------
      // FIND STUDY MATERIAL
      // ---------------------------------------------------

      const material =
        await StudyMaterial.findById(
          materialId
        );

      if (!material) {
        return res.status(404).json({
          message:
            "Study material not found.",
        });
      }

      // ---------------------------------------------------
      // CHECK OWNER
      // ---------------------------------------------------

      if (
        String(material.owner) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to analyze this material.",
        });
      }

      // ---------------------------------------------------
      // FIND SMARTY STUDY RECORD
      // ---------------------------------------------------

      const smartyStudy =
        await SmartyStudy.findOne({
          material: material._id,
          owner: req.user._id,
        });

      if (!smartyStudy) {
        return res.status(404).json({
          message:
            "Smarty Study record not found for this material.",
        });
      }

      // ---------------------------------------------------
      // CHECK SOURCE TEXT
      // ---------------------------------------------------

      if (
        !smartyStudy.sourceText ||
        !smartyStudy.sourceText.trim()
      ) {
        return res.status(400).json({
          message:
            "No readable text was extracted from this material.",
        });
      }

      // ---------------------------------------------------
      // MARK PROCESSING
      // ---------------------------------------------------

      smartyStudy.status =
        "processing";

      await smartyStudy.save();

      // ---------------------------------------------------
      // CALL GEMINI AI
      // ---------------------------------------------------

      const aiResult =
        await analyzeStudyMaterialWithAI(
          smartyStudy.sourceText
        );

      // ---------------------------------------------------
      // AI FAILED
      // ---------------------------------------------------

      if (!aiResult.success) {
        smartyStudy.status =
          "failed";

        await smartyStudy.save();

        return res.status(500).json({
          message:
            aiResult.message ||
            "AI analysis failed.",
        });
      }

      const data =
        aiResult.data;

      // ---------------------------------------------------
      // VALIDATE AI DATA
      // ---------------------------------------------------

      if (
        !data ||
        !Array.isArray(data.topics)
      ) {
        smartyStudy.status =
          "failed";

        await smartyStudy.save();

        return res.status(500).json({
          message:
            "AI returned an invalid study structure.",
        });
      }

      // ===================================================
      // SAVE TOPICS
      // ===================================================

     smartyStudy.topics = data.topics.map((topic) => ({
  ...topic,

  mcqs: Array.isArray(topic.mcqs)
    ? topic.mcqs.map((mcq) => ({
        ...mcq,

        correctAnswer: normalizeSmartyAnswer(
          mcq.correctAnswer,
          Array.isArray(mcq.options)
            ? mcq.options
            : []
        ),
      }))
    : [],
}));

      // ===================================================
      // CREATE MASTERY MAP
      // ===================================================

    if (Array.isArray(data.masteryMap)) {
  smartyStudy.mastery = data.masteryMap.map((item) => ({
    topic: item.topic || "",
    keyConcepts: Array.isArray(item.keyConcepts)
      ? item.keyConcepts
      : [],
    status: item.status || "needs-attention",
    score: 0,
  }));
} else {
  smartyStudy.mastery = data.topics.map((topic) => ({
    topic: topic.title || "",
    keyConcepts: [],
    status: "needs-attention",
    score: 0,
  }));
}

      // ===================================================
      // SAVE BOSS BATTLE
      // ===================================================

     if (
  data.bossBattle &&
  Array.isArray(data.bossBattle.questions)
) {
  smartyStudy.bossBattle = {
    unlocked: false,
    completed: false,
    score: 0,
    performance: null,

    questions: data.bossBattle.questions.map((question) => ({
      ...question,

      correctAnswer: normalizeSmartyAnswer(
        question.correctAnswer,
        Array.isArray(question.options)
          ? question.options
          : []
      ),
    })),
  };
} else {
  smartyStudy.bossBattle = {
    unlocked: false,
    completed: false,
    score: 0,
    performance: null,
    questions: [],
  };
}

      // ===================================================
      // SPACED REPETITION
      // ===================================================
      // Do not generate review schedule yet.
      // It will be created after the student practices.

      smartyStudy.spacedRepetition = {
        generated: false,
        reviews: [],
      };

      // ===================================================
      // SAVE MOCK TEST IF MODEL SUPPORTS IT
      // ===================================================

      if (
  data.globalQuestions &&
  Array.isArray(data.globalQuestions.mockTest)
) {
  smartyStudy.mockTest =
    data.globalQuestions.mockTest.map((question) => ({
      ...question,

      correctAnswer: normalizeSmartyAnswer(
        question.correctAnswer,
        Array.isArray(question.options)
          ? question.options
          : []
      ),
    }));
} else {
  smartyStudy.mockTest = [];
}

      // ===================================================
      // MARK READY
      // ===================================================

      smartyStudy.status =
        "ready";

      await smartyStudy.save();

      // ===================================================
      // RETURN COMPLETE STUDY DATA
      // ===================================================

      return res.status(200).json({
        message:
          "Study material analyzed successfully.",

        smartyStudy: {
          id:
            smartyStudy._id,

          material:
            smartyStudy.material,

          status:
            smartyStudy.status,

          topics:
            smartyStudy.topics,

          mastery:
            smartyStudy.mastery,

          bossBattle:
            smartyStudy.bossBattle,

          spacedRepetition:
            smartyStudy.spacedRepetition,

          mockTest:
            smartyStudy.mockTest ||
            [],
        },
      });
    } catch (error) {
      console.error(
        "Smarty Study analysis route error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to analyze study material.",
      });
    }
  }
);
// =========================================================
// SMARTY STUDY — GET GENERATED STUDY DATA
// =========================================================

app.get(
  "/api/smarty-study/:materialId",
  authMiddleware,
  async (req, res) => {
    try {
      const { materialId } = req.params;

      const smartyStudy = await SmartyStudy.findOne({
        material: materialId,
        owner: req.user._id,
      }).populate(
        "material",
        "title description category originalFileName"
      );

      if (!smartyStudy) {
        return res.status(404).json({
          message: "Smarty Study data not found.",
        });
      }

      return res.status(200).json({
        smartyStudy,
      });
    } catch (error) {
      console.error(
        "Get Smarty Study error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to load Smarty Study data.",
      });
    }
  }
);

        // =========================================================
// SMARTY STUDY — CREATE STUDY RECORD + EXTRACT TEXT
// =========================================================

let smartyStudy = null;

try {
  smartyStudy = await SmartyStudy.create({
    material: material._id,
    owner: user._id,
    status: "processing",
  });

  const extraction = await extractStudyMaterialText(
    req.file.path,
    req.file.originalname
  );

  if (extraction.success && extraction.text.trim()) {
    smartyStudy.sourceText = extraction.text.trim();
    smartyStudy.status = "processing";

    await smartyStudy.save();

    console.log(
      "Smarty Study text extracted successfully:",
      req.file.originalname
    );
  } else {
    smartyStudy.status = "failed";
    await smartyStudy.save();

    console.log(
      "Smarty Study text extraction failed:",
      extraction.message
    );
  }
} catch (smartyError) {
  console.error(
    "Smarty Study creation/extraction error:",
    smartyError.message
  );
}


      // -----------------------------------------------
      // GET CREATED MATERIAL
      // -----------------------------------------------

      const createdMaterial =
        await StudyMaterial.findById(
          material._id
        ).populate(
          "owner",
          "name degree year profilePhoto"
        );


      // -----------------------------------------------
      // NOTIFY SAME DEGREE + SAME YEAR
      // Uploader excluded
      // -----------------------------------------------

      const matchingStudents =
  await User.find({
    degree: user.degree,
    year: user.year,
    accountStatus: "active",
    _id: { $ne: user._id },
  }).select("_id");

// 🔔 WEBSITE NOTIFICATION — ALWAYS
if (matchingStudents.length > 0) {
  await Notification.insertMany(
    matchingStudents.map(
      (student) => ({
        user: student._id,
        type: "study-material",
        message: `📚 ${user.name} shared new ${category}`,
        relatedId: material._id,
        isRead: false,
      })
    )
  );
}

// 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
if (matchingStudents.length > 0) {
  for (const student of matchingStudents) {

    const canSendBrowserPush =
      await canSendNotification(
        student._id,
        "studyMaterial"
      );

    if (canSendBrowserPush) {
      await sendPushNotification(
        student._id,
        {
          title: "College Connect",
          body: `📚 ${user.name} shared new ${category}`,
          url: "/",
        }
      );
    }
  }
}

      res.status(201).json({

        message:
          "Study material uploaded successfully.",

        material:
          createdMaterial,

      });

    } catch (error) {

      console.error(
        "Study material upload error:",
        error.message
      );


      // Delete uploaded file
      // if database operation fails

      if (req.file) {

        try {

          if (
            fs.existsSync(
              req.file.path
            )
          ) {

            fs.unlinkSync(
              req.file.path
            );

          }

        } catch {}
      }


      res.status(500).json({
        message:
          "Unable to upload study material.",
      });
    }
  }
);

// =========================================================
// SMARTY STUDY — TEACH BACK AI EVALUATION
// =========================================================

app.post(
  "/api/smarty-study/teach-back/:materialId",
  authMiddleware,
  async (req, res) => {
    try {
      const { materialId } = req.params;
      const { topicIndex, explanation } = req.body;

      // ---------------------------------------------------
      // Validate student explanation
      // ---------------------------------------------------
      if (
        typeof explanation !== "string" ||
        !explanation.trim()
      ) {
        return res.status(400).json({
          message:
            "Please provide your explanation before submitting.",
        });
      }

      // ---------------------------------------------------
      // Validate topic index
      // ---------------------------------------------------
      if (
        topicIndex === undefined ||
        topicIndex === null ||
        Number.isNaN(Number(topicIndex))
      ) {
        return res.status(400).json({
          message:
            "A valid study topic is required.",
        });
      }

      // ---------------------------------------------------
      // Find uploaded study material
      // ---------------------------------------------------
      const material =
        await StudyMaterial.findById(materialId);

      if (!material) {
        return res.status(404).json({
          message:
            "Study material not found.",
        });
      }

      // ---------------------------------------------------
      // Make sure material belongs to logged-in student
      // ---------------------------------------------------
      if (
        String(material.owner) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to evaluate this material.",
        });
      }

      // ---------------------------------------------------
      // Find Smarty Study data
      // ---------------------------------------------------
      const smartyStudy =
        await SmartyStudy.findOne({
          material: material._id,
          owner: req.user._id,
        });

      if (!smartyStudy) {
        return res.status(404).json({
          message:
            "Smarty Study data not found.",
        });
      }

      // ---------------------------------------------------
      // Make sure source material exists
      // ---------------------------------------------------
      if (
        !smartyStudy.sourceText ||
        !smartyStudy.sourceText.trim()
      ) {
        return res.status(400).json({
          message:
            "Original study material is not available for evaluation.",
        });
      }

      // ---------------------------------------------------
      // Get selected topic
      // ---------------------------------------------------
      const index = Number(topicIndex);

      if (
        !Array.isArray(smartyStudy.topics) ||
        !smartyStudy.topics[index]
      ) {
        return res.status(400).json({
          message:
            "Selected study topic was not found.",
        });
      }

      const selectedTopic =
        smartyStudy.topics[index];

      // ---------------------------------------------------
      // Limit explanation size
      // ---------------------------------------------------
      const studentExplanation =
        explanation.trim().slice(0, 10000);

      // ---------------------------------------------------
      // AI evaluation prompt
      // ---------------------------------------------------
      const prompt = `
You are the Teach Back evaluator inside a student learning platform.

Your job is to evaluate a student's explanation of ONE topic.

IMPORTANT RULES:

1. Use ONLY the supplied study material.
2. Use ONLY the selected topic from that material.
3. Do NOT introduce facts that are not supported by the study material.
4. Do NOT judge grammar, spelling, English level, or writing style.
5. Focus on whether the student understood and explained the actual concept.
6. Do NOT invent missing information.
7. If something cannot be determined from the supplied material, say so.
8. Be constructive and student-friendly.
9. Identify what the student explained correctly.
10. Identify important ideas from the source that the student missed.
11. Give a short improvement suggestion.
12. Ask exactly ONE follow-up question based only on the source material.
13. Do not give a fake or arbitrary score.

Return ONLY valid JSON.

JSON format:

{
  "understood": [
    "..."
  ],
  "missed": [
    "..."
  ],
  "improvement": "...",
  "followUpQuestion": "..."
}

SELECTED TOPIC:
${JSON.stringify({
  title: selectedTopic.title,
  summary: selectedTopic.summary,
  importantPoints: selectedTopic.importantPoints,
  simpleExplanation:
    selectedTopic.simpleExplanation,
  shortAnswers: selectedTopic.shortAnswers,
  questions: selectedTopic.questions,
})}

ORIGINAL STUDY MATERIAL:
${smartyStudy.sourceText}

STUDENT'S EXPLANATION:
${studentExplanation}
`;

      // ---------------------------------------------------
      // Call Gemini
      // ---------------------------------------------------
      let aiResponse = null;
      let lastError = null;

      for (
        let attempt = 1;
        attempt <= 3;
        attempt++
      ) {
        try {
          console.log(
            `Teach Back Gemini attempt ${attempt}/3`
          );

          const result =
            await geminiAI.models.generateContent({
              model: "gemini-2.5-flash-lite",

              contents: prompt,

              config: {
                httpOptions: {
                  timeout: 60000,
                },
              },
            });

          aiResponse =
            result?.text?.trim() || "";

          if (aiResponse) {
            break;
          }
        } catch (error) {
          lastError = error;

          console.error(
            `Teach Back Gemini attempt ${attempt} failed:`,
            error.message
          );

          if (attempt < 3) {
            await new Promise(
              (resolve) =>
                setTimeout(
                  resolve,
                  3000 * attempt
                )
            );
          }
        }
      }

      // ---------------------------------------------------
      // Gemini completely failed
      // ---------------------------------------------------
      if (!aiResponse) {
        console.error(
          "Teach Back Gemini failed:",
          lastError?.message
        );

        return res.status(500).json({
          message:
            "AI evaluation could not be completed. Please try again.",
        });
      }

      // ---------------------------------------------------
      // Remove markdown JSON wrapper if Gemini adds one
      // ---------------------------------------------------
      let cleanedResponse =
        aiResponse.trim();

      if (
        cleanedResponse.startsWith("```")
      ) {
        cleanedResponse =
          cleanedResponse
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();
      }

      // ---------------------------------------------------
      // Parse AI JSON
      // ---------------------------------------------------
      let evaluation;

      try {
        evaluation =
          JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error(
          "Teach Back AI JSON parse error:",
          parseError.message
        );

        console.error(
          "Teach Back raw AI response:",
          aiResponse
        );

        return res.status(500).json({
          message:
            "AI returned an invalid evaluation. Please try again.",
        });
      }

      // ---------------------------------------------------
      // Validate evaluation structure
      // ---------------------------------------------------
      if (
        !evaluation ||
        !Array.isArray(
          evaluation.understood
        ) ||
        !Array.isArray(
          evaluation.missed
        ) ||
        typeof evaluation.improvement !==
          "string" ||
        typeof evaluation.followUpQuestion !==
          "string"
      ) {
        return res.status(500).json({
          message:
            "AI returned an incomplete evaluation.",
        });
      }

      // ---------------------------------------------------
      // Return actual AI evaluation
      // ---------------------------------------------------
      return res.status(200).json({
        message:
          "Teach Back evaluation completed.",
        evaluation: {
          understood:
            evaluation.understood,
          missed:
            evaluation.missed,
          improvement:
            evaluation.improvement,
          followUpQuestion:
            evaluation.followUpQuestion,
        },
      });
    } catch (error) {
      console.error(
        "Teach Back evaluation route error:",
        error.message
      );

      return res.status(500).json({
        message:
          "Unable to evaluate your explanation.",
      });
    }
  }
);
// ======================================================
// GET ANSWERS
// ======================================================

app.get(
  "/api/queries/:queryId/answers",
  authMiddleware,
  async (req, res) => {
    try {

      const { queryId } =
        req.params;


      // Get query + owner academic group
      const query =
        await Query.findById(
          queryId
        ).populate(
          "owner",
          "degree year"
        );


      if (!query) {
        return res.status(404).json({
          message:
            "Query not found.",
        });
      }


      // Get logged-in user's group
      const currentUser =
        await User.findById(
          req.user._id
        ).select(
          "degree year"
        );


      if (!currentUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }


      // Only same Degree + Year
      const sameDegree =
        String(
          query.owner.degree
        )
          .trim()
          .toLowerCase() ===
        String(
          currentUser.degree
        )
          .trim()
          .toLowerCase();


      const sameYear =
        String(
          query.owner.year
        )
          .trim()
          .toLowerCase() ===
        String(
          currentUser.year
        )
          .trim()
          .toLowerCase();


      if (
        !sameDegree ||
        !sameYear
      ) {

        return res.status(403).json({
          message:
            "You can only access queries from your same degree and year.",
        });
      }


      const answers =
        await Answer.find({
          query: queryId,
        })
          .populate(
            "author",
            "name degree"
          )
          .sort({
            createdAt: -1,
          });


      res.status(200).json({
        answers,
      });

    } catch (error) {

      console.error(
        "Answers fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch answers.",
      });
    }
  }
);
// ======================================================
// MONGODB CONNECTION
// ======================================================

const PORT = 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log(
      "MongoDB connected successfully"
    );
    // =====================================================
// NOTIFICATIONS
// =====================================================

// GET UNREAD NOTIFICATION COUNT
app.get(
  "/api/notifications/unread-count",
  authMiddleware,
  async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        user: req.user._id,
        isRead: false,
      });

      res.status(200).json({
        count,
      });
    } catch (error) {
      console.error(
        "Unread notification count error:",
        error
      );

      res.status(500).json({
        message: "Unable to fetch notification count.",
      });
    }
  }
);


// GET ALL NOTIFICATIONS
app.get(
  "/api/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          user: req.user._id,
        })
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        notifications,
      });
    } catch (error) {
      console.error(
        "Notifications fetch error:",
        error
      );

      res.status(500).json({
        message: "Unable to fetch notifications.",
      });
    }
  }
);


// MARK SINGLE NOTIFICATION AS READ
app.put(
  "/api/notifications/:notificationId/read",
  authMiddleware,
  async (req, res) => {
    try {
      const { notificationId } =
        req.params;

      const notification =
        await Notification.findOneAndUpdate(
          {
            _id: notificationId,
            user: req.user._id,
          },
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found.",
        });
      }

      res.status(200).json({
        message:
          "Notification marked as read.",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark notification as read.",
      });
    }
  }
);


// MARK ALL NOTIFICATIONS AS READ
app.put(
  "/api/notifications/read-all",
  authMiddleware,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user: req.user._id,
          isRead: false,
        },
        {
          isRead: true,
        }
      );

      res.status(200).json({
        message:
          "All notifications marked as read.",
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to mark all notifications as read.",
      });
    }
  }
);
    // =========================
// CONNECTIONS + BLOCKS + PRIVATE CHAT
// =========================


// =========================
// SEND CONNECTION REQUEST
// =========================

app.post(
  "/api/connections",
  authMiddleware,
  async (req, res) => {
    try {
      const requester = req.user._id;
      const { recipient } = req.body;

      if (!recipient) {
        return res.status(400).json({
          message: "Recipient is required",
        });
      }
      // Check recipient account status
const recipientUser =
  await User.findById(recipient).select(
    "accountStatus"
  );

if (!recipientUser) {
  return res.status(404).json({
    message: "Student not found.",
  });
}

if (
  recipientUser.accountStatus !== "active"
) {
  return res.status(403).json({
    message:
      "Connection request cannot be sent to this student.",
  });
}

      if (String(requester) === String(recipient)) {
        return res.status(400).json({
          message: "You cannot connect with yourself",
        });
      }

      // Check block in BOTH directions
      const existingBlock = await Block.findOne({
        $or: [
          {
            blocker: requester,
            blocked: recipient,
          },
          {
            blocker: recipient,
            blocked: requester,
          },
        ],
      });

      if (existingBlock) {
        return res.status(403).json({
          message:
            "Connection request cannot be sent because one of the students has blocked the other.",
        });
      }

      const existingConnection =
        await Connection.findOne({
          $or: [
            {
              requester,
              recipient,
            },
            {
              requester: recipient,
              recipient: requester,
            },
          ],
        });

     if (existingConnection) {
  if (existingConnection.status === "pending") {
    const existingNotification =
      await Notification.findOne({
        user: recipient,
        type: "connection",
        relatedId: existingConnection._id,
        isRead: false,
      });

    if (!existingNotification) {
  const requesterUser =
    await User.findById(requester).select("name");

  if (requesterUser) {

    // 🔔 WEBSITE NOTIFICATION — ALWAYS
    await Notification.create({
      user: recipient,
      type: "connection",
      message: `${requesterUser.name} sent you a connection request.`,
      relatedId: existingConnection._id,
      isRead: false,
    });

    // 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
    const canSendBrowserPush =
      await canSendNotification(
        recipient,
        "connectRequests"
      );

    if (canSendBrowserPush) {
      await sendPushNotification(
        recipient,
        {
          title: "College Connect",
          body: `${requesterUser.name} sent you a connection request.`,
          url: "/",
        }
      );
    }
  }
}

    return res.status(400).json({
      message: "Connection request already exists",
    });
  }

  if (existingConnection.status === "accepted") {
    return res.status(400).json({
      message: "Connection already exists",
    });
  }

  if (existingConnection.status === "rejected") {
    existingConnection.requester = requester;
    existingConnection.recipient = recipient;
    existingConnection.status = "pending";

    await existingConnection.save();

    const requesterUser =
      await User.findById(requester).select("name");

   if (requesterUser) {

  // 🔔 WEBSITE NOTIFICATION — ALWAYS
  await Notification.create({
    user: recipient,
    type: "connection",
    message: `${requesterUser.name} sent you a connection request.`,
    relatedId: existingConnection._id,
    isRead: false,
  });

  // 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
  const canSendBrowserPush =
    await canSendNotification(
      recipient,
      "connectRequests"
    );

  if (canSendBrowserPush) {
    await sendPushNotification(
      recipient,
      {
        title: "College Connect",
        body: `${requesterUser.name} sent you a connection request.`,
        url: "/",
      }
    );
  }
}

    return res.status(200).json({
      message: "Connection request sent",
      connection: existingConnection,
    });
  }
}
     const connection =
  await Connection.create({
    requester,
    recipient,
    status: "pending",
  });

// Create notification for recipient
const requesterUser =
  await User.findById(requester).select("name");

if (requesterUser) {

  // 🔔 WEBSITE NOTIFICATION — ALWAYS
  await Notification.create({
    user: recipient,
    type: "connection",
    message: `${requesterUser.name} sent you a connection request.`,
    relatedId: connection._id,
    isRead: false,
  });

  // 🖥️ BROWSER PUSH — SETTINGS KE ACCORDING
  const canSendBrowserPush =
    await canSendNotification(
      recipient,
      "connectRequests"
    );

  if (canSendBrowserPush) {
    await sendPushNotification(
      recipient,
      {
        title: "College Connect",
        body: `${requesterUser.name} sent you a connection request.`,
        url: "/",
      }
    );
  }
}

res.status(201).json({
  message: "Connection request sent",
  connection,
});
    } catch (error) {
      console.error(
        "Connection request error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =========================
// GET USER CONNECTIONS
// =========================

app.get(
  "/api/connections/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (
        String(req.user._id) !==
        String(userId)
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      const connections =
  await Connection.find({
    $or: [
      { requester: userId },
      { recipient: userId },
    ],
  })
    .populate(
      "requester",
      "name email degree year level profilePhoto accountStatus"
    )
    .populate(
      "recipient",
      "name email degree year level profilePhoto accountStatus"
    )
    .sort({ createdAt: -1 });

const activeConnections =
  connections.filter(
    (connection) =>
      connection.requester &&
      connection.recipient &&
      connection.requester.accountStatus === "active" &&
      connection.recipient.accountStatus === "active"
  );
      res.status(200).json({
  connections: activeConnections,
});

    } catch (error) {
      console.error(
        "Fetch connections error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =========================
// ACCEPT CONNECTION
// =========================

app.put(
  "/api/connections/:connectionId/accept",
  authMiddleware,
  async (req, res) => {
    try {
      const { connectionId } =
        req.params;

      const connection =
        await Connection.findById(
          connectionId
        );

      if (!connection) {
        return res.status(404).json({
          message: "Connection not found",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      connection.status = "accepted";

      await connection.save();
      const recipientUser = await User.findById(connection.recipient).select("name");

if (recipientUser) {

  // 🔔 WEBSITE NOTIFICATION — ALWAYS
  await Notification.create({
    user: connection.requester,
    type: "connection-accepted",
    message: `${recipientUser.name} accepted your connection request.`,
    relatedId: connection._id,
    isRead: false,
  });

  // 🖥️ BROWSER PUSH — REQUEST ACCEPTED SETTING KE ACCORDING
  const canSendBrowserPush =
    await canSendNotification(
      connection.requester,
      "requestAccepted"
    );

  if (canSendBrowserPush) {
    await sendPushNotification(
      connection.requester,
      {
        title: "College Connect",
        body: `${recipientUser.name} accepted your connection request.`,
        url: "/",
      }
    );
  }
}


      res.json({
        message: "Connection accepted",
        connection,
      });

    } catch (error) {
      console.error(
        "Accept connection error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =========================
// REJECT CONNECTION
// =========================

app.put(
  "/api/connections/:connectionId/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const { connectionId } =
        req.params;

      const connection =
        await Connection.findById(
          connectionId
        );

      if (!connection) {
        return res.status(404).json({
          message: "Connection not found",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      connection.status = "rejected";

      await connection.save();
      const recipientUser = await User.findById(connection.recipient).select("name");

if (recipientUser) {

  // 🔔 WEBSITE NOTIFICATION — ALWAYS
  await Notification.create({
    user: connection.requester,
    type: "connection-rejected",
    message: `${recipientUser.name} rejected your connection request.`,
    relatedId: connection._id,
    isRead: false,
  });

  // 🖥️ BROWSER PUSH — REQUEST ACCEPTED SETTING KE ACCORDING
  const canSendBrowserPush =
    await canSendNotification(
      connection.requester,
      "requestAccepted"
    );

  if (canSendBrowserPush) {
    await sendPushNotification(
      connection.requester,
      {
        title: "College Connect",
        body: `${recipientUser.name} rejected your connection request.`,
        url: "/",
      }
    );
  }
}
      res.json({
        message: "Connection rejected",
        connection,
      });

    } catch (error) {
      console.error(
        "Reject connection error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =====================================================
// BLOCK STUDENT
// =====================================================

app.post(
  "/api/blocks",
  authMiddleware,
  async (req, res) => {
    try {
      const blocker = req.user._id;
      const { blocked } = req.body;

      if (!blocked) {
        return res.status(400).json({
          message: "Student ID is required",
        });
      }

      if (
        String(blocker) ===
        String(blocked)
      ) {
        return res.status(400).json({
          message:
            "You cannot block yourself",
        });
      }

      const student =
        await User.findById(blocked);

      if (!student) {
        return res.status(404).json({
          message: "Student not found",
        });
      }

      const existingBlock =
        await Block.findOne({
          blocker,
          blocked,
        });

      if (existingBlock) {
        return res.status(400).json({
          message: "Student is already blocked",
        });
      }

      await Block.create({
        blocker,
        blocked,
      });

      res.status(201).json({
        message: "Student blocked successfully",
      });

    } catch (error) {
      console.error(
        "Block student error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =====================================================
// CHECK BLOCK STATUS
// =====================================================

app.get(
  "/api/blocks/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser = req.user._id;
      const { studentId } = req.params;

      const block = await Block.findOne({
        $or: [
          {
            blocker: currentUser,
            blocked: studentId,
          },
          {
            blocker: studentId,
            blocked: currentUser,
          },
        ],
      });

      res.json({
        isBlocked: !!block,
      });

    } catch (error) {
      console.error(
        "Check block status error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// =====================================================
// UNBLOCK STUDENT
// =====================================================

app.delete(
  "/api/blocks/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const blocker = req.user._id;
      const { studentId } =
        req.params;

      await Block.findOneAndDelete({
        blocker,
        blocked: studentId,
      });

      res.json({
        message:
          "Student unblocked successfully",
      });

    } catch (error) {
      console.error(
        "Unblock student error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


// =====================================================
// LOAD PRIVATE CHAT
// =====================================================

app.get(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { user1, user2 } =
        req.query;

      if (!user1 || !user2) {
        return res.status(400).json({
          message:
            "user1 and user2 are required",
        });
      }

      if (
        String(req.user._id) !==
          String(user1) &&
        String(req.user._id) !==
          String(user2)
      ) {
        return res.status(403).json({
          message: "Not authorized",
        });
      }

      // ==========================================
// CHECK BOTH USERS ARE ACTIVE
// ==========================================

const chatUsers =
  await User.find({
    _id: {
      $in: [user1, user2],
    },
    accountStatus: "active",
  }).select("_id");

if (chatUsers.length !== 2) {
  return res.status(403).json({
    message:
      "Chat is not available with this student.",
  });
}

      const messages =
        await Message.find({
          $or: [
            {
              sender: user1,
              receiver: user2,
            },
            {
              sender: user2,
              receiver: user1,
            },
          ],
        })
          .sort({ createdAt: 1 })
          .populate(
            "sender",
            "name"
          )
          .populate(
            "receiver",
            "name"
          );

      res.json({
        messages,
      });

    } catch (error) {
      console.error(
        "Fetch messages error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


/// =====================================================
// SEND PRIVATE CHAT MESSAGE
// =====================================================

app.post(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { receiver, text } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !receiver ||
        !text ||
        !text.trim()
      ) {
        return res.status(400).json({
          message:
            "Receiver and message are required",
        });
      }

      const sender = req.user._id;

      // ==========================================
      // PREVENT SELF MESSAGE
      // ==========================================

      if (
        String(sender) ===
        String(receiver)
      ) {
        return res.status(400).json({
          message:
            "You cannot message yourself",
        });
      }

      // ==========================================
// CHECK RECEIVER ACCOUNT IS ACTIVE
// ==========================================

const receiverUser =
  await User.findById(receiver)
    .select("accountStatus");

if (!receiverUser) {
  return res.status(404).json({
    message:
      "Student not found.",
  });
}

if (
  receiverUser.accountStatus !==
  "active"
) {
  return res.status(403).json({
    message:
      "You cannot send a message to this student.",
  });
}

      // ==========================================
      // EDUCATION-ONLY CHAT KEYWORD CHECK
      // ==========================================

      const messageText = text
        .trim()
        .toLowerCase();

      // Words/topics related to education,
      // study, projects, technology and career.
      const educationKeywords = [
        // Study / academics
        "study",
        "studies",
        "student",
        "college",
        "university",
        "school",
        "class",
        "lecture",
        "subject",
        "semester",
        "exam",
        "exams",
        "test",
        "assignment",
        "homework",
        "question",
        "doubt",
        "syllabus",
        "marks",
        "grade",
        "notes",
        "paper",
        "question paper",
        "revision",
        "learning",
        "learn",
        "education",
        "academic",

        // Projects
        "project",
        "projects",
        "project idea",
        "final year project",
        "mini project",
        "major project",
        "presentation",
        "ppt",
        "documentation",
        "report",

        // Coding / Technology
        "coding",
        "code",
        "programming",
        "program",
        "developer",
        "development",
        "software",
        "website",
        "web development",
        "frontend",
        "backend",
        "javascript",
        "typescript",
        "react",
        "node",
        "nodejs",
        "python",
        "java",
        "c++",
        "c programming",
        "html",
        "css",
        "sql",
        "database",
        "mongodb",
        "mysql",
        "api",
        "debug",
        "debugging",
        "error",
        "technology",
        "tech",
        "computer",
        "computer science",
        "artificial intelligence",
        "ai",
        "machine learning",
        "ml",
        "data science",

        // Career / Internship
        "internship",
        "intern",
        "career",
        "job",
        "placement",
        "placements",
        "resume",
        "cv",
        "interview",
        "skills",
        "skill",
        "portfolio",
        "linkedin",
        "experience",

        // Academic collaboration / resources
        "resource",
        "resources",
        "study material",
        "material",
        "reference",
        "book",
        "books",
        "research",
        "research paper",
        "article",
        "seminar",
        "workshop",
        "team",
        "teamwork",
        "collaboration",
        "academic",
        "technical",
        "technical work",

        // UG / PG
        "btech",
        "b.tech",
        "mtech",
        "m.tech",
        "be",
        "b.e",
        "me",
        "m.e",
        "ug",
        "pg",
        "engineering",
        "degree",
        "branch",
        "department"
      ];

      // Personal / social topics that should not
      // be allowed in College Connect chat.
      const blockedKeywords = [
        "instagram",
        "insta",
        "facebook",
        "snapchat",
        "telegram",
        "whatsapp",
        "whatsapp number",
        "phone number",
        "mobile number",
        "contact number",
        "dating",
        "date",
        "girlfriend",
        "boyfriend",
        "crush",
        "flirt",
        "flirting",
        "love",
        "romantic",
        "romance",
        "relationship",
        "kiss",
        "meet me",
        "meetup",
        "hangout",
        "party",
        "personal",
        "home address",
        "address",
        "where do you live",
        "where are you from",
        "photo",
        "selfie"
      ];

      const containsBlockedKeyword =
        blockedKeywords.some((keyword) =>
          messageText.includes(keyword)
        );

      // If message contains clearly personal/social
      // content, reject it immediately.
      if (containsBlockedKeyword) {
        return res.status(400).json({
          message:
            "Please keep chat limited to education, study, projects, technology, internships, career, skills, learning, notes, resources and academic collaboration.",
        });
      }

      const containsEducationKeyword =
        educationKeywords.some((keyword) =>
          messageText.includes(keyword)
        );

      // Messages without any educational context
      // are not allowed.
      if (!containsEducationKeyword) {
        return res.status(400).json({
          message:
            "This chat is only for education, study, projects, technology, internships, career, skills, learning, notes, resources and academic collaboration.",
        });
      }

      // ==========================================
      // CHECK BLOCK
      // ==========================================

      const existingBlock =
        await Block.findOne({
          $or: [
            {
              blocker: sender,
              blocked: receiver,
            },
            {
              blocker: receiver,
              blocked: sender,
            },
          ],
        });

      if (existingBlock) {
        return res.status(403).json({
          message:
            "Message cannot be sent because one of the students has blocked the other.",
        });
      }

      // ==========================================
      // ONLY ACCEPTED CONNECTION CAN CHAT
      // ==========================================

      const connection =
        await Connection.findOne({
          $or: [
            {
              requester: sender,
              recipient: receiver,
              status: "accepted",
            },
            {
              requester: receiver,
              recipient: sender,
              status: "accepted",
            },
          ],
        });

      if (!connection) {
        return res.status(403).json({
          message:
            "You can only chat with an accepted connection",
        });
      }

      // ==========================================
      // SAVE MESSAGE
      // ==========================================

      const message =
        await Message.create({
          sender,
          receiver,
          text: text.trim(),
        });
        
      // ==========================================
      // CHAT NOTIFICATION
      // ==========================================

      const senderUser =
        await User.findById(sender)
          .select("name");

     if (senderUser) {

  // 🔔 WEBSITE NOTIFICATION — ALWAYS
  await Notification.create({
    user: receiver,
    type: "chat",
    message: `💬 ${senderUser.name} sent you a message.`,
    relatedId: message._id,
    isRead: false,
  });

  // 🖥️ BROWSER PUSH — CHAT SETTING KE ACCORDING
  const canSendBrowserPush =
    await canSendNotification(
      receiver,
      "chatMessages"
    );

  if (canSendBrowserPush) {
    await sendPushNotification(
      receiver,
      {
        title: "College Connect",
        body: `💬 ${senderUser.name} sent you a message.`,
        url: "/",
      }
    );
  }
}

      // ==========================================
      // POPULATE MESSAGE
      // ==========================================

      const populatedMessage =
        await Message.findById(
          message._id
        )
          .populate(
            "sender",
            "name"
          )
          .populate(
            "receiver",
            "name"
          );

      // ==========================================
      // SUCCESS RESPONSE
      // ==========================================

      res.status(201).json({
        message: populatedMessage,
      });

    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// =====================================================
// UNSEND PRIVATE CHAT MESSAGE
// =====================================================
app.delete(
  "/api/messages/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const messageId = req.params.id;
      const userId = req.user._id;

      const message =
        await Message.findById(messageId);

      if (!message) {
        return res.status(404).json({
          message: "Message not found.",
        });
      }

      // Only the person who sent the message
      // can unsend it.
      if (
        String(message.sender) !==
        String(userId)
      ) {
        return res.status(403).json({
          message:
            "You can only unsend your own messages.",
        });
      }

      // Delete the message from database.
      // This removes it for BOTH students.
      await Message.findByIdAndDelete(
        messageId
      );

      // Remove related chat notification too,
      // if one exists.
      await Notification.deleteMany({
        relatedId: messageId,
        type: "chat",
      });

      res.status(200).json({
        message: "Message unsent successfully.",
      });
    } catch (error) {
      console.error(
        "Unsend message error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to unsend message.",
      });
    }
  }
);

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running on http://localhost:${PORT}`
        );

      }
    );

  })
  .catch((error) => {

    console.error(
      "MongoDB connection failed:",
      error.message
    );

  });

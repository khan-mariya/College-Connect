const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authMiddleware = require("./middleware/authMiddleware");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const User = require("./models/User");
const Message = require("./models/Message");
const Project = require("./models/Project");
const Query = require("./models/Query");
const Answer = require("./models/Answer");
const SavedAnswer = require("./models/SavedAnswer");
const StudyMaterial = require("./models/StudyMaterial");
const Connection = require("./models/Connection");
const Notification = require("./models/Notification");

const app = express();

app.use(cors());
app.use(express.json());


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

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful.",
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
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
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
// ======================================================

app.get(
  "/api/students",
  authMiddleware,
  async (req, res) => {
    try {
      const { degree, year } = req.query;

      const filter = {};

      if (degree) {
        filter.degree = degree;
      }

      if (year) {
        filter.year = year;
      }

      const students = await User.find(filter)
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

      const user = await User.findById(id).select(
        "name level degree year college skills city state profilePhoto"
      );

      if (!user) {
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
        message:
          "Unable to load profile.",
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

// GET PROJECTS

app.get("/api/projects", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({})
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
      message: "Unable to fetch projects.",
    });
  }
});


// ADD PROJECT

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

      const owner = req.user._id;

      if (!title || !description) {
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
          message: "Project title cannot be empty.",
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

      const user = await User.findById(owner);

      if (!user) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }

        return res.status(404).json({
          message: "User not found.",
        });
      }

      let projectSkills = [];

      if (skills) {
        try {
          const parsedSkills = JSON.parse(skills);

          if (Array.isArray(parsedSkills)) {
            projectSkills = parsedSkills
              .map((skill) => String(skill).trim())
              .filter(
                (skill) => skill.length > 0
              );
          }
        } catch {
          projectSkills = skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(
              (skill) => skill.length > 0
            );
        }
      }

      if (projectSkills.length === 0) {
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
      // -----------------------------------------------

      const newProject =
        await Project.create({
          title: title.trim(),

          description:
            description.trim(),

          skills: projectSkills,

          level: user.level,

          degree: user.degree,

          branch: branch
            ? branch.trim()
            : "",

          academicYear,

          projectLink:
            projectLink
              ? projectLink.trim()
              : "",

          projectFileUrl,

          projectFileName,

          owner: user._id,
        });

      const project =
        await Project.findById(
          newProject._id
        ).populate(
          "owner",
          "name level degree year college profilePhoto"
        );

      // -----------------------------------------------
      // NOTIFY SAME DEGREE + YEAR STUDENTS
      // -----------------------------------------------

      const matchingStudents =
        await User.find({
          degree: user.degree,
          year: user.year,
          _id: {
            $ne: user._id,
          },
        }).select("_id");

      if (matchingStudents.length > 0) {
        await Notification.insertMany(
          matchingStudents.map(
            (student) => ({
              user: student._id,

              type: "project",

              message:
                `💻 ${user.name} shared a new project`,

              relatedId:
                newProject._id,

              isRead: false,
            })
          )
        );
      }

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


// DELETE PROJECT

app.delete(
  "/api/projects/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const owner = req.user._id;

      const project =
        await Project.findById(id);

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
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

      if (project.projectFileUrl) {
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
          fs.unlinkSync(filePath);
        }
      }

      await Project.findByIdAndDelete(id);

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

// GET ALL QUERIES

app.get(
  "/api/queries",
  authMiddleware,
  async (req, res) => {
    try {
      const queries =
        await Query.find({})
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

      const answers =
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


// ADD QUERY

app.post(
  "/api/queries",
  authMiddleware,
  async (req, res) => {
    try {
      const { text } = req.body;

      const owner = req.user._id;

      if (!text) {
        return res.status(400).json({
          message:
            "Query text is required.",
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

      const allStudents =
        await User.find({})
          .select("_id");

      if (allStudents.length > 0) {
        await Notification.insertMany(
          allStudents.map(
            (student) => ({
              user: student._id,

              type: "answer",

              message:
                `${user.name} posted a new query.`,

              relatedId:
                newQuery._id,

              isRead: false,
            })
          )
        );
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


// DELETE QUERY + ITS ANSWERS + SAVED ANSWERS

app.delete(
  "/api/queries/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      const owner = req.user._id;

      const query =
        await Query.findById(id);

      if (!query) {
        return res.status(404).json({
          message:
            "Query not found.",
        });
      }

      if (
        String(query.owner) !==
        String(owner)
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own query.",
        });
      }

      const answers =
        await Answer.find({
          query: id,
        }).select("_id");

      const answerIds =
        answers.map(
          (answer) => answer._id
        );

      if (answerIds.length > 0) {
        await SavedAnswer.deleteMany({
          answer: {
            $in: answerIds,
          },
        });

        await Answer.deleteMany({
          query: id,
        });
      }

      await Query.findByIdAndDelete(id);

      res.status(200).json({
        message:
          "Query and its answers deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Query delete error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete query.",
      });
    }
  }
);


// ======================================================
// ANSWERS
// ======================================================

// GET ANSWERS

app.get(
  "/api/queries/:queryId/answers",
  authMiddleware,
  async (req, res) => {
    try {
      const { queryId } =
        req.params;

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


// ADD ANSWER

app.post(
  "/api/queries/:queryId/answers",
  authMiddleware,
  async (req, res) => {
    try {
      const { queryId } =
        req.params;

      const { answer } =
        req.body;

      const author =
        req.user._id;

      if (!answer || !author) {
        return res.status(400).json({
          message:
            "Answer and author are required.",
        });
      }

      if (!answer.trim()) {
        return res.status(400).json({
          message:
            "Answer cannot be empty.",
        });
      }

      const query =
        await Query.findById(
          queryId
        );

      if (!query) {
        return res.status(404).json({
          message:
            "Query not found.",
        });
      }

      const user =
        await User.findById(author);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const newAnswer =
        await Answer.create({
          answer: answer.trim(),
          query: queryId,
          author,
        });

      const allStudents =
        await User.find({})
          .select("_id");

      if (allStudents.length > 0) {
        await Notification.insertMany(
          allStudents.map(
            (student) => ({
              user: student._id,

              type: "answer",

              message:
                `${user.name} answered a query.`,

              relatedId:
                newAnswer._id,

              isRead: false,
            })
          )
        );
      }

      const createdAnswer =
        await Answer.findById(
          newAnswer._id
        ).populate(
          "author",
          "name degree"
        );

      res.status(201).json({
        message:
          "Answer added successfully.",

        answer:
          createdAnswer,
      });

    } catch (error) {
      console.error(
        "Answer add error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to add answer.",
      });
    }
  }
);


// DELETE ANSWER

app.delete(
  "/api/answers/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const author =
        req.user._id;

      const answer =
        await Answer.findById(id);

      if (!answer) {
        return res.status(404).json({
          message:
            "Answer not found.",
        });
      }

      if (
        String(answer.author) !==
        String(author)
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own answer.",
        });
      }

      await SavedAnswer.deleteMany({
        answer: id,
      });

      await Answer.findByIdAndDelete(id);

      res.status(200).json({
        message:
          "Answer deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Answer delete error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete answer.",
      });
    }
  }
);


// ======================================================
// SAVED ANSWERS
// ======================================================

// GET SAVED ANSWERS FOR USER

app.get(
  "/api/saved-answers/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      if (
        String(req.user._id) !==
        String(userId)
      ) {
        return res.status(403).json({
          message:
            "You can only view your own saved answers.",
        });
      }

      const savedAnswers =
        await SavedAnswer.find({
          user: userId,
        })
          .populate({
            path: "answer",

            populate: [
              {
                path: "author",
                select:
                  "name degree",
              },

              {
                path: "query",
                select:
                  "text owner",
              },
            ],
          })
          .sort({
            createdAt: -1,
          });

      const validSavedAnswers =
        savedAnswers.filter(
          (item) => item.answer
        );

      res.status(200).json({
        savedAnswers:
          validSavedAnswers,
      });

    } catch (error) {
      console.error(
        "Saved answers fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch saved answers.",
      });
    }
  }
);


// SAVE ANSWER

app.post(
  "/api/saved-answers",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        req.user._id;

      const { answer } =
        req.body;

      if (!user || !answer) {
        return res.status(400).json({
          message:
            "User and answer are required.",
        });
      }

      const existingSave =
        await SavedAnswer.findOne({
          user,
          answer,
        });

      if (existingSave) {
        return res.status(409).json({
          message:
            "Answer already saved.",

          savedAnswer:
            existingSave,
        });
      }

      const answerExists =
        await Answer.findById(
          answer
        );

      if (!answerExists) {
        return res.status(404).json({
          message:
            "Answer not found.",
        });
      }

      const userExists =
        await User.findById(user);

      if (!userExists) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const savedAnswer =
        await SavedAnswer.create({
          user,
          answer,
        });

      if (
        String(answerExists.author) !==
        String(user)
      ) {
        const saver =
          await User.findById(user);

        await Notification.create({
          user:
            answerExists.author,

          type:
            "answer",

          message:
            `${saver?.name || "A student"} saved your answer.`,

          relatedId:
            answerExists._id,

          isRead: false,
        });
      }

      res.status(201).json({
        message:
          "Answer saved successfully.",

        savedAnswer,
      });

    } catch (error) {
      console.error(
        "Save answer error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to save answer.",
      });
    }
  }
);


// DELETE SAVED ANSWER

app.delete(
  "/api/saved-answers/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const user =
        req.user._id;

      const savedAnswer =
        await SavedAnswer.findById(id);

      if (!savedAnswer) {
        return res.status(404).json({
          message:
            "Saved answer not found.",
        });
      }

      if (
        String(savedAnswer.user) !==
        String(user)
      ) {
        return res.status(403).json({
          message:
            "You can only remove your own saved answer.",
        });
      }

      await SavedAnswer.findByIdAndDelete(
        id
      );

      res.status(200).json({
        message:
          "Saved answer removed.",
      });

    } catch (error) {
      console.error(
        "Saved answer delete error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to remove saved answer.",
      });
    }
  }
);


// ======================================================
// STUDY HUB
// ======================================================

// GET STUDY MATERIAL

app.get(
  "/api/study-materials",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        degree,
        year,
        category,
      } = req.query;

      const filter = {};

      if (degree) {
        filter.degree = degree;
      }

      if (year) {
        filter.year = year;
      }

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


// UPLOAD STUDY MATERIAL

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

      const owner =
        req.user._id;

      const degree =
        req.user.degree;

      const year =
        req.user.year;

      if (
        !title ||
        !category ||
        !owner ||
        !degree ||
        !year
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

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select a file.",
        });
      }

      const user =
        await User.findById(owner);

      if (!user) {
        fs.unlinkSync(
          req.file.path
        );

        return res.status(404).json({
          message:
            "User not found.",
        });
      }

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

          owner,

          degree:
            degree.trim(),

          year:
            year.trim(),
        });

      const createdMaterial =
        await StudyMaterial.findById(
          material._id
        ).populate(
          "owner",
          "name degree year profilePhoto"
        );

      const matchingStudents =
        await User.find({
          degree: user.degree,
          year: user.year,
        }).select("_id");

      if (
        matchingStudents.length > 0
      ) {
        await Notification.insertMany(
          matchingStudents.map(
            (student) => ({
              user:
                student._id,

              type:
                "answer",

              message:
                `📚 ${user.name} shared new ${category}`,

              relatedId:
                material._id,

              isRead: false,
            })
          )
        );
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

      if (req.file) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {}
      }

      res.status(500).json({
        message:
          "Unable to upload study material.",
      });
    }
  }
);


// DELETE STUDY MATERIAL

app.delete(
  "/api/study-materials/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const owner =
        req.user._id;

      const material =
        await StudyMaterial.findById(
          id
        );

      if (!material) {
        return res.status(404).json({
          message:
            "Study material not found.",
        });
      }

      if (
        String(material.owner) !==
        String(owner)
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own material.",
        });
      }

      if (material.fileUrl) {
        const filePath =
          path.join(
            __dirname,
            material.fileUrl.replace(
              "/uploads/",
              "uploads/"
            )
          );

        if (
          fs.existsSync(filePath)
        ) {
          fs.unlinkSync(filePath);
        }
      }

      await StudyMaterial.findByIdAndDelete(
        id
      );

      res.status(200).json({
        message:
          "Study material deleted successfully.",
      });

    } catch (error) {
      console.error(
        "Study material delete error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to delete study material.",
      });
    }
  }
);
// ======================================================
// CONNECTIONS
// ======================================================

// SEND CONNECTION REQUEST

app.post(
  "/api/connections",
  authMiddleware,
  async (req, res) => {
    try {
      const { recipient } =
        req.body;

      const requester =
        req.user._id;

      if (
        !requester ||
        !recipient
      ) {
        return res.status(400).json({
          message:
            "Requester and recipient are required.",
        });
      }

      if (
        String(requester) ===
        String(recipient)
      ) {
        return res.status(400).json({
          message:
            "You cannot connect with yourself.",
        });
      }

      const requesterUser =
        await User.findById(
          requester
        );

      const recipientUser =
        await User.findById(
          recipient
        );

      if (
        !requesterUser ||
        !recipientUser
      ) {
        return res.status(404).json({
          message:
            "Student not found.",
        });
      }

      // Same Degree + Year only

      if (
        String(
          requesterUser.degree
        ).trim().toLowerCase() !==
          String(
            recipientUser.degree
          ).trim().toLowerCase() ||
        String(
          requesterUser.year
        ).trim().toLowerCase() !==
          String(
            recipientUser.year
          ).trim().toLowerCase()
      ) {
        return res.status(403).json({
          message:
            "You can only connect with students from the same degree and year.",
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
        return res.status(409).json({
          message:
            "Connection already exists or is pending.",

          connection:
            existingConnection,
        });
      }

      const connection =
        await Connection.create({
          requester,
          recipient,
        });

      // Notify recipient

      await Notification.create({
        user: recipient,

        type:
          "connection",

        message:
          `${requesterUser.name} sent you a connection request.`,

        relatedId:
          connection._id,

        isRead: false,
      });

      res.status(201).json({
        message:
          "Connection request sent.",

        connection,
      });

    } catch (error) {
      console.error(
        "Connection error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to send connection request.",
      });
    }
  }
);


// GET CONNECTIONS

app.get(
  "/api/connections/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      if (
        String(req.user._id) !==
        String(userId)
      ) {
        return res.status(403).json({
          message:
            "You can only view your own connections.",
        });
      }

      const connections =
        await Connection.find({
          $or: [
            {
              requester: userId,
            },
            {
              recipient: userId,
            },
          ],
        })
          .populate(
            "requester",
            "name degree year profilePhoto"
          )
          .populate(
            "recipient",
            "name degree year profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json({
        connections,
      });

    } catch (error) {
      console.error(
        "Connections fetch error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to fetch connections.",
      });
    }
  }
);


// ======================================================
// ACCEPT CONNECTION REQUEST
// ======================================================

app.put(
  "/api/connections/:id/accept",
  authMiddleware,
  async (req, res) => {
    try {
      const connection =
        await Connection.findById(
          req.params.id
        );

      if (!connection) {
        return res.status(404).json({
          message:
            "Connection request not found.",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You can only accept your own connection requests.",
        });
      }

      const requesterUser =
        await User.findById(
          connection.requester
        );

      const recipientUser =
        await User.findById(
          connection.recipient
        );

      if (
        !requesterUser ||
        !recipientUser
      ) {
        return res.status(404).json({
          message:
            "Student not found.",
        });
      }

      connection.status =
        "accepted";

      await connection.save();

      // Notify requester

      await Notification.create({
        user:
          connection.requester,

        type:
          "connection-accepted",

        message:
          `${recipientUser.name} accepted your connection request.`,

        relatedId:
          connection._id,

        isRead: false,
      });

      // Notify recipient

      await Notification.create({
        user:
          connection.recipient,

        type:
          "connection-accepted",

        message:
          `You are now connected with ${requesterUser.name}.`,

        relatedId:
          connection._id,

        isRead: false,
      });

      res.status(200).json({
        message:
          "Connection accepted.",

        connection,
      });

    } catch (error) {
      console.error(
        "Accept connection error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to accept connection.",
      });
    }
  }
);


// ======================================================
// REJECT CONNECTION REQUEST
// ======================================================

app.put(
  "/api/connections/:id/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const connection =
        await Connection.findById(
          req.params.id
        );

      if (!connection) {
        return res.status(404).json({
          message:
            "Connection request not found.",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You can only reject your own connection requests.",
        });
      }

      const recipientUser =
        await User.findById(
          connection.recipient
        );

      if (!recipientUser) {
        return res.status(404).json({
          message:
            "Student not found.",
        });
      }

      connection.status =
        "rejected";

      await connection.save();

      // Notify requester only

      await Notification.create({
        user:
          connection.requester,

        type:
          "connection-rejected",

        message:
          `${recipientUser.name} rejected your connection request.`,

        relatedId:
          connection._id,

        isRead: false,
      });

      res.status(200).json({
        message:
          "Connection request rejected.",

        connection,
      });

    } catch (error) {
      console.error(
        "Reject connection error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to reject connection.",
      });
    }
  }
);


// ======================================================
// MULTER ERROR HANDLER
// ======================================================

app.use(
  (error, req, res, next) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "File size cannot exceed 10 MB.",
        });
      }

      return res.status(400).json({
        message:
          "File upload failed.",
      });
    }

    if (
      error &&
      error.message
    ) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    next();
  }
);


// ======================================================
// EDUCATION-ONLY CHAT FILTER
// ======================================================

const isEducationRelatedMessage = (
  text
) => {
  const message =
    text.toLowerCase().trim();

  const personalPatterns = [
    /\b(instagram|insta)\b/,
    /\b(snapchat)\b/,
    /\b(whatsapp number|phone number|mobile number)\b/,
    /\b(your number|give me your number)\b/,
    /\b(where do you live|where are you from)\b/,
    /\b(let'?s meet|meet me|can we meet)\b/,
    /\b(date me|go on a date)\b/,
    /\b(girlfriend|boyfriend)\b/,
    /\b(crush)\b/,
    /\b(love me|i love you)\b/,
    /\b(send me your photo|send your photo)\b/,
  ];

  if (
    personalPatterns.some(
      (pattern) =>
        pattern.test(message)
    )
  ) {
    return false;
  }

  const educationKeywords = [
    "study",
    "studies",
    "education",
    "college",
    "university",
    "subject",
    "exam",
    "exams",
    "semester",
    "assignment",
    "homework",
    "notes",
    "question",
    "doubt",
    "syllabus",
    "lecture",
    "class",
    "project",
    "coding",
    "code",
    "programming",
    "software",
    "technology",
    "technical",
    "research",
    "internship",
    "career",
    "job",
    "skill",
    "skills",
    "learning",
    "learn",
    "developer",
    "development",
    "database",
    "dbms",
    "python",
    "java",
    "javascript",
    "react",
    "c++",
    "c",
    "html",
    "css",
    "engineering",
    "degree",
    "branch",
    "practical",
    "viva",
    "paper",
    "previous year",
    "question bank",
    "resource",
    "material",
    "pdf",
  ];

  const greetingPatterns = [
    /^hi$/,
    /^hii$/,
    /^hiii$/,
    /^hello$/,
    /^hey$/,
    /^heyy$/,
    /^good morning$/,
    /^good afternoon$/,
    /^good evening$/,
  ];

  if (
    greetingPatterns.some(
      (pattern) =>
        pattern.test(message)
    )
  ) {
    return true;
  }

  return educationKeywords.some(
    (keyword) =>
      message.includes(keyword)
  );
};


// ======================================================
// PRIVATE CHAT
// ======================================================

// GET MESSAGES

app.get(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        user1,
        user2,
      } = req.query;

      if (
        !user1 ||
        !user2
      ) {
        return res.status(400).json({
          message:
            "Both users are required.",
        });
      }

      if (
        String(req.user._id) !==
          String(user1) &&
        String(req.user._id) !==
          String(user2)
      ) {
        return res.status(403).json({
          message:
            "You can only view your own conversations.",
        });
      }

      const connection =
        await Connection.findOne({
          $or: [
            {
              requester: user1,
              recipient: user2,
            },
            {
              requester: user2,
              recipient: user1,
            },
          ],

          status:
            "accepted",
        });

      if (!connection) {
        return res.status(403).json({
          message:
            "Chat is available only after connection is accepted.",
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
          .populate(
            "sender",
            "name"
          )
          .populate(
            "receiver",
            "name"
          )
          .sort({
            createdAt: 1,
          });

      res.status(200).json({
        messages,
      });

    } catch (error) {
      console.error(
        "Get messages error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to load messages.",
      });
    }
  }
);


// SEND MESSAGE

app.post(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        receiver,
        text,
      } = req.body;

      const sender =
        req.user._id;

      if (
        !receiver ||
        !text?.trim()
      ) {
        return res.status(400).json({
          message:
            "Sender, receiver and message are required.",
        });
      }

      if (
        !isEducationRelatedMessage(
          text
        )
      ) {
        return res.status(400).json({
          message:
            "⚠️ Please keep your chat related to studies, education, projects, skills, internships or career.",
        });
      }

      const connection =
        await Connection.findOne({
          $or: [
            {
              requester: sender,
              recipient: receiver,
            },
            {
              requester: receiver,
              recipient: sender,
            },
          ],

          status:
            "accepted",
        });

      if (!connection) {
        return res.status(403).json({
          message:
            "You can chat only with an accepted connection.",
        });
      }

      const message =
        await Message.create({
          sender,
          receiver,
          text: text.trim(),
        });

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

      res.status(201).json({
        message:
          populatedMessage,
      });

    } catch (error) {
      console.error(
        "Send message error:",
        error.message
      );

      res.status(500).json({
        message:
          "Unable to send message.",
      });
    }
  }
);


// ======================================================
// NOTIFICATIONS
// ======================================================

// GET NOTIFICATIONS

app.get(
  "/api/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        req.user._id;

      const notifications =
        await Notification.find({
          user,
        })
          .sort({
            createdAt: -1,
          })
          .limit(50);

      res.json({
        notifications,
      });

    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch notifications",
      });
    }
  }
);


// UNREAD COUNT

app.get(
  "/api/notifications/unread-count",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        req.user._id;

      const count =
        await Notification.countDocuments({
          user,
          isRead: false,
        });

      res.json({
        count,
      });

    } catch (error) {
      console.error(
        "Unread notification count error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to get unread notification count",
      });
    }
  }
);


// MARK ONE AS READ

app.put(
  "/api/notifications/:id/read",
  authMiddleware,
  async (req, res) => {
    try {
      const notification =
        await Notification.findById(
          req.params.id
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      if (
        String(notification.user) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You can only update your own notifications.",
        });
      }

      notification.isRead =
        true;

      await notification.save();

      res.json({
        message:
          "Notification marked as read",

        notification,
      });

    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update notification",
      });
    }
  }
);


// MARK ALL AS READ

app.put(
  "/api/notifications/read-all",
  authMiddleware,
  async (req, res) => {
    try {
      const user =
        req.user._id;

      await Notification.updateMany(
        {
          user,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      res.json({
        message:
          "All notifications marked as read",
      });

    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update notifications",
      });
    }
  }
);


// ======================================================
// MONGODB CONNECTION
// ======================================================

const PORT =
  process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI
  )
  .then(() => {
    console.log(
      "MongoDB connected successfully"
    );

    app.listen(
      PORT,
      "0.0.0.0",
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
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
const Block = require("./models/Block");
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

      const students =
        await User.find({
          degree: currentUser.degree,
          year: currentUser.year,

          // Don't show the logged-in user
          _id: {
            $ne: currentUser._id,
          },
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
        message: "Unable to load profile.",
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

          degree:
            user.degree,

          year:
            user.year,

          _id: {
            $ne: user._id,
          },

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
                "project",

              message:
                `💻 ${user.name} shared a new project`,

              relatedId:
                newProject._id,

              isRead:
                false,

            })
          )
        );
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

          _id: {
            $ne: user._id,
          },

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
                `${user.name} posted a new query.`,

              relatedId:
                newQuery._id,

              isRead:
                false,

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

      };


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

          degree:
            user.degree,

          year:
            user.year,

          _id: {
            $ne: user._id,
          },

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

              isRead:
                false,

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
  .connect(process.env.MONGODB_URI)
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
        return res.status(400).json({
          message: "Connection already exists",
        });
      }

      const connection =
        await Connection.create({
          requester,
          recipient,
          status: "pending",
        });

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
            "name email degree year level profilePhoto"
          )
          .populate(
            "recipient",
            "name email degree year level profilePhoto"
          )
          .sort({ createdAt: -1 });

      res.json(connections);

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
      const blocker = req.user._id;
      const { studentId } =
        req.params;

      const block =
        await Block.findOne({
          blocker,
          blocked: studentId,
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


// =====================================================
// SEND PRIVATE CHAT MESSAGE
// =====================================================

app.post(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const { receiver, text } =
        req.body;

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
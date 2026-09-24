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
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: cleanEmail,
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
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
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
        return res.status(404).json({
          message:
            "No account found with this email.",
        });
      }

      const resetToken =
        crypto.randomBytes(32).toString("hex");

      user.resetPasswordToken = resetToken;

      user.resetPasswordExpires =
        Date.now() + 15 * 60 * 1000;

      await user.save();

      const transporter =
        nodemailer.createTransport({
          service: "gmail",

          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

      const resetLink =
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject:
          "College Connect - Reset Password",

        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Reset your College Connect password</h2>

            <p>
              Click the button below to reset your password.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:#ffffff;
                text-decoration:none;
                border-radius:8px;
              "
            >
              Reset Password
            </a>

            <p>
              This link will expire in 15 minutes.
            </p>
          </div>
        `,
      });

      res.json({
        message:
          "Password reset link sent to your email.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
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
          message: "Password is required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters.",
        });
      }

      const user = await User.findOne({
        resetPasswordToken: token,

        resetPasswordExpires: {
          $gt: Date.now(),
        },
      });

      if (!user) {
        return res.status(400).json({
          message:
            "Invalid or expired reset link.",
        });
      }

      user.password =
        await bcrypt.hash(password, 10);

      user.resetPasswordToken = "";

      user.resetPasswordExpires = null;

      await user.save();

      res.json({
        message:
          "Password reset successful. Please login.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to reset password.",
      });
    }
  }
);


// ======================================================
// GET CURRENT USER
// ======================================================

app.get(
  "/api/auth/me",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch user.",
      });
    }
  }
);


// ======================================================
// UPDATE PROFILE
// ======================================================

app.put(
  "/api/users/profile",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user._id
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const {
        name,
        college,
        skills,
        city,
        state,
        profilePhoto,
      } = req.body;

      if (name !== undefined) {
        user.name = String(name).trim();
      }

      if (college !== undefined) {
        user.college =
          String(college).trim();
      }

      if (skills !== undefined) {
        user.skills = Array.isArray(skills)
          ? skills
          : [];
      }

      if (city !== undefined) {
        user.city = String(city).trim();
      }

      if (state !== undefined) {
        user.state =
          String(state).trim();
      }

      if (profilePhoto !== undefined) {
        user.profilePhoto =
          String(profilePhoto).trim();
      }

      await user.save();

      res.json({
        message:
          "Profile updated successfully.",

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
          profilePhoto:
            user.profilePhoto,
        },
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update profile.",
      });
    }
  }
);


// ======================================================
// STUDENTS
// ======================================================

app.get(
  "/api/students",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser =
        await User.findById(
          req.user._id
        ).select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const students =
        await User.find({
          degree: currentUser.degree,

          year: currentUser.year,

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
        "Get students error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch students.",
      });
    }
  }
);


// ======================================================
// PROFILE PHOTO UPLOAD
// ======================================================

app.post(
  "/api/users/profile-photo",
  authMiddleware,
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Profile photo is required.",
        });
      }

      const user =
        await User.findById(
          req.user._id
        );

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      user.profilePhoto =
        `/uploads/${req.file.filename}`;

      await user.save();

      res.json({
        message:
          "Profile photo updated successfully.",

        profilePhoto:
          user.profilePhoto,
      });
    } catch (error) {
      console.error(
        "Profile photo upload error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to upload profile photo.",
      });
    }
  }
);
// ======================================================
// PROJECTS
// ======================================================

app.get(
  "/api/projects",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser =
        await User.findById(
          req.user._id
        ).select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const projects =
        await Project.find({
          degree: currentUser.degree,
          year: currentUser.year,
        })
          .populate(
            "user",
            "name level degree year college profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        projects,
      });
    } catch (error) {
      console.error(
        "Get projects error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch projects.",
      });
    }
  }
);


// ======================================================
// ADD PROJECT
// ======================================================

app.post(
  "/api/projects",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        description,
        technologies,
        githubLink,
        liveLink,
        image,
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message:
            "Project title and description are required.",
        });
      }

      const currentUser =
        await User.findById(
          req.user._id
        );

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const project =
        await Project.create({
          user: currentUser._id,
          title: title.trim(),
          description:
            description.trim(),
          technologies:
            Array.isArray(technologies)
              ? technologies
              : [],
          githubLink:
            githubLink
              ? githubLink.trim()
              : "",
          liveLink:
            liveLink
              ? liveLink.trim()
              : "",
          image:
            image
              ? image.trim()
              : "",
          degree:
            currentUser.degree,
          year:
            currentUser.year,
        });

      // ------------------------------------------
      // NOTIFY SAME DEGREE + SAME YEAR
      // ------------------------------------------

      const students =
        await User.find({
          degree: currentUser.degree,
          year: currentUser.year,
          _id: {
            $ne: currentUser._id,
          },
        }).select("_id");

      if (students.length > 0) {
        await Notification.insertMany(
          students.map((student) => ({
            user: student._id,
            type: "project",
            message: `${currentUser.name} added a new project: ${project.title}`,
            relatedId: project._id,
          }))
        );
      }

      res.status(201).json({
        message:
          "Project added successfully.",

        project,
      });
    } catch (error) {
      console.error(
        "Add project error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add project.",
      });
    }
  }
);


// ======================================================
// QUERIES
// ======================================================

app.get(
  "/api/queries",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser =
        await User.findById(
          req.user._id
        ).select("degree year");

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const queries =
        await Query.find({
          degree:
            currentUser.degree,

          year:
            currentUser.year,
        })
          .populate(
            "user",
            "name level degree year college profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        queries,
      });
    } catch (error) {
      console.error(
        "Get queries error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch queries.",
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
      const {
        title,
        description,
      } = req.body;

      if (
        !title ||
        !description
      ) {
        return res.status(400).json({
          message:
            "Query title and description are required.",
        });
      }

      const currentUser =
        await User.findById(
          req.user._id
        );

      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      const query =
        await Query.create({
          user:
            currentUser._id,

          title:
            title.trim(),

          description:
            description.trim(),

          degree:
            currentUser.degree,

          year:
            currentUser.year,
        });

      // ------------------------------------------
      // NOTIFY SAME DEGREE + SAME YEAR
      // ------------------------------------------

      const students =
        await User.find({
          degree:
            currentUser.degree,

          year:
            currentUser.year,

          _id: {
            $ne:
              currentUser._id,
          },
        }).select("_id");

      if (students.length > 0) {
        await Notification.insertMany(
          students.map(
            (student) => ({
              user:
                student._id,

              type:
                "query",

              message:
                `${currentUser.name} posted a new query: ${query.title}`,

              relatedId:
                query._id,
            })
          )
        );
      }

      res.status(201).json({
        message:
          "Query posted successfully.",

        query,
      });
    } catch (error) {
      console.error(
        "Add query error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to post query.",
      });
    }
  }
);


// ======================================================
// STUDY MATERIALS
// ======================================================

app.get(
  "/api/study-materials",
  authMiddleware,
  async (req, res) => {
    try {
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

      const materials =
        await StudyMaterial.find({
          degree:
            currentUser.degree,

          year:
            currentUser.year,
        })
          .populate(
            "user",
            "name level degree year college profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        materials,
      });
    } catch (error) {
      console.error(
        "Get study materials error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch study materials.",
      });
    }
  }
);


// ======================================================
// ADD STUDY MATERIAL
// ======================================================

app.post(
  "/api/study-materials",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        description,
        subject,
        fileUrl,
        fileName,
        materialType,
      } = req.body;

      if (
        !title ||
        !fileUrl
      ) {
        return res.status(400).json({
          message:
            "Title and file are required.",
        });
      }

      const currentUser =
        await User.findById(
          req.user._id
        );

      if (!currentUser) {
        return res.status(404).json({
          message:
            "User not found.",
        });
      }

      const material =
        await StudyMaterial.create({
          user:
            currentUser._id,

          title:
            title.trim(),

          description:
            description
              ? description.trim()
              : "",

          subject:
            subject
              ? subject.trim()
              : "",

          fileUrl:
            fileUrl.trim(),

          fileName:
            fileName
              ? fileName.trim()
              : "",

          materialType:
            materialType
              ? materialType.trim()
              : "",

          degree:
            currentUser.degree,

          year:
            currentUser.year,
        });

      // ------------------------------------------
      // NOTIFY SAME DEGREE + SAME YEAR
      // ------------------------------------------

      const students =
        await User.find({
          degree:
            currentUser.degree,

          year:
            currentUser.year,

          _id: {
            $ne:
              currentUser._id,
          },
        }).select("_id");

      if (students.length > 0) {
        await Notification.insertMany(
          students.map(
            (student) => ({
              user:
                student._id,

              type:
                "study-material",

              message:
                `${currentUser.name} shared new study material: ${material.title}`,

              relatedId:
                material._id,
            })
          )
        );
      }

      res.status(201).json({
        message:
          "Study material added successfully.",

        material,
      });
    } catch (error) {
      console.error(
        "Add study material error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add study material.",
      });
    }
  }
);


// ======================================================
// CONNECTIONS
// ======================================================

app.post(
  "/api/connections",
  authMiddleware,
  async (req, res) => {
    try {
      const requester =
        req.user._id;

      const {
        recipient,
      } = req.body;

      if (!recipient) {
        return res.status(400).json({
          message:
            "Recipient is required.",
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

      // ------------------------------------------
      // CHECK BLOCK IN BOTH DIRECTIONS
      // ------------------------------------------

      const block =
        await Block.findOne({
          $or: [
            {
              blocker:
                requester,

              blocked:
                recipient,
            },

            {
              blocker:
                recipient,

              blocked:
                requester,
            },
          ],
        });

      if (block) {
        return res.status(403).json({
          message:
            "Connection request cannot be sent because one of the students is blocked.",
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
              requester:
                recipient,

              recipient:
                requester,
            },
          ],
        });

      if (existingConnection) {
        return res.status(409).json({
          message:
            "A connection already exists between these students.",
          connection:
            existingConnection,
        });
      }

      const connection =
        await Connection.create({
          requester,
          recipient,
          status:
            "pending",
        });

      // ------------------------------------------
      // NOTIFY RECIPIENT
      // ------------------------------------------

      const requesterUser =
        await User.findById(
          requester
        ).select("name");

      await Notification.create({
        user:
          recipient,

        type:
          "connection",

        message:
          `${requesterUser?.name || "A student"} sent you a connection request.`,

        relatedId:
          connection._id,
      });

      res.status(201).json({
        message:
          "Connection request sent.",

        connection,
      });
    } catch (error) {
      console.error(
        "Create connection error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send connection request.",
      });
    }
  }
);


// ======================================================
// GET CONNECTIONS
// ======================================================

app.get(
  "/api/connections/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser =
        req.user._id;

      if (
        String(currentUser) !==
        String(req.params.userId)
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
              requester:
                currentUser,
            },

            {
              recipient:
                currentUser,
            },
          ],
        })
          .populate(
            "requester",
            "name level degree year college skills city state profilePhoto"
          )
          .populate(
            "recipient",
            "name level degree year college skills city state profilePhoto"
          )
          .sort({
            createdAt: -1,
          });

      res.json({
        connections,
      });
    } catch (error) {
      console.error(
        "Get connections error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch connections.",
      });
    }
  }
);
// ======================================================
// ACCEPT CONNECTION
// ======================================================

app.put(
  "/api/connections/:connectionId/accept",
  authMiddleware,
  async (req, res) => {
    try {
      const connection =
        await Connection.findById(
          req.params.connectionId
        );

      if (!connection) {
        return res.status(404).json({
          message:
            "Connection not found.",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot accept this connection.",
        });
      }

      connection.status =
        "accepted";

      await connection.save();

      // ------------------------------------------
      // NOTIFY REQUESTER
      // ------------------------------------------

      const recipientUser =
        await User.findById(
          req.user._id
        ).select("name");

      await Notification.create({
        user:
          connection.requester,

        type:
          "connection-accepted",

        message:
          `${recipientUser?.name || "A student"} accepted your connection request.`,

        relatedId:
          connection._id,
      });

      res.json({
        message:
          "Connection accepted.",

        connection,
      });
    } catch (error) {
      console.error(
        "Accept connection error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to accept connection.",
      });
    }
  }
);


// ======================================================
// REJECT CONNECTION
// ======================================================

app.put(
  "/api/connections/:connectionId/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const connection =
        await Connection.findById(
          req.params.connectionId
        );

      if (!connection) {
        return res.status(404).json({
          message:
            "Connection not found.",
        });
      }

      if (
        String(connection.recipient) !==
        String(req.user._id)
      ) {
        return res.status(403).json({
          message:
            "You cannot reject this connection.",
        });
      }

      connection.status =
        "rejected";

      await connection.save();

      res.json({
        message:
          "Connection rejected.",

        connection,
      });
    } catch (error) {
      console.error(
        "Reject connection error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to reject connection.",
      });
    }
  }
);


// ======================================================
// BLOCK STUDENT
// ======================================================

app.post(
  "/api/blocks",
  authMiddleware,
  async (req, res) => {
    try {
      const blocker =
        req.user._id;

      const {
        blocked,
      } = req.body;

      if (!blocked) {
        return res.status(400).json({
          message:
            "Student ID is required.",
        });
      }

      if (
        String(blocker) ===
        String(blocked)
      ) {
        return res.status(400).json({
          message:
            "You cannot block yourself.",
        });
      }

      const student =
        await User.findById(
          blocked
        );

      if (!student) {
        return res.status(404).json({
          message:
            "Student not found.",
        });
      }

      const existingBlock =
        await Block.findOne({
          blocker,
          blocked,
        });

      if (existingBlock) {
        return res.json({
          message:
            "Student is already blocked.",
          block:
            existingBlock,
        });
      }

      const block =
        await Block.create({
          blocker,
          blocked,
        });

      // IMPORTANT:
      // Do NOT delete the connection.
      // Chat must remain open so the
      // Unblock Student button can appear.

      res.status(201).json({
        message:
          "Student blocked successfully.",

        block,
      });
    } catch (error) {
      console.error(
        "Block student error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to block student.",
      });
    }
  }
);


// ======================================================
// CHECK BLOCK STATUS
// ======================================================

app.get(
  "/api/blocks/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const currentUser =
        req.user._id;

      const {
        studentId,
      } = req.params;

      const block =
        await Block.findOne({
          $or: [
            {
              blocker:
                currentUser,

              blocked:
                studentId,
            },

            {
              blocker:
                studentId,

              blocked:
                currentUser,
            },
          ],
        });

      res.json({
        isBlocked:
          !!block,
      });
    } catch (error) {
      console.error(
        "Check block status error:",
        error
      );

      res.status(500).json({
        message:
          "Server error.",
      });
    }
  }
);


// ======================================================
// UNBLOCK STUDENT
// ======================================================

app.delete(
  "/api/blocks/:studentId",
  authMiddleware,
  async (req, res) => {
    try {
      const blocker =
        req.user._id;

      const {
        studentId,
      } = req.params;

      const result =
        await Block.findOneAndDelete({
          blocker,
          blocked:
            studentId,
        });

      if (!result) {
        return res.status(404).json({
          message:
            "Block not found.",
        });
      }

      res.json({
        message:
          "Student unblocked successfully.",
      });
    } catch (error) {
      console.error(
        "Unblock student error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to unblock student.",
      });
    }
  }
);


// ======================================================
// GET MESSAGES
// ======================================================

app.get(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        userId,
      } = req.query;

      if (!userId) {
        return res.status(400).json({
          message:
            "User ID is required.",
        });
      }

      const currentUser =
        req.user._id;

      const messages =
        await Message.find({
          $or: [
            {
              sender:
                currentUser,

              receiver:
                userId,
            },

            {
              sender:
                userId,

              receiver:
                currentUser,
            },
          ],
        })
          .sort({
            createdAt: 1,
          });

      res.json({
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch messages.",
      });
    }
  }
);


// ======================================================
// SEND MESSAGE
// ======================================================

app.post(
  "/api/messages",
  authMiddleware,
  async (req, res) => {
    try {
      const sender =
        req.user._id;

      const {
        receiver,
        text,
      } = req.body;

      if (
        !receiver ||
        !text ||
        !text.trim()
      ) {
        return res.status(400).json({
          message:
            "Receiver and message are required.",
        });
      }

      // ------------------------------------------
      // CHECK BLOCK IN BOTH DIRECTIONS
      // ------------------------------------------

      const block =
        await Block.findOne({
          $or: [
            {
              blocker:
                sender,

              blocked:
                receiver,
            },

            {
              blocker:
                receiver,

              blocked:
                sender,
            },
          ],
        });

      if (block) {
        return res.status(403).json({
          message:
            "Messages cannot be sent because one of the students is blocked.",
        });
      }

      // ------------------------------------------
      // CHECK ACCEPTED CONNECTION
      // ------------------------------------------

      const connection =
        await Connection.findOne({
          $or: [
            {
              requester:
                sender,

              recipient:
                receiver,

              status:
                "accepted",
            },

            {
              requester:
                receiver,

              recipient:
                sender,

              status:
                "accepted",
            },
          ],
        });

      if (!connection) {
        return res.status(403).json({
          message:
            "You can only message an accepted connection.",
        });
      }

      const message =
        await Message.create({
          sender,
          receiver,
          text:
            text.trim(),
        });

      res.status(201).json({
        message,
      });
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to send message.",
      });
    }
  }
);


// ======================================================
// NOTIFICATIONS
// ======================================================

// Get notifications
app.get(
  "/api/notifications",
  authMiddleware,
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          user:
            req.user._id,
        }).sort({
          createdAt: -1,
        });

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
          "Failed to fetch notifications.",
      });
    }
  }
);


// ======================================================
// UNREAD NOTIFICATION COUNT
// ======================================================

app.get(
  "/api/notifications/unread-count",
  authMiddleware,
  async (req, res) => {
    try {
      const count =
        await Notification.countDocuments({
          user:
            req.user._id,

          isRead:
            false,
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
          "Failed to get unread notification count.",
      });
    }
  }
);


// ======================================================
// MARK ONE NOTIFICATION AS READ
// ======================================================

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
            "Notification not found.",
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
          "Failed to update notification.",
      });
    }
  }
);


// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// ======================================================

app.put(
  "/api/notifications/read-all",
  authMiddleware,
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          user:
            req.user._id,

          isRead:
            false,
        },

        {
          $set: {
            isRead:
              true,
          },
        }
      );

      res.json({
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
          "Failed to update notifications.",
      });
    }
  }
);


// ======================================================
// DATABASE CONNECTION
// ======================================================

const PORT =
  process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error(
    "MongoDB connection string is missing."
  );

  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully."
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });
import './App.css'
import { useEffect, useState } from 'react'
import collegeConnectLogo from "./assets/college-connect-logo.png";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

  // ================= MAIN STATES =================

  const [showIntro, setShowIntro] = useState(true)
  const [page, setPage] = useState("landing")
  const [currentUser, setCurrentUser] = useState(null)
  // ================= NOTIFICATIONS =================
const [notifications, setNotifications] = useState([])
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
const [showNotifications, setShowNotifications] = useState(false)
const [notificationsLoading, setNotificationsLoading] = useState(false)
const [connections, setConnections] = useState([])


  
  const [savedAnswers, setSavedAnswers] = useState([])
  const [savedAnswersLoading, setSavedAnswersLoading] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  // ================= STUDENTS =================

  const [students, setStudents] = useState([])
  
  const [studentsLoading, setStudentsLoading] = useState(false)

  // ================= PROJECTS =================

  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  const [projectSaving, setProjectSaving] = useState(false)

  const [projectForm, setProjectForm] = useState({
  title: "",
  description: "",
  skills: "",
  branch: "",
  projectLink: "",
  projectFile: null,
})
const getAcademicYear = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1

  // Academic year starts in June
  if (month >= 6) {
    return `${year}–${String(year + 1).slice(-2)}`
  }

  return `${year - 1}–${String(year).slice(-2)}`
}

  // ================= QUERIES =================

  const [queries, setQueries] = useState([])
  const [queriesLoading, setQueriesLoading] = useState(false)
  const [showAskQuery, setShowAskQuery] = useState(false)
  const [querySaving, setQuerySaving] = useState(false)

  const [queryForm, setQueryForm] = useState({
    text: "",
  })

  // ================= QUERY ANSWERS =================

  const [queryAnswers, setQueryAnswers] = useState({})
  const [answersLoading, setAnswersLoading] = useState({})
  const [answerSaving, setAnswerSaving] = useState({})
  const [answerForms, setAnswerForms] = useState({})
  const [openQueryAnswers, setOpenQueryAnswers] = useState({})

  // ================= DELETE QUERY =================

  const [showDeleteQuery, setShowDeleteQuery] = useState(false)
  const [selectedDeleteQuery, setSelectedDeleteQuery] = useState("")
  const [queryDeleting, setQueryDeleting] = useState(false)

  // ================= SAVED ANSWERS =================

  const [answerSavingState, setAnswerSavingState] = useState({})

  // ================= STUDY HUB =================

  const [studyMaterials, setStudyMaterials] = useState([])
  const [studyMaterialsLoading, setStudyMaterialsLoading] = useState(false)
  const [showUploadMaterial, setShowUploadMaterial] = useState(false)
  const [materialUploading, setMaterialUploading] = useState(false)
  const [materialDeleting, setMaterialDeleting] = useState({})
  const [materialCategory, setMaterialCategory] = useState("All")
  const [materialForm, setMaterialForm] = useState({
    title: "",
    description: "",
    category: "Notes",
    file: null,
  })

  // ================= CONNECTIONS =================

  const [connectionSaving, setConnectionSaving] = useState({})
  const [, setConnectionsLoading] = useState(false)
  const [activeChatConnection, setActiveChatConnection] = useState(null)
const [chatMessages, setChatMessages] = useState([])
const [chatText, setChatText] = useState("")
const [chatLoading, setChatLoading] = useState(false)
const [chatSending, setChatSending] = useState(false)
 // ================= PROFILE =================

const [isEditingProfile, setIsEditingProfile] = useState(false)
const [profileSaving, setProfileSaving] = useState(false)

const [viewingProfile, setViewingProfile] = useState(null)
const [, setViewingProfileLoading] = useState(false)

const [profileForm, setProfileForm] = useState({
  name: "",
  degree: "",
  college: "",
  skills: "",
  city: "",
  state: "",
  profilePhoto: "",
})

  // ================= REGISTER =================

  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerMessage, setRegisterMessage] = useState("")
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerLevel, setRegisterLevel] = useState("UG")
  const [registerDegree, setRegisterDegree] = useState("")
  const [registerYear, setRegisterYear] = useState("")

  // ================= LOGIN =================

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginMessage, setLoginMessage] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)

  // ================= FORGOT PASSWORD =================

  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")


  // =========================================================
  // ACADEMIC OPTIONS
  // =========================================================

  const ugDegrees = [
    "B.Tech / BE",
    "BCA",
    "B.Sc",
    "B.Com",
    "BA",
    "BBA",
    "BBM",
    "BMS",
    "B.Pharm",
    "BDS",
    "MBBS",
    "BPT",
    "B.Arch",
    "B.Des",
    "LLB",
    "B.Ed",
    "B.A. LLB",
    "BBA LLB",
    "B.Voc",
    "BHM",
    "BFA",
    "BSW",
  ]

  const pgDegrees = [
    "M.Tech / ME",
    "MCA",
    "M.Sc",
    "M.Com",
    "MA",
    "MBA",
    "M.Pharm",
    "MDS",
    "MD",
    "MS",
    "MPT",
    "M.Arch",
    "M.Des",
    "LLM",
    "M.Ed",
    "MSW",
    "MFA",
    "PG Diploma",
  ]

  const ugYears = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year",
  ]

  const pgYears = [
    "1st Year",
    "2nd Year",
    "3rd Year",
  ]

  const studyCategories = [
    "Notes",
    "Previous Year Papers",
    "Question Banks",
    "Assignments",
    "Study PDFs/Resources",
    "Practical/Viva Material",
  ]

  // =========================================================
  // CURRENT USER ID
  // =========================================================

  const currentUserId =
    currentUser?._id || currentUser?.id || ""



  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async () => {

    if (!currentUser) {
      alert("User information not found.")
      return
    }

    const userId =
      currentUser._id || currentUser.id

    if (!userId) {
      alert("User ID not found. Please login again.")
      return
    }

    try {

      setProfileSaving(true)

      const response = await fetch(
        `${API_URL}/api/users/${userId}/profile`,
        {
          method: "PUT",

         headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
},

          body: JSON.stringify({
            name: profileForm.name.trim(),

            college: profileForm.college.trim(),

            skills: profileForm.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter((skill) => skill.length > 0),

            city: profileForm.city.trim(),

            state: profileForm.state.trim(),

            profilePhoto:
              profileForm.profilePhoto || "",
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {

        alert(
          data.message ||
          "Unable to update profile."
        )

        return
      }

      setCurrentUser(data.user)

      setIsEditingProfile(false)

      alert("Profile updated successfully!")

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      )

      alert(
        "Unable to connect to server. Make sure your Server is running."
      )

    } finally {

      setProfileSaving(false)

    }

  }
  // =========================================================
  // VIEW OTHER STUDENT PROFILE
  // =========================================================

  const handleViewProfile = async (userId) => {

    if (!userId) {
      alert("Student profile not found.")
      return
    }

    try {

      setViewingProfileLoading(true)

      const response = await fetch(
        (`${API_URL}/api/users/${userId}`)
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to load profile."
        )
        return
      }

      setViewingProfile(data.user)

    } catch (error) {

      console.error(
        "View profile error:",
        error
      )

      alert(
        "Unable to connect to server. Make sure your Server is running."
      )

    } finally {

      setViewingProfileLoading(false)

    }

  }

  // =========================================================
  // ADD PROJECT
  // =========================================================

  const handleAddProject = async (e) => {
  e.preventDefault()

  const userId = currentUser?._id || currentUser?.id

  if (!userId) {
    alert("Please login first.")
    return
  }

  if (!projectForm.title.trim()) {
    alert("Please enter project title.")
    return
  }

  if (!projectForm.description.trim()) {
    alert("Please enter project description.")
    return
  }

  const skills = projectForm.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  if (skills.length === 0) {
    alert("Please enter at least one skill.")
    return
  }

  try {
  setProjectSaving(true)

  const formData = new FormData()

    formData.append(
      "title",
      projectForm.title.trim()
    )

    formData.append(
      "description",
      projectForm.description.trim()
    )

    formData.append(
      "skills",
      JSON.stringify(skills)
    )

    formData.append(
      "branch",
      projectForm.branch
    )

    formData.append(
      "projectLink",
      projectForm.projectLink.trim()
    )


    // Add project file only if selected
    if (projectForm.projectFile) {
      formData.append(
        "projectFile",
        projectForm.projectFile
      )
    }

    const response = await fetch(
      `${API_URL}/api/projects`,
      {
        method: "POST",
         headers: {
      Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
    },
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(
        data.message ||
        "Unable to add project."
      )
      return
    }

    alert(
      data.message ||
      "Project added successfully."
    )

  
    // Reset form
    setProjectForm({
      title: "",
      description: "",
      skills: "",
      branch: "",
      projectLink: "",
      projectFile: null,
    })

    // Return to projects page
    setPage("projects")

  } catch (error) {
    console.error(
      "Add project error:",
      error
    )

    alert(
      "Unable to add project. Please try again."
    )
  }
}

  // =========================================================
  // ADD QUERY
  // =========================================================

  const handleAddQuery = async () => {
    const queryText = (queryForm.text || "").trim()

    if (!queryText) {
      alert("Please enter your query.")
      return
    }

    const userId =
      currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    try {
      setQuerySaving(true)

      const response = await fetch(
        `${API_URL}/api/queries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
          body: JSON.stringify({
            text: queryText,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to add query.")
        return
      }

      setQueries((previousQueries) => [
        data.query,
        ...previousQueries,
      ])

      setQueryForm({
        text: "",
      })

      setShowAskQuery(false)

      alert("Query posted successfully!")
      await fetchUnreadNotificationCount()
    } catch (error) {
      console.error("Query add error:", error)
      alert("Unable to connect to server. Make sure your Server is running.")
    } finally {
      setQuerySaving(false)
    }
  }


  // =========================================================
  // QUERY ANSWERS
  // =========================================================

  const fetchQueryAnswers = async (queryId) => {
    try {
      setAnswersLoading((previous) => ({
        ...previous,
        [queryId]: true,
      }))

      const response = await fetch(
        `${API_URL}/api/queries/${queryId}/answers`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setQueryAnswers((previous) => ({
          ...previous,
          [queryId]: data.answers || [],
        }))
      } else {
        alert(data.message || "Unable to fetch answers.")
      }
    } catch (error) {
      console.error("Answers fetch error:", error)
      alert("Unable to connect to server.")
    } finally {
      setAnswersLoading((previous) => ({
        ...previous,
        [queryId]: false,
      }))
    }
  }

  const handleToggleAnswers = async (queryId) => {
    const isOpen = openQueryAnswers[queryId]

    setOpenQueryAnswers((previous) => ({
      ...previous,
      [queryId]: !isOpen,
    }))

    if (!isOpen && queryAnswers[queryId] === undefined) {
      await fetchQueryAnswers(queryId)
    }
  }

  const handleAddAnswer = async (queryId) => {
    const answerText = (answerForms[queryId] || "").trim()

    if (!answerText) {
      alert("Please enter an answer.")
      return
    }

    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    try {
      setAnswerSaving((previous) => ({
        ...previous,
        [queryId]: true,
      }))

      const response = await fetch(
        `${API_URL}/api/queries/${queryId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
          body: JSON.stringify({
            answer: answerText,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to add answer.")
        return
      }

      setQueryAnswers((previous) => ({
        ...previous,
        [queryId]: [
          data.answer,
          ...(previous[queryId] || []),
        ],
      }))

      setAnswerForms((previous) => ({
        ...previous,
        [queryId]: "",
      }))

      await fetchUnreadNotificationCount()
    } catch (error) {
      console.error("Answer add error:", error)
      alert("Unable to connect to server. Make sure your Server is running.")
    } finally {
      setAnswerSaving((previous) => ({
        ...previous,
        [queryId]: false,
      }))
    }
  }

  const handleDeleteAnswer = async (answerId, queryId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this answer?"
    )

    if (!shouldDelete) return

    try {
      const response = await fetch(
       `${API_URL}/api/answers/${answerId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to delete answer.")
        return
      }

      setQueryAnswers((previous) => ({
        ...previous,
        [queryId]: (previous[queryId] || []).filter(
          (answer) => String(answer._id) !== String(answerId)
        ),
      }))

      // Remove the answer from Saved Answers too.
      setSavedAnswers((previous) =>
        previous.filter(
          (item) => String(item.answer?._id || item.answer) !== String(answerId)
        )
      )
    } catch (error) {
      console.error("Answer delete error:", error)
      alert("Unable to connect to server.")
    }
  }

  const handleSaveAnswer = async (answerId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    try {
      setAnswerSavingState((previous) => ({
        ...previous,
        [answerId]: true,
      }))

      const response = await fetch(
        (`${API_URL}/api/saved-answers`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
          body: JSON.stringify({
            answer: answerId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to save answer.")
        return
      }

      setSavedAnswers((previous) => {
        const alreadySaved = previous.some(
          (item) => String(item.answer?._id || item.answer) === String(answerId)
        )

        if (alreadySaved) return previous
        return [data.savedAnswer, ...previous]
      })

      await fetchUnreadNotificationCount()
    } catch (error) {
      console.error("Save answer error:", error)
      alert("Unable to connect to server.")
    } finally {
      setAnswerSavingState((previous) => ({
        ...previous,
        [answerId]: false,
      }))
    }
  }

  const handleUnsaveAnswer = async (answerId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    try {
      setAnswerSavingState((previous) => ({
        ...previous,
        [answerId]: true,
      }))

      const response = await fetch(
        (`${API_URL}/api/saved-answers/${answerId}`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to remove saved answer.")
        return
      }

      setSavedAnswers((previous) =>
        previous.filter(
          (item) => String(item.answer?._id || item.answer) !== String(answerId)
        )
      )
    } catch (error) {
      console.error("Unsave answer error:", error)
      alert("Unable to connect to server.")
    } finally {
      setAnswerSavingState((previous) => ({
        ...previous,
        [answerId]: false,
      }))
    }
  }

  const isAnswerSaved = (answerId) =>
    savedAnswers.some(
      (item) => String(item.answer?._id || item.answer) === String(answerId)
    )

  const fetchSavedAnswers = async () => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) return

    try {
      setSavedAnswersLoading(true)

      const response = await fetch(
        `${API_URL}/api/saved-answers/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (response.ok) {
        setSavedAnswers(data.savedAnswers || [])
      }
    } catch (error) {
      console.error("Saved answers fetch error:", error)
    } finally {
      setSavedAnswersLoading(false)
    }
  }

  const handleDeleteSelectedQuery = async () => {
    if (!selectedDeleteQuery) {
      alert("Please select a query to delete.")
      return
    }

    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    const selectedQuery = queries.find(
      (query) => String(query._id) === String(selectedDeleteQuery)
    )

    if (!selectedQuery) {
      alert("Selected query not found.")
      return
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${selectedQuery.title}"?\n\nAll answers to this query will also be deleted.`
    )

    if (!confirmDelete) return

    try {
      setQueryDeleting(true)

      const response = await fetch(
        `${API_URL}/api/queries/${selectedDeleteQuery}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to delete query.")
        return
      }

      setQueries((previousQueries) =>
        previousQueries.filter(
          (query) => String(query._id) !== String(selectedDeleteQuery)
        )
      )

      setQueryAnswers((previousAnswers) => {
        const updatedAnswers = { ...previousAnswers }
        delete updatedAnswers[selectedDeleteQuery]
        return updatedAnswers
      })

      setOpenQueryAnswers((previousOpen) => {
        const updatedOpen = { ...previousOpen }
        delete updatedOpen[selectedDeleteQuery]
        return updatedOpen
      })

      setSelectedDeleteQuery("")
      setShowDeleteQuery(false)

      await fetchSavedAnswers()

      alert("Query deleted successfully!")
    } catch (error) {
      console.error("Delete query error:", error)
      alert("Unable to connect to server.")
    } finally {
      setQueryDeleting(false)
    }
  }

  const formatAnswerTime = (createdAt) => {
    if (!createdAt) return ""

    const date = new Date(createdAt)
    const now = new Date()
    const difference = Math.floor((now - date) / 1000)

    if (difference < 60) return "Just now"
    if (difference < 3600) {
      const minutes = Math.floor(difference / 60)
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`
    }
    if (difference < 86400) {
      const hours = Math.floor(difference / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    }
    if (difference < 604800) {
      const days = Math.floor(difference / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }
// =========================================================
// NOTIFICATIONS
// =========================================================

const fetchNotifications = async () => {
  const userId = currentUser?._id || currentUser?.id

  if (!userId) return

  try {
    setNotificationsLoading(true)

    const response = await fetch(
      `${API_URL}/api/notifications`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      setNotifications(data.notifications || [])
    }
  } catch (error) {
    console.error("Notifications fetch error:", error)
  } finally {
    setNotificationsLoading(false)
  }
}


const fetchUnreadNotificationCount = async () => {
  const userId = currentUser?._id || currentUser?.id

  if (!userId) return

  try {
    const response = await fetch(
      `${API_URL}/api/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (response.ok) {
      setUnreadNotificationCount(data.count || 0)
    }
  } catch (error) {
    console.error("Unread notification count error:", error)
  }
}


const handleNotificationClick = async () => {
  const willOpen = !showNotifications

  setShowNotifications(willOpen)

  if (willOpen) {
    await fetchNotifications()
  }
}


const handleMarkNotificationRead = async (notificationId) => {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    if (response.ok) {
      setNotifications((previous) =>
        previous.map((notification) =>
          String(notification._id) === String(notificationId)
            ? { ...notification, isRead: true }
            : notification
        )
      )

      setUnreadNotificationCount((previous) =>
        Math.max(previous - 1, 0)
      )
    }
  } catch (error) {
    console.error("Mark notification read error:", error)
  }
}


const handleMarkAllNotificationsRead = async () => {
  const userId = currentUser?._id || currentUser?.id

  if (!userId) return

  try {
    const response = await fetch(
      `${API_URL}/api/notifications/read-all`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    if (response.ok) {
      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      )

      setUnreadNotificationCount(0)
    }
  } catch (error) {
    console.error("Mark all notifications error:", error)
  }
}


// Fetch unread count after login
useEffect(() => {
  if (!currentUser) return

  fetchUnreadNotificationCount()

  const interval = setInterval(() => {
    fetchUnreadNotificationCount()
  }, 5000)

  return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser])

  // =========================================================
  // STUDY HUB
  // =========================================================

  const fetchStudyMaterials = async () => {
    const userId = currentUser?._id || currentUser?.id
    if (!userId) return

    try {
      setStudyMaterialsLoading(true)

      const response = await fetch(
        `${API_URL}/api/study-materials?degree=${encodeURIComponent(
          currentUser?.degree || ""
        )}&year=${encodeURIComponent(currentUser?.year || "")}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        console.error(data.message || "Unable to fetch study materials.")
        return
      }

      setStudyMaterials(data.materials || [])
    } catch (error) {
      console.error("Study materials fetch error:", error)
    } finally {
      setStudyMaterialsLoading(false)
    }
  }

  const handleUploadMaterial = async () => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    if (!materialForm.title.trim()) {
      alert("Please enter a material title.")
      return
    }

    if (!materialForm.file) {
      alert("Please select a study material file.")
      return
    }

    try {
      setMaterialUploading(true)

      const formData = new FormData()
      formData.append("title", materialForm.title.trim())
      formData.append(
        "description",
        materialForm.description.trim()
      )
      formData.append("category", materialForm.category)
      formData.append("file", materialForm.file)

      const response = await fetch(
        `${API_URL}/api/study-materials`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to upload material.")
        return
      }

      setStudyMaterials((previous) => [
        data.material,
        ...previous,
      ])

      setMaterialForm({
        title: "",
        description: "",
        category: "Notes",
        file: null,
      })
      setShowUploadMaterial(false)

      const fileInput = document.getElementById(
        "study-material-file-input"
      )
      if (fileInput) fileInput.value = ""

      alert("Study material shared successfully!")
    } catch (error) {
      console.error("Study material upload error:", error)
      alert("Unable to connect to server.")
    } finally {
      setMaterialUploading(false)
    }
  }

  const handleDeleteMaterial = async (materialId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    const shouldDelete = window.confirm(
      "Are you sure you want to delete this study material?"
    )

    if (!shouldDelete) return

    try {
      setMaterialDeleting((previous) => ({
        ...previous,
        [materialId]: true,
      }))

      const response = await fetch(
        `${API_URL}/api/study-materials/${materialId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to delete material.")
        return
      }

      setStudyMaterials((previous) =>
        previous.filter(
          (material) =>
            String(material._id) !== String(materialId)
        )
      )
    } catch (error) {
      console.error("Delete material error:", error)
      alert("Unable to connect to server.")
    } finally {
      setMaterialDeleting((previous) => ({
        ...previous,
        [materialId]: false,
      }))
    }
  }

  // =========================================================
  // CONNECTIONS
  // =========================================================

  const handleConnectStudent = async (studentId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      alert("Please login again.")
      return
    }

    if (String(userId) === String(studentId)) return

    try {
      setConnectionSaving((previous) => ({
        ...previous,
        [studentId]: true,
      }))

      const response = await fetch(
        `${API_URL}/api/connections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
          body: JSON.stringify({
            recipient: studentId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || "Unable to send connection request.")
        return
      }

      alert(data.message || "Connection request sent.")
    } catch (error) {
      console.error("Connection error:", error)
      alert("Unable to connect to server.")
    } finally {
      setConnectionSaving((previous) => ({
        ...previous,
        [studentId]: false,
      }))
    }
  }
  const fetchConnections = async () => {
  const userId = currentUser?._id || currentUser?.id

  if (!userId) return

  try {
    setConnectionsLoading(true)

    const response = await fetch(
      `${API_URL}/api/connections/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error(
        data.message || "Unable to load connections."
      )
      return
    }

    setConnections(data.connections || [])
  } catch (error) {
    console.error("Connections fetch error:", error)
  } finally {
    setConnectionsLoading(false)
  }
}
// ======================================================
// ACCEPT CONNECTION REQUEST
// ======================================================

const handleAcceptConnection = async (connectionId) => {
  if (!connectionId) {
    alert("Connection request not found.")
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/api/connections/${connectionId}/accept`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || "Unable to accept connection.")
      return
    }

    alert("Connection accepted.")
// Refresh connections
await fetchConnections()

    // Refresh notifications
    if (currentUser?._id || currentUser?.id) {
      const notificationResponse = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const notificationData =
        await notificationResponse.json()

      if (notificationResponse.ok) {
        setNotifications(
          notificationData.notifications || []
        )

        setUnreadNotificationCount(
          (notificationData.notifications || []).filter(
            (notification) => !notification.isRead
          ).length
        )
      }
    }

  } catch (error) {
    console.error(
      "Accept connection error:",
      error
    )

    alert("Unable to connect to server.")
  }
}


// ======================================================
// REJECT CONNECTION REQUEST
// ======================================================

const handleRejectConnection = async (connectionId) => {
  if (!connectionId) {
    alert("Connection request not found.")
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/api/connections/${connectionId}/reject`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || "Unable to reject connection.")
      return
    }

    alert("Connection request rejected.")
    // Refresh connections
await fetchConnections()

    // Refresh notifications
    if (currentUser?._id || currentUser?.id) {
      const notificationResponse = await fetch(
        `${API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
          },
        }
      )

      const notificationData =
        await notificationResponse.json()

      if (notificationResponse.ok) {
        setNotifications(
          notificationData.notifications || []
        )

        setUnreadNotificationCount(
          (notificationData.notifications || []).filter(
            (notification) => !notification.isRead
          ).length
        )
      }
    }

  } catch (error) {
    console.error(
      "Reject connection error:",
      error
    )

    alert("Unable to connect to server.")
  }
}
// ======================================================
// LOAD PRIVATE CHAT
// ======================================================

const fetchChatMessages = async (user1, user2) => {
  if (!user1 || !user2) {
    return
  }

  try {
    setChatLoading(true)

    const response = await fetch(
      `${API_URL}/api/messages?user1=${user1}&user2=${user2}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || "Unable to load chat.")
      return
    }

    setChatMessages(data.messages || [])
  } catch (error) {
    console.error("Load chat error:", error)
    alert("Unable to connect to server.")
  } finally {
    setChatLoading(false)
  }
}


// ======================================================
// SEND PRIVATE CHAT MESSAGE
// ======================================================

const handleSendMessage = async () => {
  const sender =
    currentUser?._id ||
    currentUser?.id

  const receiver =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!sender || !receiver) {
    alert("Chat connection not found.")
    return
  }

  if (!chatText.trim()) {
    return
  }

  try {
    setChatSending(true)

    const response = await fetch(
      `${API_URL}/api/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
        },
        body: JSON.stringify({
          receiver,
          text: chatText.trim(),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || "Unable to send message.")
      return
    }

    setChatMessages((previous) => [
      ...previous,
      data.message,
    ])

    setChatText("")
  } catch (error) {
    console.error("Send message error:", error)
    alert("Unable to connect to server.")
  } finally {
    setChatSending(false)
  }
}
useEffect(() => {
  if (!activeChatConnection || !currentUser) {
    return
  }

  const user1 =
    currentUser?._id ||
    currentUser?.id

  const user2 =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!user1 || !user2) {
    return
  }

  const timeoutId = setTimeout(() => {
    fetchChatMessages(user1, user2)
  }, 0)

  return () => clearTimeout(timeoutId)

}, [activeChatConnection, currentUser])
const renderNotifications = () => (
  <>
    {notificationsLoading ? (
      <div className="notification-empty">
        Loading notifications...
      </div>
    ) : notifications.length === 0 ? (
      <div className="notification-empty">
        <div className="notification-empty-icon">🔔</div>
        <strong>No notifications yet</strong>
        <span>New activity will appear here.</span>
      </div>
    ) : (
      notifications.map((notification) => {
        const connection =
  notification.relatedId
    ? connections.find(
        (item) =>
          String(item._id) ===
          String(notification.relatedId)
      )
    : null

const isIncomingPendingConnection =
  notification.type === "connection" &&
  connection?.status === "pending" &&
  String(
    connection.recipient?._id ||
    connection.recipient
  ) ===
    String(
      currentUser?._id ||
      currentUser?.id
    )

const isAcceptedConnection =
  connection?.status === "accepted" &&
  (
    notification.type === "connection" ||
    notification.type === "connection-accepted"
  )

       

        return (
          <div
            key={notification._id}
            className={`notification-item ${
              notification.isRead ? "read" : "unread"
            }`}
            onClick={() => {
              if (!notification.isRead) {
                handleMarkNotificationRead(notification._id)
              }
            }}
          >
            <div className="notification-item-icon">
              {notification.type === "connection"
                ? "👥"
                : notification.type === "project"
                ? "💻"
                : notification.type === "study-material"
                ? "📚"
                : "💬"}
            </div>

            <div className="notification-item-content">
              <p>{notification.message}</p>
              <span>
                {formatAnswerTime(notification.createdAt)}
              </span>
            </div>

            {!notification.isRead && (
              <span className="notification-unread-dot"></span>
            )}

            {isIncomingPendingConnection && (
              <div className="notification-connection-actions">

                <button
                  type="button"
                  className="notification-accept-button"
                  onClick={() =>
                    handleAcceptConnection(
                      notification.relatedId
                    )
                  }
                >
                  Accept
                </button>

                <button
                  type="button"
                  className="notification-reject-button"
                  onClick={() =>
                    handleRejectConnection(
                      notification.relatedId
                    )
                  }
                >
                  Reject
                </button>
{isAcceptedConnection && (
  <button
    type="button"
    className="notification-chat-button"
    onClick={() => {
      const userId =
        currentUser?._id ||
        currentUser?.id

      const otherUser =
        String(
          connection.requester?._id ||
          connection.requester
        ) === String(userId)
          ? connection.recipient
          : connection.requester

      if (!otherUser) {
        alert("Student information not found.")
        return
      }

      setActiveChatConnection({
        ...connection,
        otherUser,
      })

      setPage("chat")
    }}
  >
    💬 Chat
  </button>
)}
              </div>
            )}
          </div>
        )
      })
    )}
  </>
)

  // =========================================================
  // FETCH STUDENTS
  // =========================================================

  useEffect(() => {

    if (
      page !== "dashboard" &&
      page !== "students"
    ) {
      return
    }

    const fetchStudents = async () => {

      try {

        setStudentsLoading(true)

        setStudentsLoading(true)

const response = await fetch(
  `${API_URL}/api/students`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
    },
  }
)

        const data = await response.json()

        if (response.ok) {
          setStudents(data.students)
        }

      } catch (error) {

        console.error(
          "Students fetch error:",
          error
        )

      } finally {

        setStudentsLoading(false)

      }

    }

    fetchStudents()

  }, [page])


  // =========================================================
  // FETCH PROJECTS
  // =========================================================

  useEffect(() => {

    if (
      page !== "dashboard" &&
      page !== "projects" &&
      page !== "activity"
    ) {
      return
    }

    const fetchProjects = async () => {

      try {

        setProjectsLoading(true)

        const response = await fetch(
          `${API_URL}/api/projects`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
            },
          }
        )

        const data = await response.json()

        if (response.ok) {

          setProjects(data.projects)

        } else {

          console.error(
            data.message ||
            "Unable to fetch projects."
          )

        }

      } catch (error) {

        console.error(
          "Projects fetch error:",
          error
        )

      } finally {

        setProjectsLoading(false)

      }

    }

    fetchProjects()

  }, [page])


  // =========================================================
  // FETCH QUERIES
  // =========================================================

  useEffect(() => {

    if (
      page !== "dashboard" &&
      page !== "queries" &&
      page !== "activity"
    ) {
      return
    }

    const fetchQueries = async () => {

      try {

        setQueriesLoading(true)

        const response = await fetch(
          `${API_URL}/api/queries`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("collegeConnectToken")}`,
            },
          }
        )

        const data = await response.json()

        if (response.ok) {

          setQueries(data.queries)

        }

      } catch (error) {

        console.error(
          "Queries fetch error:",
          error
        )

      } finally {

        setQueriesLoading(false)

      }

    }

    fetchQueries()

  }, [page])

// =========================================================
// FETCH CONNECTIONS
// =========================================================

useEffect(() => {
  if (!currentUser) {
    return
  }

  // This fetch function updates connection state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchConnections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser?._id, currentUser?.id])
  // =========================================================
  // FETCH STUDY MATERIALS
  // =========================================================

  useEffect(() => {
    if (
      page !== "studyHub" &&
      page !== "activity"
    ) {
      return
    }

    // This fetch function updates loading/data state as part of the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudyMaterials()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentUserId, currentUser?.degree, currentUser?.year])


  // =========================================================
  // FETCH SAVED ANSWERS
  // =========================================================

  useEffect(() => {
    if (page !== "activity") return
    // This fetch function updates loading/data state as part of the async request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSavedAnswers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentUserId])


  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegisterMessage("")

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword ||
      !registerLevel ||
      !registerDegree ||
      !registerYear
    ) {
      setRegisterMessage(
        "Please complete all registration fields."
      )
      return
    }

    setRegisterLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: registerName.trim(),
            email: registerEmail.trim(),
            password: registerPassword,
            level: registerLevel,
            degree: registerDegree,
            year: registerYear,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        alert("Account created successfully!")

        setRegisterName("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterLevel("UG")
        setRegisterDegree("")
        setRegisterYear("")
        setRegisterMessage("")

        localStorage.setItem("collegeConnectToken", data.token)
        localStorage.setItem("collegeConnectToken", data.token)
        setCurrentUser(data.user)
        setPage("dashboard")
      } else {
        setRegisterMessage(
          data.message || "Unable to create account."
        )

        if (response.status === 409) {
          setTimeout(() => {
            setPage("login")
          }, 1500)
        }
      }
    } catch (error) {
      console.error("Register error:", error)
      setRegisterMessage(
        "Cannot connect to server. Make sure the Server is running."
      )
    } finally {
      setRegisterLoading(false)
    }
  }


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault()

    setLoginMessage("")

    if (
      !loginEmail ||
      !loginPassword
    ) {

      setLoginMessage(
        "Please enter email and password."
      )

      return
    }

    setLoginLoading(true)

    try {

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {

        alert(
          "Login successful!"
        )

        setLoginEmail("")
        setLoginPassword("")
        setLoginMessage("")
        localStorage.setItem("collegeConnectToken", data.token)

        setCurrentUser(data.user)

        setPage("dashboard")

      } else {

        setLoginMessage(
          data.message
        )

      }

    } catch {

      setLoginMessage(
        "Cannot connect to server. Make sure the Server is running."
      )

    } finally {

      setLoginLoading(false)

    }

  }


  // =========================================================
  // INTRO SCREEN
  // =========================================================

  if (showIntro) {

    return (

      <div className="intro-screen">

        <div className="intro-orb intro-orb-1"></div>
        <div className="intro-orb intro-orb-2"></div>
        <div className="intro-orb intro-orb-3"></div>
        <div className="intro-orb intro-orb-4"></div>

        <div className="intro-wave intro-wave-left"></div>
        <div className="intro-wave intro-wave-right"></div>

        <div className="intro-line intro-line-left"></div>
        <div className="intro-line intro-line-right"></div>

        <div className="intro-dots intro-dots-left"></div>
        <div className="intro-dots intro-dots-right"></div>

        <div className="intro-circle circle-one"></div>
        <div className="intro-circle circle-two"></div>

        <div className="intro-content">

          <div className="intro-logo-wrap">

            <div className="logo-glow"></div>

            <img
              src={collegeConnectLogo}
              alt="College Connect"
              className="intro-logo"
            />

          </div>

          <div className="intro-tagline">

            <span>Connect</span>
            <b>•</b>
            <span>Learn</span>
            <b>•</b>
            <span>Build</span>

          </div>

          <button
            className="intro-explore"
            onClick={() =>
              setShowIntro(false)
            }
          >

            <span>
              Explore
            </span>

            <span className="intro-arrow">
              →
            </span>

          </button>

        </div>

      </div>

    )

  }


  // =========================================================
  // REGISTER PAGE
  // =========================================================

  if (page === "register") {

    return (

      <div className="auth-page">

        <div className="auth-card">

          <h1>
            Create your account
          </h1>

          <p>
            Join College Connect
          </p>

          <form onSubmit={handleRegister}>

            <input
              type="text"
              placeholder="Full Name"
              value={registerName}
              onChange={(e) =>
                setRegisterName(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Email Address"
              value={registerEmail}
              onChange={(e) =>
                setRegisterEmail(e.target.value)
              }
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            
            <div className="academic-register-grid">
              <div className="edit-profile-field">
                <label>Level</label>
                <select
                  value={registerLevel}
                  onChange={(e) => {
                    setRegisterLevel(e.target.value)
                    setRegisterDegree("")
                    setRegisterYear("")
                  }}
                >
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              <div className="edit-profile-field">
                <label>Degree</label>
                <select
                  value={registerDegree}
                  onChange={(e) => setRegisterDegree(e.target.value)}
                >
                  <option value="">Select Degree</option>
                  {(registerLevel === "UG"
                    ? ugDegrees
                    : pgDegrees
                  ).map((degree) => (
                    <option key={degree} value={degree}>
                      {degree}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-profile-field">
                <label>Year</label>
                <select
                  value={registerYear}
                  onChange={(e) =>
                    setRegisterYear(e.target.value)
                  }
                >
                  <option value="">Select Year</option>
                  {(registerLevel === "UG"
                    ? ugYears
                    : pgYears
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {registerMessage && (
              <div className="auth-message">
                {registerMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={registerLoading}
            >
              {registerLoading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <div className="auth-switch">

            Already have an account?

            <button
              type="button"
              onClick={() => {

                setRegisterMessage("")
                setPage("login")

              }}
            >
              Login
            </button>

          </div>

          <button
            className="back-button"
            onClick={() =>
              setPage("landing")
            }
          >
            ← Back
          </button>

        </div>

      </div>

    )

  }


  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (page === "login") {

    return (

      <div className="auth-page">

        <div className="auth-card">

          <h1>
            Welcome back
          </h1>

          <p>
            Login to College Connect
          </p>

          <form onSubmit={handleLogin}>

            <input
              type="email"
              placeholder="Email Address"
              value={loginEmail}
              onChange={(e) =>
                setLoginEmail(
                  e.target.value
                )
              }
            />

            <div className="password-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Password"
                value={loginPassword}
                onChange={(e) =>
                  setLoginPassword(
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword
                  ? "🙈"
                  : "👁️"}
              </button>

            </div>

            {loginMessage && (

              <div className="auth-message">
                {loginMessage}
              </div>

            )}

            <button
              type="submit"
              disabled={loginLoading}
            >
              {loginLoading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <button
            className="forgot-password"
            type="button"
            onClick={() => {

              setLoginMessage("")
              setForgotMessage("")
              setPage("forgot")

            }}
          >
            Forgot Password?
          </button>

          <div className="auth-switch">

            Don't have an account?

            <button
              type="button"
              onClick={() => {

                setLoginMessage("")
                setPage("register")

              }}
            >
              Register
            </button>

          </div>

          <button
            className="back-button"
            onClick={() =>
              setPage("landing")
            }
          >
            ← Back
          </button>

        </div>

      </div>

    )

  }


  // =========================================================
// FORGOT PASSWORD PAGE
// =========================================================

if (page === "forgot") {

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>
          Forgot Password?
        </h1>

        <p>
          Enter your registered email address
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault()

            if (!forgotEmail.trim()) {
              setForgotMessage(
                "Please enter your email address."
              )
              return
            }

            if (resendCountdown > 0) {
              return
            }

            try {
              setForgotMessage("Sending reset link...")

              const response = await fetch(
                `${API_URL}/api/auth/forgot-password`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: forgotEmail.trim(),
                  }),
                }
              )

              const data = await response.json()

              setForgotMessage(
                data.message ||
                  "If the account exists, a reset link has been sent."
              )

              // Start 10-second resend countdown
              setResendCountdown(20)

              const countdownInterval = setInterval(() => {
                setResendCountdown((previous) => {

                  if (previous <= 1) {
                    clearInterval(countdownInterval)
                    return 0
                  }

                  return previous - 1
                })
              }, 1000)

            } catch (error) {

              console.error(
                "Forgot password error:",
                error
              )

              setForgotMessage(
                "Unable to connect to server."
              )

            }
          }}
        >

          <input
            type="email"
            placeholder="Registered Email Address"
            value={forgotEmail}
            onChange={(e) =>
              setForgotEmail(
                e.target.value
              )
            }
          />

          {forgotMessage && (

            <div className="auth-message">
              {forgotMessage}
            </div>

          )}

          <button
            type="submit"
            disabled={resendCountdown > 0}
          >
            Send Reset Link
          </button>

        </form>

        {resendCountdown > 0 ? (

          <div className="resend-message">
            Didn't receive the email?{" "}
            <span>
              Resend link in {resendCountdown}s
            </span>
          </div>

        ) : (

          forgotMessage && (
            <button
              type="button"
              className="resend-link-button"
              onClick={() => {

                document
                  .querySelector(
                    ".auth-card form"
                  )
                  ?.requestSubmit()

              }}
            >
              Didn't receive the email?{" "}
              <span>
                Resend link
              </span>
            </button>
          )

        )}

        <button
          className="back-button"
          onClick={() => {

            setForgotMessage("")
            setResendCountdown(0)
            setPage("login")

          }}
        >
          ← Back to Login
        </button>

      </div>

    </div>

  )

}

  // =========================================================
  // STUDENTS PAGE
  // =========================================================

  if (page === "students") {

    const otherStudents = students.filter(
      (student) =>
        String(student._id || student.id) !== String(currentUserId)
    )

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button className="dashboard-nav-link active">
              Students
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("profile")
              }
            >
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("activity")
              }
            >
              Your Activity
            </button>

          </nav>

          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>

        <main className="dashboard-main">

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                COLLEGE NETWORK
              </span>

              <h1>
                Discover Students
              </h1>

              <p>
                Find students, explore their skills
                and connect with people who share
                your interests.
              </p>

            </div>

          </section>

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Students
                </h2>

                <p>
                  Students registered on College Connect.
                </p>

              </div>

            </div>

            <div className="students-grid">

              {studentsLoading ? (

                <div className="students-message">
                  Loading students...
                </div>

              ) : otherStudents.length === 0 ? (

                <div className="students-message">
                  No other students found yet.
                </div>

              ) : (

                otherStudents.map((student) => (

                  <div
                    className="student-card"
                    key={student._id}
                  >

                    <button
  type="button"
  className="student-avatar student-avatar-button"
  onClick={() => {
    handleViewProfile(student._id)
    setPage("student-profile")
  }}
>
  {student.name
    ?.charAt(0)
    .toUpperCase()}
</button>

                    <div className="student-card-info">

                      <h3>
                        {student.name}
                      </h3>

                      <p>
                        {student.degree ||
                          "Degree not added"}{" "}
                        {student.year ? `• ${student.year}` : ""}
                      </p>

                      <span>
                        {student.college ||
                          "College not added"}
                      </span>

                    </div>

                    <button
                      className="student-connect-button"
                      type="button"
                      onClick={() =>
                        handleConnectStudent(student._id)
                      }
                      disabled={connectionSaving[student._id]}
                    >
                      {connectionSaving[student._id]
                        ? "Connecting..."
                        : "Connect"}
                    </button>

                  </div>

                ))

              )}

            </div>

          </section>

        </main>

      </div>

    )

  }

// =========================================================
// OTHER STUDENT PROFILE
// =========================================================

if (page === "student-profile" && viewingProfile) {

  return (

    <div className="dashboard-page">

      <header className="dashboard-header">

        <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

        <nav className="dashboard-nav">

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("dashboard")
            }
          >
            Home
          </button>

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("profile")
            }
          >
            Profile
          </button>

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("activity")
            }
          >
            Your Activity
          </button>

        </nav>

        <div className="dashboard-header-right">

          <div className="notification-wrapper">

            <button
              className="notification-button"
              onClick={handleNotificationClick}
              type="button"
            >
              🔔

              {unreadNotificationCount > 0 && (
                <span className="notification-dot">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}

            </button>

          </div>

        </div>

      </header>


      <main className="dashboard-main">

        <section className="profile-page-card">

          {/* OTHER STUDENT PROFILE HEADER */}

          <div className="profile-main-header">

            <div className="profile-large-avatar">

              {viewingProfile?.name
                ?.charAt(0)
                .toUpperCase()}

            </div>


            <div className="profile-header-info">

              <h2>
                {viewingProfile?.name ||
                  "Student"}
              </h2>

              <p>
                {viewingProfile?.degree ||
                  "Degree not added"}{" "}

                {viewingProfile?.year
                  ? `• ${viewingProfile.year}`
                  : ""}
              </p>

              <span>
                {viewingProfile?.college ||
                  "College not added"}
              </span>

            </div>

          </div>


          {/* PUBLIC INFORMATION */}

          <div className="profile-info-section">

            <div className="profile-section-title">
              Personal Information
            </div>


            <div className="profile-info-grid">

              <div className="profile-info-item">

                <span>
                  Name
                </span>

                <strong>
                  {viewingProfile?.name ||
                    "Not added"}
                </strong>

              </div>


              <div className="profile-info-item">

                <span>
                  Degree
                </span>

                <strong>
                  {viewingProfile?.degree ||
                    "Not added"}
                </strong>

              </div>


              <div className="profile-info-item">

                <span>
                  Year
                </span>

                <strong>
                  {viewingProfile?.year ||
                    "Not added"}
                </strong>

              </div>


              <div className="profile-info-item">

                <span>
                  College
                </span>

                <strong>
                  {viewingProfile?.college ||
                    "Not added"}
                </strong>

              </div>


              <div className="profile-info-item">

                <span>
                  City
                </span>

                <strong>
                  {viewingProfile?.city ||
                    "Not added"}
                </strong>

              </div>


              <div className="profile-info-item">

                <span>
                  State
                </span>

                <strong>
                  {viewingProfile?.state ||
                    "Not added"}
                </strong>

              </div>

            </div>

          </div>


          {/* SKILLS */}

          <div className="profile-info-section profile-skills-section">

            <div className="profile-section-title">
              Skills
            </div>


            <div className="profile-skills">

              {viewingProfile?.skills?.length > 0 ? (

                viewingProfile.skills.map(
                  (skill, index) => (

                    <span
                      key={index}
                      className="profile-skill-tag"
                    >
                      {skill}
                    </span>

                  )
                )

              ) : (

                <span className="profile-empty-text">
                  No skills added yet.
                </span>

              )}

            </div>

          </div>


       {/* BACK */}

          <div className="profile-connect-section">

            <button
              type="button"
              className="edit-profile-cancel"
              onClick={() => {
                setViewingProfile(null)
                setPage("students")
              }}
            >
              ← Back to Students
            </button>

          </div>


        </section>

      </main>

    </div>

  )
}
  // =========================================================
  // PROFILE PAGE
  // =========================================================

  if (page === "profile") {

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>
          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button className="dashboard-nav-link active">
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("activity")
              }
            >
              Your Activity
            </button>

          </nav>

          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>

        <main className="dashboard-main">

          <section className="profile-page-card">

            {/* PROFILE HEADER */}

            <div className="profile-main-header">

              <div className="profile-large-avatar">

                {currentUser?.name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

              <div className="profile-header-info">

                <h2>
                  {currentUser?.name ||
                    "Student"}
                </h2>

                <p>
                  {currentUser?.degree ||
                    "Degree not added"}{" "}
                  {currentUser?.year
                    ? `• ${currentUser.year}`
                    : ""}
                </p>

                <span>
                  {currentUser?.college ||
                    "College not added"}
                </span>

              </div>

              <button
                type="button"
                className="edit-profile-button"
                onClick={() => {

                  setProfileForm({
                    name:
                      currentUser?.name || "",

                    degree:
                      currentUser?.degree || "",

                    college:
                      currentUser?.college || "",

                    skills:
                      currentUser?.skills?.join(", ") || "",

                    city:
                      currentUser?.city || "",

                    state:
                      currentUser?.state || "",

                    profilePhoto:
                      currentUser?.profilePhoto || "",
                  })

                  setIsEditingProfile(true)

                }}
              >
                ✎ Edit Profile
              </button>

            </div>


            {/* EDIT PROFILE */}

            {isEditingProfile && (

              <div className="edit-profile-section">

                <div className="edit-profile-header">

                  <div>

                    <h3>
                      Edit Profile
                    </h3>

                    <p>
                      Update your profile information.
                    </p>

                  </div>

                  <button
                    className="edit-profile-close"
                    onClick={() =>
                      setIsEditingProfile(false)
                    }
                  >
                    ✕
                  </button>

                </div>


                <div className="edit-profile-form">

                  <div className="edit-profile-field">

                    <label>
                      Name
                    </label>

                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your name"
                    />

                  </div>


                  <div className="edit-profile-field">
                    <label>
                      Degree <small>🔒 From registration</small>
                    </label>

                    <input
                      type="text"
                      value={currentUser?.degree || ""}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="edit-profile-field">
                    <label>
                      Year <small>🔒 From registration</small>
                    </label>

                    <input
                      type="text"
                      value={currentUser?.year || ""}
                      disabled
                      readOnly
                    />
                  </div>


                  <div className="edit-profile-field">

                    <label>
                      College
                    </label>

                    <input
                      type="text"
                      value={profileForm.college}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          college: e.target.value,
                        })
                      }
                      placeholder="Enter your college"
                    />

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Skills
                    </label>

                    <input
                      type="text"
                      value={profileForm.skills}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          skills: e.target.value,
                        })
                      }
                      placeholder="React, Python, Java"
                    />

                    <small>
                      Separate multiple skills with commas.
                    </small>

                  </div>
                  <div className="edit-profile-field">

  <label>
    Project Level <span>*</span>
  </label>

  <input
    type="text"
    value={currentUser?.level || ""}
    readOnly
  />

</div>


<div className="edit-profile-field">

  <label>
    Course / Degree <span>*</span>
  </label>

  <input
    type="text"
    value={currentUser?.degree || ""}
    readOnly
  />

    
</div>
<div className="edit-profile-field">

  <label>
    Branch / Specialization
  </label>

  <select
    value={projectForm.branch}
    onChange={(e) =>
      setProjectForm({
        ...projectForm,
        branch: e.target.value,
      })
    }

  >
    <option value="">Select Branch / Specialization</option>

    <option value="Computer Science">Computer Science</option>
    <option value="Information Technology">Information Technology</option>
    <option value="Artificial Intelligence">Artificial Intelligence</option>
    <option value="Data Science">Data Science</option>
    <option value="Electronics">Electronics</option>
    <option value="Electrical Engineering">
      Electrical Engineering
    </option>
    <option value="Mechanical Engineering">
      Mechanical Engineering
    </option>
    <option value="Civil Engineering">
      Civil Engineering
    </option>
    <option value="Chemical Engineering">
      Chemical Engineering
    </option>
    <option value="Biotechnology">Biotechnology</option>

    <option value="Commerce">Commerce</option>
    <option value="Management">Management</option>
    <option value="Economics">Economics</option>
    <option value="Finance">Finance</option>
    <option value="Marketing">Marketing</option>

    <option value="Psychology">Psychology</option>
    <option value="Sociology">Sociology</option>
    <option value="English">English</option>
    <option value="Political Science">Political Science</option>
    <option value="History">History</option>

    <option value="Physics">Physics</option>
    <option value="Chemistry">Chemistry</option>
    <option value="Mathematics">Mathematics</option>

    <option value="Other">Other</option>
  </select>

</div>
<div className="edit-profile-field">

  <label>
    Academic Year
  </label>

  <input
    type="text"
    value={getAcademicYear()}
    readOnly
  />

</div>
<div className="edit-profile-field">

  <label>
    Academic Year
  </label>

  <input
    type="text"
    value={getAcademicYear()}
    readOnly
  />

  

</div>


  <div className="edit-profile-field">

     <label>
         City
          </label>

                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          city: e.target.value,
                        })
                      }
                      placeholder="Enter your city"
                    />

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      State
                    </label>

                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          state: e.target.value,
                        })
                      }
                      placeholder="Enter your state"
                    />

                  </div>

                </div>


                <div className="edit-profile-actions">

                  <button
                    className="edit-profile-cancel"
                    onClick={() =>
                      setIsEditingProfile(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="add-project-submit"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </div>

            )}


            {/* PROFILE INFORMATION */}
           {!isEditingProfile && (

            <div className="profile-info-section">
           

              <div className="profile-section-title">
                Personal Information
              </div>

              <div className="profile-info-grid">

                <div className="profile-info-item">

                  <span>
                    Name
                  </span>

                  <strong>
                    {currentUser?.name ||
                      "Not added"}
                  </strong>

                </div>


                <div className="profile-info-item profile-private-item">

                  <span>
                    Email <small>🔒 Only Me</small>
                  </span>

                  <strong>
                    {currentUser?.email ||
                      "Not available"}
                  </strong>

                </div>


                <div className="profile-info-item">

                  <span>
                    Degree
                  </span>

                  <strong>
                    {currentUser?.degree ||
                      "Not added"}
                  </strong>

                </div>


                <div className="profile-info-item">

                  <span>
                    Year
                  </span>

                  <strong>
                    {currentUser?.year ||
                      "Not added"}
                  </strong>

                </div>


                <div className="profile-info-item">

                  <span>
                    College
                  </span>

                  <strong>
                    {currentUser?.college ||
                      "Not added"}
                  </strong>

                </div>


                <div className="profile-info-item">

                  <span>
                    City
                  </span>

                  <strong>
                    {currentUser?.city ||
                      "Not added"}
                  </strong>

                </div>


                <div className="profile-info-item">

                  <span>
                    State
                  </span>

                  <strong>
                    {currentUser?.state ||
                      "Not added"}
                  </strong>

                </div>

              </div>

            </div>
            

    )}
            {/* SKILLS */}

            <div className="profile-info-section profile-skills-section">

              <div className="profile-section-title">
                Skills
              </div>

              <div className="profile-skills">

                {currentUser?.skills?.length > 0 ? (

                  currentUser.skills.map(
                    (skill, index) => (

                      <span
                        key={index}
                        className="profile-skill-tag"
                      >
                        {skill}
                      </span>

                    )
                  )

                ) : (

                  <span className="profile-empty-text">
                    No skills added yet.
                  </span>

                )}

              </div>

            </div>
            

          </section>
          

        </main>

      </div>
              


    )

  }


// =========================================================
// CHAT PAGE
// =========================================================

if (page === "chat") {
  const otherUser = activeChatConnection?.otherUser

  return (
    <div className="dashboard-page">

      <header className="dashboard-header">

        <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

        <nav className="dashboard-nav">

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("dashboard")
            }
          >
            Home
          </button>

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("profile")
            }
          >
            Profile
          </button>

          <button
            className="dashboard-nav-link"
            onClick={() =>
              setPage("activity")
            }
          >
            Your Activity
          </button>

        </nav>

        <div className="dashboard-header-right">

          <div className="notification-wrapper">

            <button
              className="notification-button"
              onClick={handleNotificationClick}
              type="button"
            >
              🔔

              {unreadNotificationCount > 0 && (
                <span className="notification-dot">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-panel">

                <div className="notification-panel-header">

                  <div>
                    <strong>
                      Notifications
                    </strong>

                    {unreadNotificationCount > 0 && (
                      <span>
                        {unreadNotificationCount} unread
                      </span>
                    )}
                  </div>

                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllNotificationsRead
                      }
                      className="mark-all-button"
                    >
                      Mark all read
                    </button>
                  )}

                </div>

                <div className="notification-list">
                  {renderNotifications()}
                </div>

              </div>
            )}

          </div>

        </div>

      </header>


      <main className="dashboard-main">

        <section className="chat-page-card">

          <div className="chat-header">

            <button
              type="button"
              className="chat-back-button"
              onClick={() => {
                setActiveChatConnection(null)
                setChatMessages([])
                setChatText("")
                setPage("students")
              }}
            >
              ← Back
            </button>

            <div className="chat-user-info">

              <div className="chat-avatar">
                {otherUser?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h2>
                  {otherUser?.name ||
                    "Student"}
                </h2>

                <p>
                  {otherUser?.degree ||
                    "Degree not added"}
                  {otherUser?.year
                    ? ` • ${otherUser.year}`
                    : ""}
                </p>
              </div>

            </div>

          </div>


          <div className="chat-messages">

            {chatLoading ? (

              <div className="chat-empty">
                Loading messages...
              </div>

            ) : chatMessages.length === 0 ? (

              <div className="chat-empty">

                <div className="chat-empty-icon">
                  💬
                </div>

                <strong>
                  Start your conversation
                </strong>

                <span>
                  Ask questions, discuss projects,
                  or share study-related information.
                </span>

              </div>

            ) : (

              chatMessages.map((message) => {

                const currentUserId =
                  currentUser?._id ||
                  currentUser?.id

                const isMine =
                  String(
                    message.sender?._id ||
                    message.sender
                  ) ===
                  String(currentUserId)

                return (
                  <div
                    key={message._id}
                    className={`chat-message-row ${
                      isMine
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                    <div className="chat-message-bubble">

                      <p>
                        {message.text}
                      </p>

                      <span>
                        {formatAnswerTime(
                          message.createdAt
                        )}
                      </span>

                    </div>

                  </div>
                )
              })

            )}

          </div>


          <div className="chat-input-area">

            <textarea
              value={chatText}
              onChange={(e) =>
                setChatText(e.target.value)
              }
              placeholder="Write a study-related message..."
              rows={2}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />

            <button
              type="button"
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={
                chatSending ||
                !chatText.trim()
              }
            >
              {chatSending
                ? "Sending..."
                : "Send"}
            </button>

          </div>

        </section>

      </main>

    </div>
  )
}
  // =========================================================
  // PROJECTS PAGE
  // =========================================================

  if (page === "projects") {

    const otherProjects =
      projects.filter(
        (project) =>
          String(project.owner?._id) !==
          String(currentUserId)
      )

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("profile")
              }
            >
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("activity")
              }
            >
              Your Activity
            </button>

          </nav>

          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>


        <main className="dashboard-main">

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                STUDENT PROJECTS
              </span>

              <h1>
                Explore Projects
              </h1>

              <p>
                Discover projects created by other
                students across College Connect.
              </p>

            </div>

          </section>


          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Student Projects
                </h2>

                <p>
                  Latest projects from other College Connect users.
                </p>

              </div>


              {!showAddProject && (

                <button
                  className="edit-profile-save"
                  type="button"
                  onClick={() => {

                    setProjectForm({
                      title: "",
                      description: "",
                      skills: "",
                      branch: "",
                      projectLink: "",
                      projectFile: null,
                    })

                    setShowAddProject(true)

                  }}
                >
                  + Add Project
                </button>

              )}

            </div>


            {/* ADD PROJECT FORM */}

            {showAddProject && (

              <div className="add-project-section study-material-share-card">

                <div className="edit-profile-header">

                  <div>

                    <h3>
                      Add New Project
                    </h3>

                    <p>
                      Share your project with other students.
                    </p>

                  </div>

                  <button
                    type="button"
                    className="edit-profile-close"
                    onClick={() =>
                      setShowAddProject(false)
                    }
                  >
                    ✕
                  </button>

                </div>


                <div className="edit-profile-form">

                  <div className="edit-profile-field">

                    <label>
                      Project Title <span>*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your project title"
                      value={projectForm.title}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          title: e.target.value,
                        })
                      }
                    />

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Skills <span>*</span>
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. Research, Python, Excel, Design"
                      value={projectForm.skills}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          skills: e.target.value,
                        })
                      }
                    />

                    <small>
                      Separate skills using commas.
                    </small>

                  </div>


                  <div
                    className="edit-profile-field"
                    style={{
                      gridColumn: "1 / -1"
                    }}
                  >

                    <label>
                      Description <span>*</span>
                    </label>

                    <textarea
                      placeholder="Explain what your project does..."
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          description: e.target.value,
                        })
                      }
                    />

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Project Level <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={currentUser?.level || ""}
                      readOnly
                    />

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Course / Degree <span>*</span>
                    </label>

                    <input
                      type="text"
                      value={currentUser?.degree || ""}
                      readOnly
                    />

                   
                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Branch / Specialization
                    </label>

                    <select
                      value={projectForm.branch}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          branch: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select Branch / Specialization
                      </option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                      <option value="Biotechnology">Biotechnology</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Management">Management</option>
                      <option value="Economics">Economics</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Sociology">Sociology</option>
                      <option value="English">English</option>
                      <option value="Political Science">Political Science</option>
                      <option value="History">History</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Other">Other</option>
                    </select>

                  </div>


                  <div className="edit-profile-field">

                    <label>
                      Academic Year
                    </label>

                    <input
                      type="text"
                      value={getAcademicYear()}
                      readOnly
                    />

                    <small>
                      Automatically generated from the current academic session.
                    </small>

                  </div>


                  <div
                    className="edit-profile-field"
                    style={{
                      gridColumn: "1 / -1"
                    }}
                  >

                    <label>
                      Project Files
                    </label>

                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.zip"
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          projectFile: e.target.files[0] || null,
                        })
                      }
                    />

                    <small>
                      Upload PDF, PPT, PPTX, DOC, DOCX or ZIP file.
                    </small>

                  </div>


                  <div
                    className="edit-profile-field"
                    style={{
                      gridColumn: "1 / -1"
                    }}
                  >

                    <label>
                      Project Link
                    </label>

                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={projectForm.projectLink}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          projectLink: e.target.value,
                        })
                      }
                    />

                    <small>
                      Optional — GitHub, live demo, or other project link.
                    </small>

                  </div>

                </div>


                <div className="edit-profile-actions">

                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={() => {

                      setShowAddProject(false)

                      setProjectForm({
                        title: "",
                        description: "",
                        skills: "",
                        branch: "",
                        projectLink: "",
                        projectFile: null,
                      })

                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="edit-profile-save"
                    disabled={projectSaving}
                    onClick={handleAddProject}
                  >
                    {projectSaving
                      ? "Publishing..."
                      : "Publish Project"}
                  </button>

                </div>

              </div>

            )}


            {/* PROJECT LIST */}

            {projectsLoading ? (

              <div className="students-message">
                Loading projects...
              </div>

            ) : otherProjects.length === 0 ? (

              <div className="students-message">
                No projects from other students yet.
              </div>

            ) : (

            <div className="projects-grid">

  {otherProjects.map((project) => (

    <div
      className="project-card"
      key={project._id}
    >

      {/* TOP */}
      <div className="project-card-top">

        <div className="project-icon">
          💻
        </div>

        <span className="project-date">
          {new Date(
            project.createdAt
          ).toLocaleDateString()}
        </span>

      </div>


      {/* 1. PROJECT TITLE */}
      <h3>
        {project.title}
      </h3>


      {/* 2. DESCRIPTION */}
      <p className="project-description">
        {project.description}
      </p>


      {/* 3. SKILLS */}
      {project.skills?.length > 0 && (

        <div className="project-technologies">

          {project.skills.map(
            (skill, index) => (

              <span
                key={index}
                className="project-tech-tag"
              >
                {skill}
              </span>

            )
          )}

        </div>

      )}


      {/* PROJECT DETAILS */}
      <div className="project-details">

        {/* 4. PROJECT LEVEL */}
        <div className="project-detail-item">
          <span>Project Level</span>
          <strong>
            {project.level || "—"}
          </strong>
        </div>


        {/* 5. COURSE / DEGREE */}
        <div className="project-detail-item">
          <span>Course / Degree</span>
          <strong>
            {project.degree || "—"}
          </strong>
        </div>


        {/* 6. BRANCH / SPECIALIZATION */}
        <div className="project-detail-item">
          <span>Branch / Specialization</span>
          <strong>
            {project.branch || "—"}
          </strong>
        </div>


        {/* 7. ACADEMIC YEAR */}
        <div className="project-detail-item">
          <span>Academic Year</span>
          <strong>
            {project.academicYear || "—"}
          </strong>
        </div>

      </div>


      {/* OWNER */}
      <div className="project-owner">

        <div className="project-owner-avatar">

          {project.owner?.name
            ?.charAt(0)
            .toUpperCase()}

        </div>

        <div>

          <strong>
            {project.owner?.name || "Student"}
          </strong>

          <span>
            {project.owner?.degree || "Student"}
          </span>

        </div>

      </div>


      {/* 8. PROJECT FILE */}
      {project.projectFileUrl && (

        <a
          href={`${API_URL}${project.projectFileUrl}`}
          target="_blank"
          rel="noreferrer"
          className="project-view-link"
        >
          📎 Project File
        </a>

      )}


      {/* 9. VIEW DEMO */}
      {project.projectLink && (

        <a
          href={project.projectLink}
          target="_blank"
          rel="noreferrer"
          className="project-view-link"
        >
          🔗 View Demo
        </a>

      )}


      {/* 10. VIEW PROFILE */}
      <button
  type="button"
  className="project-profile-button"
  onClick={() => {
    handleViewProfile(project.owner?._id)
    setPage("student-profile")
  }}
>
  👤 View Profile
</button>

    </div>

  ))}

</div>

            )}

          </section>

        </main>

      </div>

    )

  }


  // =========================================================
  // QUERIES PAGE
  // =========================================================

  if (page === "queries") {

    const otherQueries =
      queries.filter(
        (query) =>
          String(query.owner?._id) !==
          String(currentUserId)
      )

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("profile")
              }
            >
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("activity")
              }
            >
              Your Activity
            </button>

          </nav>

          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>


        <main className="dashboard-main">

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                STUDENT QUERIES
              </span>

              <h1>
                Ask & Learn
              </h1>

              <p>
                Ask questions, share knowledge and
                help other students.
              </p>

            </div>

          </section>


          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Student Queries
                </h2>

                <p>
                  Questions posted by other College Connect students.
                </p>

              </div>


              {!showAskQuery && (

                <button
                  className="edit-profile-save"
                  type="button"
                  onClick={() => {

                    setQueryForm({
                      text: "",
                    })

                    setShowAskQuery(true)

                  }}
                >
                  + Ask Query
                </button>

              )}

            </div>


            {/* ASK QUERY FORM */}

            {showAskQuery && (
              <div className="add-project-section">
                <div className="edit-profile-header">
                  <div>
                    <h3>Ask Query</h3>
                    <p>Share your question with other students.</p>
                  </div>

                  <button
                    type="button"
                    className="edit-profile-close"
                    onClick={() => {
                      setShowAskQuery(false)
                      setQueryForm({ text: "" })
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="edit-profile-form">
                  <div
                    className="edit-profile-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label>Your Query</label>
                    <textarea
                      rows="5"
                      placeholder="Write your query here..."
                      value={queryForm.text}
                      onChange={(e) =>
                        setQueryForm({
                          text: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="edit-profile-actions">
                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={() => {
                      setShowAskQuery(false)
                      setQueryForm({ text: "" })
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="edit-profile-save"
                    onClick={handleAddQuery}
                    disabled={querySaving}
                  >
                    {querySaving
                      ? "Posting..."
                      : "Post Query"}
                  </button>
                </div>
              </div>
            )}

            {/* QUERY LIST */}

            {queriesLoading ? (

              <div className="students-message">
                Loading queries...
              </div>

            ) : otherQueries.length === 0 ? (

              <div className="students-message">
                No queries from other students yet.
              </div>

            ) : (

              <div className="queries-list">

                {otherQueries.map((query) => (

                  <article
                    className="query-card"
                    key={query._id}
                  >

                    <div className="query-card-top">

                      <div>

                        <h2>
                          {query.text || query.title}
                        </h2>

                        <div className="query-author">

                          <strong>
                            {query.owner?.name ||
                              "Student"}
                          </strong>

                        </div>

                      </div>

                      <span className="query-date">

                        {new Date(
                          query.createdAt
                        ).toLocaleDateString()}

                      </span>

                    </div>


                    <p className="query-description">
                      {query.text || query.description}
                    </p>


                    <div className="query-card-footer">

                      <button
                        type="button"
                        className="query-answer-button"
                        onClick={() =>
                          handleToggleAnswers(query._id)
                        }
                      >
                        {openQueryAnswers[query._id]
                          ? "Hide Answers ↑"
                          : "Answer Query →"}
                      </button>

                    </div>

                    {openQueryAnswers[query._id] && (

                      <div className="query-answers-section">

                        <div className="query-answer-form">

                          <textarea
                            rows="3"
                            placeholder="Write your answer..."
                            value={answerForms[query._id] || ""}
                            onChange={(e) =>
                              setAnswerForms((previous) => ({
                                ...previous,
                                [query._id]: e.target.value,
                              }))
                            }
                          />

                          <button
                            type="button"
                            className="query-post-answer-button"
                            onClick={() =>
                              handleAddAnswer(query._id)
                            }
                            disabled={answerSaving[query._id]}
                          >
                            {answerSaving[query._id]
                              ? "Posting..."
                              : "Post Answer"}
                          </button>

                        </div>

                        {answersLoading[query._id] ? (

                          <div className="students-message">
                            Loading answers...
                          </div>

                        ) : (queryAnswers[query._id] || []).length === 0 ? (

                          <div className="students-message">
                            No answers yet. Be the first to answer.
                          </div>

                        ) : (

                          <div className="query-answers-list">

                            {(queryAnswers[query._id] || []).map((answer) => {
                              const isOwnAnswer =
                                String(answer.author?._id) ===
                                String(currentUserId)

                              return (
                                <div
                                  className="query-answer-item"
                                  key={answer._id}
                                >

                                  <div className="query-answer-top">

                                    <div>
                                      <strong>
                                        {answer.author?.name || "Student"}
                                      </strong>
                                      <span>
                                        {answer.author?.degree ||
                                          "Degree not added"}
                                      </span>
                                    </div>

                                    <time>
                                      {formatAnswerTime(answer.createdAt)}
                                    </time>

                                  </div>

                                  <p className="query-answer-text">
                                    {answer.answer}
                                  </p>

                                  <div className="query-answer-actions">

                                    <button
                                      type="button"
                                      className={
                                        isAnswerSaved(answer._id)
                                          ? "query-save-answer saved"
                                          : "query-save-answer"
                                      }
                                      onClick={() =>
                                        isAnswerSaved(answer._id)
                                          ? handleUnsaveAnswer(answer._id)
                                          : handleSaveAnswer(answer._id)
                                      }
                                      disabled={answerSavingState[answer._id]}
                                    >
                                      {answerSavingState[answer._id]
                                        ? "Saving..."
                                        : isAnswerSaved(answer._id)
                                          ? "🔖 Saved"
                                          : "🔖 Save Answer"}
                                    </button>

                                    {isOwnAnswer && (
                                      <button
                                        type="button"
                                        className="query-delete-answer"
                                        onClick={() =>
                                          handleDeleteAnswer(
                                            answer._id,
                                            query._id
                                          )
                                        }
                                      >
                                        Delete Answer
                                      </button>
                                    )}

                                  </div>

                                </div>
                              )
                            })}

                          </div>

                        )}

                      </div>

                    )}

                  </article>

                ))}

              </div>

            )}

          </section>

        </main>

      </div>

    )

  }


  // =========================================================
  // STUDY HUB PAGE
  // =========================================================

  if (page === "studyHub") {
    const matchingMaterials = studyMaterials.filter((material) => {
      const sameDegree =
        String(material.degree || "").trim().toLowerCase() ===
        String(currentUser?.degree || "").trim().toLowerCase()

      const sameYear =
        String(material.year || "").trim().toLowerCase() ===
        String(currentUser?.year || "").trim().toLowerCase()

      const categoryMatch =
        materialCategory === "All" ||
        material.category === materialCategory

      return sameDegree && sameYear && categoryMatch
    })

    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

          <nav className="dashboard-nav">
            <button
              className="dashboard-nav-link"
              onClick={() => setPage("dashboard")}
            >
              Home
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() => setPage("profile")}
            >
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() => setPage("activity")}
            >
              Your Activity
            </button>
          </nav>

          <div className="dashboard-header-right">
            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main">
          <section className="dashboard-welcome-section">
            <div className="welcome-text">
              <span className="welcome-small-text">
                STUDY HUB
              </span>

              <h1>
                Study Material
              </h1>

              <p>
                Discover and share study material for{" "}
                <strong>
                  {currentUser?.degree || "your degree"}
                  {currentUser?.year
                    ? ` • ${currentUser.year}`
                    : ""}
                </strong>.
              </p>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Study Hub</h2>
                <p>
                  Material is matched to your registered degree and year.
                </p>
              </div>

              {!showUploadMaterial && (
                <button
                  className="edit-profile-save"
                  type="button"
                  onClick={() => setShowUploadMaterial(true)}
                >
                  + Share Material
                </button>
              )}
            </div>

            {showUploadMaterial && (
              <div className="add-project-section">
                <div className="edit-profile-header">
                  <div>
                    <h3>Share Study Material</h3>
                    <p>
                      Your degree and year are taken from your registration.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="edit-profile-close"
                    onClick={() => setShowUploadMaterial(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="edit-profile-form">
                  <div className="edit-profile-field">
                    <label>Material Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Unit 1 Notes"
                      value={materialForm.title}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="edit-profile-field study-category-field">
  <label>Category</label>

  <div className="custom-category-dropdown">
    <button
      type="button"
      className={`custom-category-select ${
        categoryDropdownOpen ? "open" : ""
      }`}
      onClick={() =>
        setCategoryDropdownOpen(!categoryDropdownOpen)
      }
    >
      <span>{materialForm.category}</span>
      <span className="category-arrow">
        {categoryDropdownOpen ? "▲" : "▼"}
      </span>
    </button>

    {categoryDropdownOpen && (
      <div className="custom-category-menu">
        {studyCategories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              materialForm.category === category
                ? "custom-category-option selected"
                : "custom-category-option"
            }
            onClick={() => {
              setMaterialForm({
                ...materialForm,
                category,
              })
              setCategoryDropdownOpen(false)
            }}
          >
            <span>
              {category === "Notes"
                ? "📄"
                : category === "Previous Year Papers"
                  ? "📝"
                  : category === "Question Banks"
                    ? "📑"
                    : category === "Assignments"
                      ? "📚"
                      : category === "Study PDFs/Resources"
                        ? "📖"
                        : "🎓"}
            </span>

            <span>{category}</span>

            {materialForm.category === category && (
              <span className="category-check">✓</span>
            )}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

                  <div
                    className="edit-profile-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label>Description <small>Optional</small></label>
                    <textarea
                      rows="3"
                      placeholder="Add a short description..."
                      value={materialForm.description}
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div
                    className="edit-profile-field"
                    style={{ gridColumn: "1 / -1" }}
                  >
                    <label>File</label>
                    <input
                      id="study-material-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setMaterialForm({
                          ...materialForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />
                    <small>
                      PDF, documents, presentations or images.
                    </small>
                  </div>
                </div>

                <div className="edit-profile-actions">
                  <button
                    type="button"
                    className="edit-profile-cancel"
                    onClick={() => {
                      setShowUploadMaterial(false)
                      setMaterialForm({
                        title: "",
                        description: "",
                        category: "Notes",
                        file: null,
                      })
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="edit-profile-save"
                    onClick={handleUploadMaterial}
                    disabled={materialUploading}
                  >
                    {materialUploading
                      ? "Uploading..."
                      : "Share Material"}
                  </button>
                </div>
              </div>
            )}

            <div className="study-material-filters">
              <button
                type="button"
                className={
                  materialCategory === "All"
                    ? "study-filter active"
                    : "study-filter"
                }
                onClick={() => setMaterialCategory("All")}
              >
                All
              </button>

              {studyCategories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    materialCategory === category
                      ? "study-filter active"
                      : "study-filter"
                  }
                  onClick={() => setMaterialCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {studyMaterialsLoading ? (
              <div className="students-message">
                Loading study material...
              </div>
            ) : matchingMaterials.length === 0 ? (
              <div className="students-message">
                No study material found for your degree and year yet.
              </div>
            ) : (
              <div className="study-material-grid">
                {matchingMaterials.map((material) => (
                  <article
                    className="study-material-card"
                    key={material._id}
                  >
                    <div className="study-material-card-top">
                      <div className="study-material-icon">
                        {material.category === "Notes"
                          ? "📄"
                          : material.category === "Previous Year Papers"
                            ? "📝"
                            : material.category === "Question Banks"
                              ? "📑"
                              : material.category === "Assignments"
                                ? "📚"
                                : material.category === "Practical/Viva Material"
                                  ? "🎓"
                                  : "📖"}
                      </div>

                      <span>
                        {material.category}
                      </span>
                    </div>

                    <h3>{material.title}</h3>

                    {material.description && (
                      <p>{material.description}</p>
                    )}

                    <div className="study-material-meta">
                      <strong>
                        {material.owner?.name || "Student"}
                      </strong>

                      <span>
                        {material.degree}
                        {material.year
                          ? ` • ${material.year}`
                          : ""}
                      </span>
                    </div>

                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="project-view-link"
                      >
                        Open Material →
                      </a>
                    )}
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        download
                        className="study-material-download-button"
                      >
                        📥 Download
                      </a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    )
  }


  // =========================================================
  // YOUR ACTIVITY PAGE
  // =========================================================

  if (page === "activity") {

    const myProjects =
      projects.filter(
        (project) =>
          String(project.owner?._id) ===
          String(currentUserId)
      )

    const myQueries =
      queries.filter(
        (query) =>
          String(query.owner?._id) ===
          String(currentUserId)
      )

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>


          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("profile")
              }
            >
              Profile
            </button>

            <button className="dashboard-nav-link active">
              Your Activity
            </button>

          </nav>


          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>


        <main className="dashboard-main">

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                YOUR ACTIVITY
              </span>

              <h1>
                Your Activity
              </h1>

              <p>
                Everything you have created and shared
                on College Connect.
              </p>

            </div>

          </section>


          {/* ================= YOUR PROJECTS ================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Your Projects
                </h2>

                <p>
                  Projects you have added to College Connect.
                </p>

              </div>

            </div>


            {projectsLoading ? (

              <div className="students-message">
                Loading your projects...
              </div>

            ) : myProjects.length === 0 ? (

              <div className="students-message">
                You have not added any projects yet.
              </div>

            ) : (

              <div className="projects-grid">

                {myProjects.map((project) => (

                  <div
                    className="project-card"
                    key={project._id}
                  >

                    <div className="project-card-top">

                      <div className="project-icon">
                        💻
                      </div>

                      <span className="project-date">
                        {new Date(
                          project.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                    <h3>
                      {project.title}
                    </h3>

                    <p className="project-description">
                      {project.description}
                    </p>


                    {project.technologies?.length > 0 && (

                      <div className="project-technologies">

                        {project.technologies.map(
                          (technology, index) => (

                            <span
                              key={index}
                              className="project-tech-tag"
                            >
                              {technology}
                            </span>

                          )
                        )}

                      </div>

                    )}


                    {project.projectLink && (

                      <a
                        href={project.projectLink}
                        target="_blank"
                        rel="noreferrer"
                        className="project-view-link"
                      >
                        View Project →
                      </a>

                    )}

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* ================= YOUR QUERIES ================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Your Queries
                </h2>

                <p>
                  Questions you have posted on College Connect.
                </p>

              </div>

              {myQueries.length > 0 && (
                <button
                  type="button"
                  className="query-delete-open-button"
                  onClick={() => {
                    setSelectedDeleteQuery("")
                    setShowDeleteQuery(true)
                  }}
                >
                  Delete Query
                </button>
              )}

            </div>


            {queriesLoading ? (

              <div className="students-message">
                Loading your queries...
              </div>

            ) : myQueries.length === 0 ? (

              <div className="students-message">
                You have not posted any queries yet.
              </div>

            ) : (

              <div className="queries-list">

                {myQueries.map((query) => (

                  <article
                    className="query-card"
                    key={query._id}
                  >

                    <div className="query-card-top">

                      <div>

                        <h2>
                          {query.text || query.title}
                        </h2>

                        <div className="query-author">

                          <strong>
                            You
                          </strong>


                        </div>

                      </div>

                      <span className="query-date">

                        {new Date(
                          query.createdAt
                        ).toLocaleDateString()}

                      </span>

                    </div>


                    <p className="query-description">
                      {query.text || query.description}
                    </p>

                  </article>

                ))}

              </div>

            )}

          </section>


          {/* ================= DELETE QUERY SELECTOR ================= */}

          {showDeleteQuery && (
            <div
              className="query-delete-modal-overlay"
              onClick={() => {
                if (!queryDeleting) {
                  setShowDeleteQuery(false)
                  setSelectedDeleteQuery("")
                }
              }}
            >
              <div
                className="query-delete-modal"
                onClick={(e) => e.stopPropagation()}
              >

                <div className="query-delete-modal-header">
                  <div>
                    <h3>Select Query to Delete</h3>
                    <p>Choose exactly one of your queries.</p>
                  </div>

                  <button
                    type="button"
                    className="query-delete-modal-close"
                    onClick={() => {
                      if (!queryDeleting) {
                        setShowDeleteQuery(false)
                        setSelectedDeleteQuery("")
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="query-delete-options">
                  {myQueries.map((query) => (
                    <label
                      key={query._id}
                      className={
                        String(selectedDeleteQuery) === String(query._id)
                          ? "query-delete-option selected"
                          : "query-delete-option"
                      }
                    >
                      <input
                        type="radio"
                        name="delete-query"
                        value={query._id}
                        checked={
                          String(selectedDeleteQuery) === String(query._id)
                        }
                        onChange={() =>
                          setSelectedDeleteQuery(query._id)
                        }
                      />

                      <span className="query-delete-radio"></span>

                      <span className="query-delete-option-text">
                        <strong>{query.title}</strong>
                        <small>
                          {new Date(
                            query.createdAt
                          ).toLocaleDateString()}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>

                <div className="query-delete-modal-actions">
                  <button
                    type="button"
                    className="query-delete-cancel"
                    onClick={() => {
                      if (!queryDeleting) {
                        setShowDeleteQuery(false)
                        setSelectedDeleteQuery("")
                      }
                    }}
                    disabled={queryDeleting}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="query-delete-confirm"
                    onClick={handleDeleteSelectedQuery}
                    disabled={!selectedDeleteQuery || queryDeleting}
                  >
                    {queryDeleting
                      ? "Deleting..."
                      : "Delete Selected Query"}
                  </button>
                </div>

                <div className="query-delete-warning">
                  ⚠ Deleting a query also deletes its answers.
                </div>

              </div>
            </div>
          )}


          {/* ================= YOUR MATERIAL ================= */}

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Your Material</h2>
                <p>Study material you have shared on College Connect.</p>
              </div>
            </div>

            {studyMaterialsLoading ? (
              <div className="students-message">
                Loading your material...
              </div>
            ) : (
              <>
                {studyCategories.map((category) => {
                  const categoryMaterials = studyMaterials.filter(
                    (material) =>
                      String(material.owner?._id || material.owner) ===
                        String(currentUserId) &&
                      material.category === category
                  )

                  return (
                    <div
                      className="your-material-category"
                      key={category}
                    >
                      <div className="your-material-category-heading">
                        <h3>{category}</h3>
                        <span>
                          {categoryMaterials.length} material
                          {categoryMaterials.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {categoryMaterials.length === 0 ? (
                        <div className="students-message">
                          No material shared in this category.
                        </div>
                      ) : (
                        <div className="study-material-grid">
                          {categoryMaterials.map((material) => (
                            <article
                              className="study-material-card"
                              key={material._id}
                            >
                              <div className="study-material-card-top">
                                <div className="study-material-icon">
                                  📚
                                </div>
                                <span>{material.category}</span>
                              </div>

                              <h3>{material.title}</h3>

                              {material.description && (
                                <p>{material.description}</p>
                              )}

                              <div className="study-material-meta">
                                <span>
                                  {material.degree}
                                  {material.year
                                    ? ` • ${material.year}`
                                    : ""}
                                </span>
                              </div>

                              <div className="study-material-actions">
                                {material.fileUrl && (
                                  <a
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="project-view-link"
                                  >
                                    Open Material →
                                  </a>
                                )}
                                {material.fileUrl && (
  <a
    href={material.fileUrl}
    download
    className="study-material-download-button"
  >
    📥 Download
  </a>
)}

                                <button
                                  type="button"
                                  className="query-delete-answer"
                                  onClick={() =>
                                    handleDeleteMaterial(material._id)
                                  }
                                  disabled={
                                    materialDeleting[material._id]
                                  }
                                >
                                  {materialDeleting[material._id]
                                    ? "Deleting..."
                                    : "Delete Material"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </section>


          {/* ================= CONNECTED STUDENTS ================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Connected Students
                </h2>

                <p>
                  Students you connect with will appear here.
                </p>

              </div>

            </div>

            <div className="students-message">
              No connected students yet.
            </div>

          </section>


          {/* ================= SAVED ANSWERS ================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Saved Answers 🔖
                </h2>

                <p>
                  Answers you save from student queries will appear here.
                </p>

              </div>

            </div>

            {savedAnswersLoading ? (

              <div className="students-message">
                Loading saved answers...
              </div>

            ) : savedAnswers.length === 0 ? (

              <div className="students-message">
                No saved answers yet.
              </div>

            ) : (

              <div className="saved-answers-list">
                {savedAnswers.map((saved) => {
                  const answer = saved.answer
                  if (!answer) return null

                  return (
                    <article
                      className="saved-answer-card"
                      key={saved._id}
                    >
                      <div className="saved-answer-top">
                        <div>
                          <strong>
                            {answer.author?.name || "Student"}
                          </strong>
                          <span>
                            {answer.author?.degree || "Degree not added"}
                          </span>
                        </div>

                        <time>
                          {formatAnswerTime(answer.createdAt)}
                        </time>
                      </div>

                      {answer.query?.title && (
                        <div className="saved-answer-query">
                          {answer.query.title}
                        </div>
                      )}

                      <p>
                        {answer.answer}
                      </p>

                      <button
                        type="button"
                        className="query-delete-answer"
                        onClick={() =>
                          handleUnsaveAnswer(answer._id)
                        }
                      >
                        Remove Saved Answer
                      </button>
                    </article>
                  )
                })}
              </div>

            )}

          </section>

        </main>

      </div>

    )

  }


  // =========================================================
  // DASHBOARD
  // =========================================================

  if (page === "dashboard") {

    return (

      <div className="dashboard-page">

        <header className="dashboard-header">

          <div className="dashboard-brand">

  <img
    src={collegeConnectLogo}
    alt="College Connect"
    className="dashboard-logo-image"
  />

</div>

          <nav className="dashboard-nav">

            <button
              className="dashboard-nav-link active"
              onClick={() =>
                setPage("dashboard")
              }
            >
              Home
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("profile")
              }
            >
              Profile
            </button>

            <button
              className="dashboard-nav-link"
              onClick={() =>
                setPage("activity")
              }
            >
              Your Activity
            </button>

          </nav>


          <div className="dashboard-header-right">

            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={handleNotificationClick}
                type="button"
              >
                🔔
                {unreadNotificationCount > 0 && (
                  <span className="notification-dot">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-panel">
                  <div className="notification-panel-header">
                    <div>
                      <strong>Notifications</strong>
                      {unreadNotificationCount > 0 && (
                        <span>{unreadNotificationCount} unread</span>
                      )}
                    </div>

                    {unreadNotificationCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="mark-all-button"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
  {renderNotifications()}
</div>
                </div>
              )}
            </div>

          </div>

        </header>


        <main className="dashboard-main">


          {/* ================= WELCOME ================= */}

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                Welcome
              </span>

              <h1>
                Welcome, {currentUser?.name} 👋
              </h1>

              <p>
                Connect with students, learn together
                and build something great.
              </p>

            </div>


           

             

           </section>


          {/* ================= QUICK ACCESS ================= */}

          <section className="dashboard-section">

            <div className="dashboard-section-heading">

              <div>

                <h2>
                  Explore College Connect
                </h2>

                <p>
                  Everything you need to connect,
                  learn and build.
                </p>

              </div>

            </div>


            <div className="dashboard-feature-grid">


              {/* STUDENTS */}

              <button
                className="dashboard-feature-card students-card"
                onClick={() =>
                  setPage("students")
                }
              >

                <div className="feature-card-top">

                  <div className="feature-icon blue-feature-icon">
                    👥
                  </div>

                  <span className="feature-arrow">
                    →
                  </span>

                </div>

                <div className="feature-card-content">

                  <h3>
                    Students
                  </h3>

                  <p>
                    Discover students, connect with them
                    and grow your college network.
                  </p>

                  <span className="feature-link">
                    Discover students →
                  </span>

                </div>

              </button>


              {/* PROJECTS */}

              <button
                className="dashboard-feature-card projects-card"
                onClick={() =>
                  setPage("projects")
                }
              >

                <div className="feature-card-top">

                  <div className="feature-icon green-feature-icon">
                    💻
                  </div>

                  <span className="feature-arrow">
                    →
                  </span>

                </div>

                <div className="feature-card-content">

                  <h3>
                    Projects
                  </h3>

                  <p>
                    Explore student projects, share your work
                    and build together.
                  </p>

                  <span className="feature-link">
                    Explore projects →
                  </span>

                </div>

              </button>


              {/* QUERIES */}

              <button
                className="dashboard-feature-card queries-card"
                onClick={() =>
                  setPage("queries")
                }
              >

                <div className="feature-card-top">

                  <div className="feature-icon blue-feature-icon">
                    💬
                  </div>

                  <span className="feature-arrow">
                    →
                  </span>

                </div>

                <div className="feature-card-content">

                  <h3>
                    Queries
                  </h3>

                  <p>
                    Ask questions, share knowledge
                    and help other students.
                  </p>

                  <span className="feature-link">
                    View queries →
                  </span>

                </div>

              </button>


              {/* STUDY HUB */}

              <button
                className="dashboard-feature-card chat-card"
                onClick={() =>
                  setPage("studyHub")
                }
              >
                <div className="feature-card-top">
                  <div className="feature-icon green-feature-icon">
                    📚
                  </div>

                  <span className="feature-arrow">
                    →
                  </span>
                </div>

                <div className="feature-card-content">
                  <h3>
                    Study Hub
                  </h3>

                  <p>
                    Share and discover notes, papers,
                    assignments and study resources.
                  </p>

                  <span className="feature-link">
                    Explore study material →
                  </span>
                </div>
              </button>


            </div>

          </section>


          {/* ================= BOTTOM INFO ================= */}

          <section className="dashboard-bottom-card">

            <div className="bottom-card-decoration"></div>

            <div className="bottom-card-content">

              <span>
                COLLEGE CONNECT
              </span>

              <h2>
                Connect • Learn • Build
              </h2>

              <p>
                Your college network, all in one place.
              </p>

            </div>

          </section>


        </main>

      </div>

    )

  }


  // =========================================================
  // LANDING PAGE
  // =========================================================

  return (

    <div className="app">

      <main className="simple-landing">

        <h1>

          Your college
          <br />

          <span>
            network starts here.
          </span>

        </h1>


        <div className="network-visual">

          <div className="network-glow"></div>

          <div className="connection-line line-one"></div>
          <div className="connection-line line-two"></div>
          <div className="connection-line line-three"></div>
          <div className="connection-line line-four"></div>
          <div className="connection-line line-five"></div>


          <div className="network-node node-one">
            <span>CS</span>
          </div>

          <div className="network-node node-two">
            <span>AI</span>
          </div>

          <div className="network-node node-three">
            <span>IT</span>
          </div>

          <div className="network-node node-four">
            <span>DS</span>
          </div>

          <div className="network-node node-five">
            <span>ML</span>
          </div>

          <div className="network-node node-six">
            <span>EC</span>
          </div>


          <div className="network-center">

            <div className="center-logo">
              CC
            </div>

            <strong>
              College
            </strong>

            <span>
              Connect
            </span>

            <div className="center-status">

              <span></span>

              Student Network

            </div>

          </div>


          <div className="network-card card-students">

            <div className="small-card-icon blue-icon">
              👥
            </div>

            <div>

              <strong>
                Students
              </strong>

              <small>
                Connect & learn
              </small>

            </div>

          </div>


          <div className="network-card card-projects">

            <div className="small-card-icon green-icon">
              💻
            </div>

            <div>

              <strong>
                Projects
              </strong>

              <small>
                Build together
              </small>

            </div>

          </div>


          <div className="network-card card-queries">

            <div className="small-card-icon blue-icon">
              💬
            </div>

            <div>

              <strong>
                Queries
              </strong>

              <small>
                Ask & solve
              </small>

            </div>

          </div>

        </div>


        <div className="simple-landing-actions">

          <button
            className="primary-button"
            onClick={() =>
              setPage("register")
            }
          >
            Get Started
            <span>→</span>
          </button>


          <button
            className="outline-button"
            onClick={() =>
              setPage("login")
            }
          >
            Login
          </button>

        </div>

      </main>

    </div>

  )

}

export default App
import './App.css'
import { useEffect, useState, useRef } from "react"
import collegeConnectLogo from "./assets/college-connect-logo.png"
const urlBase64ToUint8Array = (base64String) => {
  const padding =
    "=".repeat((4 - (base64String.length % 4)) % 4)

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/")

  const rawData = window.atob(base64)

  return Uint8Array.from(
    [...rawData].map((char) =>
      char.charCodeAt(0)
    )
  )
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {

  // ================= MAIN STATES =================

 const savedToken = localStorage.getItem("collegeConnectToken")
const savedUser = localStorage.getItem("collegeConnectUser")

const [showIntro, setShowIntro] = useState(!savedToken)
const [page, setPage] = useState(savedToken ? "dashboard" : "landing")
const [currentUser, setCurrentUser] = useState(() => {
  try {
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
})
const registerPushNotifications = async () => {
  if (!currentUser) return

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return
  }

  try {
    const permission =
      await Notification.requestPermission()

    if (permission !== "granted") {
      return
    }

    const registration =
      await navigator.serviceWorker.register("/sw.js")

    let subscription =
      await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey:
            urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY
            ),
        })
    }

    const response = await fetch(
      `${API_URL}/api/push/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
        body: JSON.stringify(subscription),
      }
    )

    if (!response.ok) {
      const data = await response.json()

      console.error(
        data.message ||
          "Unable to save push subscription."
      )
    }
  } catch (error) {
    console.error(
      "Push notification setup error:",
      error
    )
  }
}
useEffect(() => {
  if (!currentUser) return

  registerPushNotifications()

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser])
  const [toast, setToast] = useState({
  show: false,
  message: "",
  type: "success",
})
const showToast = (message, type = "success") => {
  setToast({
    show: true,
    message,
    type,
  })

  setTimeout(() => {
    setToast({
      show: false,
      message: "",
      type: "success",
    })
  }, 3000)
}

const renderToast = () => {
  if (!toast.show) return null

  return (
    <div className={`app-toast ${toast.type}`}>
      <span className="app-toast-icon">
        {toast.type === "success"
          ? "✓"
          : toast.type === "warning"
          ? "!"
          : toast.type === "info"
          ? "i"
          : "×"}
      </span>

      <span>{toast.message}</span>
    </div>
  )
}

  // ================= NOTIFICATIONS =================
const [notifications, setNotifications] = useState([])
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)
const [showNotifications, setShowNotifications] = useState(false)
const notificationRef = useRef(null)
const [notificationsLoading, setNotificationsLoading] = useState(false)
const [connections, setConnections] = useState([])
const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
// ================= SETTINGS - ACCOUNT =================

const [showChangeEmail, setShowChangeEmail] = useState(false)
const [showChangePassword, setShowChangePassword] = useState(false)

const [changeEmailForm, setChangeEmailForm] = useState({
  currentPassword: "",
  newEmail: "",
})

const [changePasswordForm, setChangePasswordForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const [accountSettingsSaving, setAccountSettingsSaving] =
  useState(false)


  
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

  // ================= SMARTY STUDY =================


const [smartyStudyView, setSmartyStudyView] = useState("dashboard")
const [smartyStudy, setSmartyStudy] = useState(null)

const [smartyFlashcardIndex, setSmartyFlashcardIndex] = useState(0)
const [smartyFlashcardFlipped, setSmartyFlashcardFlipped] = useState(false)

const [smartySelectedAnswers, setSmartySelectedAnswers] = useState({})
const [smartyTestScore, setSmartyTestScore] = useState(null)
const [smartyLearningView, setSmartyLearningView] = useState("dashboard")
// =========================================================
// SMARTY STUDY — MAIN DATA + 21 CARD CONNECTION
// =========================================================

const [smartyStudyLoading, setSmartyStudyLoading] = useState(false)
const [smartyStudyError, setSmartyStudyError] = useState("")

const [smartySelectedTopicIndex, setSmartySelectedTopicIndex] = useState(0)

const [smartyActiveCard, setSmartyActiveCard] = useState(null)

const [smartyCardLoading, setSmartyCardLoading] = useState(false)

const [smartyCardError, setSmartyCardError] = useState("")

const [smartyMockTestAnswers, setSmartyMockTestAnswers] = useState({})

const [smartyMockTestSubmitted, setSmartyMockTestSubmitted] =
  useState(false)

const [smartyMockTestScore, setSmartyMockTestScore] =
  useState(null)

const [smartyBossAnswers, setSmartyBossAnswers] = useState({})

const [smartyBossSubmitted, setSmartyBossSubmitted] =
  useState(false)

const [smartyBossScore, setSmartyBossScore] =
  useState(null)

const [smartySocraticAnswer, setSmartySocraticAnswer] =
  useState("")

const [smartySocraticSubmitted, setSmartySocraticSubmitted] =
  useState(false)

const [smartyQuestStep, setSmartyQuestStep] = useState(0)

const [smartyQuestAnswer, setSmartyQuestAnswer] =
  useState("")

const [smartyQuestSubmitted, setSmartyQuestSubmitted] =
  useState(false)

const [smartyMistakeAnswer, setSmartyMistakeAnswer] =
  useState("")

const [smartyMistakeSubmitted, setSmartyMistakeSubmitted] =
  useState(false)

const [smartyScenarioAnswer, setSmartyScenarioAnswer] =
  useState("")

const [smartyScenarioSubmitted, setSmartyScenarioSubmitted] =
  useState(false)

const [smartyExamNightTopicIndex, setSmartyExamNightTopicIndex] =
  useState(0)

const [smartySpacedIndex, setSmartySpacedIndex] =
  useState(0)

const [smartySpacedAnswer, setSmartySpacedAnswer] =
  useState("")

const [smartySpacedSubmitted, setSmartySpacedSubmitted] =
  useState(false)


// =========================================================
// SMARTY STUDY — FETCH COMPLETE AI DATA
// =========================================================

const fetchSmartyStudy = async (materialId) => {
  if (!materialId) {
    return null
  }

  try {
    setSmartyStudyLoading(true)
    setSmartyStudyError("")

    const token = localStorage.getItem(
      "collegeConnectToken"
    )

    const response = await fetch(
      `${API_URL}/api/smarty-study/${materialId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to load Smarty Study."
      )
    }

    if (!data.smartyStudy) {
      throw new Error(
        "Smarty Study data was not returned."
      )
    }

    setSmartyStudy(data.smartyStudy)

    return data.smartyStudy

  } catch (error) {

    console.error(
      "Smarty Study fetch error:",
      error
    )

    setSmartyStudyError(
      error.message ||
        "Unable to load study content."
    )

    return null

  } finally {

    setSmartyStudyLoading(false)

  }
}


// =========================================================
// SMARTY STUDY — GET CURRENT MATERIAL ID
// =========================================================

const getSmartyMaterialId = () => {

  if (!smartyStudy) {
    return null
  }

  if (smartyStudy.material?._id) {
    return smartyStudy.material._id
  }

  if (smartyStudy.material) {
    return smartyStudy.material
  }

  return null
}


// =========================================================
// SMARTY STUDY — LOAD DATA WHEN CARD IS OPENED
// =========================================================

const openSmartyCard = async (cardName) => {

  setSmartyActiveCard(cardName)

  setSmartyCardError("")

  const materialId = getSmartyMaterialId()

  if (!materialId) {

    setSmartyCardError(
      "Please upload and analyze your study material first."
    )

    return
  }

  if (
    !smartyStudy?.topics ||
    !Array.isArray(smartyStudy.topics) ||
    smartyStudy.topics.length === 0
  ) {

    setSmartyCardError(
      "No AI study content is available yet."
    )

    return
  }

  setSmartyCardLoading(true)

  try {

    const latestStudy =
      await fetchSmartyStudy(materialId)

    if (latestStudy) {

      setSmartyActiveCard(cardName)

    }

  } catch (error) {

    console.error(
      "Smarty card loading error:",
      error
    )

  } finally {

    setSmartyCardLoading(false)

  }
}


// =========================================================
// SMARTY STUDY — CHANGE TOPIC
// =========================================================

const changeSmartyTopic = (direction) => {

  if (
    !smartyStudy?.topics ||
    smartyStudy.topics.length === 0
  ) {
    return
  }

  setSmartySelectedTopicIndex((current) => {

    const next =
      current + direction

    if (next < 0) {
      return smartyStudy.topics.length - 1
    }

    if (
      next >= smartyStudy.topics.length
    ) {
      return 0
    }

    return next

  })
}


// =========================================================
// SMARTY STUDY — CURRENT TOPIC
// =========================================================

const smartyCurrentTopic =
  smartyStudy?.topics?.[
    smartySelectedTopicIndex
  ] || null


// =========================================================
// SMARTY STUDY — CLOSE CARD
// =========================================================

const closeSmartyCard = () => {

  setSmartyActiveCard(null)

  setSmartyCardError("")

  setSmartyMockTestSubmitted(false)

  setSmartyMockTestScore(null)

  setSmartyBossSubmitted(false)

  setSmartyBossScore(null)

  setSmartySocraticAnswer("")

  setSmartySocraticSubmitted(false)

  setSmartyQuestStep(0)

  setSmartyQuestAnswer("")

  setSmartyQuestSubmitted(false)

  setSmartyMistakeAnswer("")

  setSmartyMistakeSubmitted(false)

  setSmartyScenarioAnswer("")

  setSmartyScenarioSubmitted(false)

  setSmartySpacedAnswer("")

  setSmartySpacedSubmitted(false)

}
const [smartyTeachBackTopicIndex, setSmartyTeachBackTopicIndex] = useState(null)
const [smartyTeachBackAnswer, setSmartyTeachBackAnswer] = useState("")
const [smartyTeachBackSubmitted, setSmartyTeachBackSubmitted] = useState(false)
const [smartyTeachBackEvaluation, setSmartyTeachBackEvaluation] = useState(null)
const [smartyTeachBackLoading, setSmartyTeachBackLoading] = useState(false)
const [smartyTeachBackError, setSmartyTeachBackError] = useState("")

const submitSmartyTeachBack = async () => {
  if (
    smartyTeachBackTopicIndex === null ||
    !smartyTeachBackAnswer.trim() ||
    !smartyStudy?.material?._id
  ) {
    return
  }

  try {
    setSmartyTeachBackLoading(true)
    setSmartyTeachBackError("")
    setSmartyTeachBackSubmitted(false)
    setSmartyTeachBackEvaluation(null)

    const response = await fetch(
      `${API_URL}/api/smarty-study/teach-back/${smartyStudy.material._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
        body: JSON.stringify({
          topicIndex: smartyTeachBackTopicIndex,
          explanation: smartyTeachBackAnswer.trim(),
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to evaluate your explanation."
      )
    }

    if (!data.evaluation) {
      throw new Error(
        "AI evaluation was not returned."
      )
    }

    setSmartyTeachBackEvaluation(
      data.evaluation
    )

    setSmartyTeachBackSubmitted(true)
  } catch (error) {
    console.error(
      "Teach Back submission error:",
      error
    )

    setSmartyTeachBackError(
      error.message ||
        "Unable to evaluate your explanation."
    )
  } finally {
    setSmartyTeachBackLoading(false)
  }
}
  // ================= CONNECTIONS =================

  const [connectionSaving, setConnectionSaving] = useState({})
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [activeChatConnection, setActiveChatConnection] = useState(null)
  const [settingsSection, setSettingsSection] = useState(null)
  const [notificationSettings, setNotificationSettings] =
  useState({
    connectRequests: true,
    requestAccepted: true,
    studyMaterial: true,
    queries: true,
    projectUpdates: true,
    importantWebsiteUpdates: true,
    muteAll: false,
  })

const [notificationSettingsLoading, setNotificationSettingsLoading] =
  useState(false)

const [notificationSettingsSaving, setNotificationSettingsSaving] =
  useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatText, setChatText] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [messageMenuId, setMessageMenuId] = useState(null)
  const [messageMenuPosition, setMessageMenuPosition] = useState({
  x: 0,
  y: 0,
})
const [unsendingMessageId, setUnsendingMessageId] = useState(null)
const longPressTimerRef = useRef(null)
const [isStudentBlocked, setIsStudentBlocked] = useState(false)
const [chatMenuOpen, setChatMenuOpen] = useState(false)
const [blockLoading, setBlockLoading] = useState(false)
const [blockedStudentIds, setBlockedStudentIds] = useState([])
 // ================= PROFILE =================

const [isEditingProfile, setIsEditingProfile] = useState(false)
const [profileSaving, setProfileSaving] = useState(false)

const [viewingProfile, setViewingProfile] = useState(null)
const [, setViewingProfileLoading] = useState(false)
const [showPhotoCropper, setShowPhotoCropper] = useState(false)
const [photoPreview, setPhotoPreview] = useState("")
const [photoZoom, setPhotoZoom] = useState(1)
const [photoPosition, setPhotoPosition] = useState({
  x: 0,
  y: 0,
})

const photoDragRef = useRef({
  dragging: false,
  startX: 0,
  startY: 0,
  initialX: 0,
  initialY: 0,
})
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
  const [forgotPasswordSource, setForgotPasswordSource] =
  useState("login")


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

  // ======================================================
// CHANGE EMAIL
// ======================================================

const handleChangeEmail = async () => {
  const currentPassword =
    changeEmailForm.currentPassword.trim()

  const newEmail =
    changeEmailForm.newEmail.trim().toLowerCase()

  if (!currentPassword) {
    showToast(
      "Please enter your current password.",
      "warning"
    )
    return
  }

  if (!newEmail) {
    showToast(
      "Please enter your new email.",
      "warning"
    )
    return
  }

  if (!newEmail.includes("@")) {
    showToast(
      "Please enter a valid email address.",
      "warning"
    )
    return
  }

  try {
    setAccountSettingsSaving(true)

    const response = await fetch(
      `${API_URL}/api/settings/email`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },

        body: JSON.stringify({
          currentPassword,
          newEmail,
        }),
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to change email.",
        "error"
      )
      return
    }

    setCurrentUser(data.user)

    localStorage.setItem(
      "collegeConnectUser",
      JSON.stringify(data.user)
    )

    setChangeEmailForm({
      currentPassword: "",
      newEmail: "",
    })

    setShowChangeEmail(false)

    showToast(
      "Email changed successfully.",
      "success"
    )
  } catch (error) {
    console.error(
      "Change email error:",
      error
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setAccountSettingsSaving(false)
  }
}


// ======================================================
// CHANGE PASSWORD
// ======================================================

const handleChangePassword = async () => {
  const currentPassword =
    changePasswordForm.currentPassword

  const newPassword =
    changePasswordForm.newPassword

  const confirmPassword =
    changePasswordForm.confirmPassword

  if (!currentPassword) {
    showToast(
      "Please enter your current password.",
      "warning"
    )
    return
  }

  if (!newPassword) {
    showToast(
      "Please enter your new password.",
      "warning"
    )
    return
  }

  if (newPassword.length < 6) {
    showToast(
      "New password must be at least 6 characters.",
      "warning"
    )
    return
  }

  if (newPassword !== confirmPassword) {
    showToast(
      "New password and confirm password do not match.",
      "warning"
    )
    return
  }

  try {
    setAccountSettingsSaving(true)

    const response = await fetch(
      `${API_URL}/api/settings/password`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },

        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      }
    )

    const data =
      await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to change password.",
        "error"
      )
      return
    }

    setChangePasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    setShowChangePassword(false)

    showToast(
      "Password changed successfully.",
      "success"
    )
  } catch (error) {
    console.error(
      "Change password error:",
      error
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setAccountSettingsSaving(false)
  }
}

  // =========================================================
  // CURRENT USER ID
  // =========================================================

  const currentUserId =
    currentUser?._id || currentUser?.id || ""

  const connectedStudents = connections
    .filter((connection) => connection?.status === "accepted")
    .map((connection) => {
      if (connection?.otherUser) return connection.otherUser

      const requester = connection?.requester
      const recipient = connection?.recipient
      const requesterId = requester?._id || requester?.id || requester

      return String(requesterId) === String(currentUserId)
        ? recipient
        : requester
    })
    .filter((student) => student && (student._id || student.id))

const handleLogout = () => {
  setShowLogoutConfirm(true)
}

const confirmLogout = () => {
  localStorage.removeItem("collegeConnectToken")
  localStorage.removeItem("collegeConnectUser")
  

  setCurrentUser(null)
  setViewingProfile(null)
  setIsEditingProfile(false)
  setPage("landing")
  setShowIntro(false)

  setShowLogoutConfirm(false)
}

// =========================================================
// DEACTIVATE ACCOUNT
// =========================================================

const handleDeactivateAccount = async () => {
 

  try {
    const response = await fetch(
      `${API_URL}/api/account/deactivate`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to deactivate account.",
        "error"
      )

      return
    }

    // Clear login session
    localStorage.removeItem(
      "collegeConnectToken"
    )

    localStorage.removeItem(
      "collegeConnectUser"
    )

    setCurrentUser(null)
    setViewingProfile(null)
    setIsEditingProfile(false)
    setSettingsSection(null)
    setPage("landing")
    setShowIntro(false)

  } catch (error) {
    console.error(
      "Deactivate account error:",
      error
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  }
}


// =========================================================
// DELETE ACCOUNT
// =========================================================

const handleDeleteAccount = async () => {
  
  try {
    const response = await fetch(
      `${API_URL}/api/account`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to delete account.",
        "error"
      )

      return
    }

    // Clear login session
    localStorage.removeItem(
      "collegeConnectToken"
    )

    localStorage.removeItem(
      "collegeConnectUser"
    )

    setCurrentUser(null)
    setViewingProfile(null)
    setIsEditingProfile(false)
    setSettingsSection(null)
    setPage("landing")
    setShowIntro(false)

  } catch (error) {
    console.error(
      "Delete account error:",
      error
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  }
}
  // =========================================================
  // SAVE PROFILE
  // =========================================================

  const handleSaveProfile = async () => {

    if (!currentUser) {
      showToast("User information not found.", "error")
      return
    }

    const userId =
      currentUser._id || currentUser.id

    if (!userId) {
      showToast("User ID not found. Please login again.", "error")
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

       showToast(
  data.message ||
  "Unable to update profile.",
  "error"
)

        return
      }

      setCurrentUser(data.user)

      setIsEditingProfile(false)

     showToast("Profile updated successfully!", "success")

    } catch (error) {

      console.error(
        "Profile update error:",
        error
      )

      showToast(
  "Unable to connect to server. Make sure your Server is running.",
  "error"
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
     showToast("Student profile not found.", "error")
      return
    }

    try {

      setViewingProfileLoading(true)
      setViewingProfile(null)

      const response = await fetch(
        (`${API_URL}/api/users/${userId}`)
      )

      const data = await response.json()

      if (!response.ok) {
       showToast(
  data.message ||
  "Unable to load profile.",
  "error"
)
        return
      }

      setViewingProfile(data.user)

    } catch (error) {

      console.error(
        "View profile error:",
        error
      )

      showToast(
  "Unable to connect to server. Make sure your Server is running.",
  "error"
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
      showToast("Please login first.", "error")

    return
  }

  if (!projectForm.title.trim()) {
 showToast("Please enter project title.", "error")    
 return
  }

  if (!projectForm.description.trim()) {
      showToast("Please enter project description.", "error")

    return
  }

  const skills = projectForm.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)

  if (skills.length === 0) {
    showToast("Please enter at least one skill.", "warning")
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
      showToast(
        data.message ||
        "Unable to add project."
      , "error")
      return
    }

    showToast(
      data.message ||
      "Project added successfully."
    , "success")

  
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

    showToast(
      "Unable to add project. Please try again."
    , "error")
  }
}

  // =========================================================
  // ADD QUERY
  // =========================================================

  const handleAddQuery = async () => {
    const queryText = (queryForm.text || "").trim()

    if (!queryText) {
      showToast("Please enter your query.", "warning")
      return
    }

    const userId =
      currentUser?._id || currentUser?.id

    if (!userId) {
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to add query.", "error")
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

      showToast("Query posted successfully!", "success")
      await fetchUnreadNotificationCount()
    } catch (error) {
      console.error("Query add error:", error)
      showToast("Unable to connect to server. Make sure your Server is running.", "error")
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
        showToast(data.message || "Unable to fetch answers.", "error")
      }
    } catch (error) {
      console.error("Answers fetch error:", error)
      showToast("Unable to connect to server.", "error")
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
      showToast("Please enter an answer.", "warning")
      return
    }

    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to add answer.", "error")
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
      showToast("Unable to connect to server. Make sure your Server is running.", "error")
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
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to delete answer.", "error")
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
      showToast("Unable to connect to server.", "error")
    }
  }

  const handleSaveAnswer = async (answerId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to save answer.", "error")
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
      showToast("Unable to connect to server.", "error")
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
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to remove saved answer.", "error")
        return
      }

      setSavedAnswers((previous) =>
        previous.filter(
          (item) => String(item.answer?._id || item.answer) !== String(answerId)
        )
      )
    } catch (error) {
      console.error("Unsave answer error:", error)
      showToast("Unable to connect to server.", "error")
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
      showToast("Please select a query to delete.", "warning")
      return
    }

    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      showToast("Please login again.", "warning")
      return
    }

    const selectedQuery = queries.find(
      (query) => String(query._id) === String(selectedDeleteQuery)
    )

    if (!selectedQuery) {
      showToast("Selected query not found.", "warning")
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
        showToast(data.message || "Unable to delete query.", "error")
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

      showToast("Query deleted successfully!", "success")
    } catch (error) {
      console.error("Delete query error:", error)
      showToast("Unable to connect to server.", "error")
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
const fetchNotificationSettings = async () => {
  try {
    setNotificationSettingsLoading(true)

    const response = await fetch(
      `${API_URL}/api/settings/notifications`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to load notification settings.",
        "error"
      )
      return
    }

    if (data.settings) {
      setNotificationSettings({
        connectRequests:
          data.settings.connectRequests ?? true,

        requestAccepted:
          data.settings.requestAccepted ?? true,

        studyMaterial:
          data.settings.studyMaterial ?? true,

          chatMessages:
        data.settings.chatMessages ?? true,

        queries:
          data.settings.queries ?? true,

        projectUpdates:
          data.settings.projectUpdates ?? true,

        importantWebsiteUpdates:
          data.settings.importantWebsiteUpdates ?? true,

        muteAll:
          data.settings.muteAll ?? false,
      })
    }
  } catch (error) {
    console.error(
      "Notification settings fetch error:",
      error
    )
  } finally {
    setNotificationSettingsLoading(false)
  }
}
const handleNotificationSettingChange = async (
  settingName,
  value
) => {
  const previousSettings =
    notificationSettings

  const updatedSettings = {
    ...previousSettings,
    [settingName]: value,
  }

  setNotificationSettings(
    updatedSettings
  )

  try {
    setNotificationSettingsSaving(true)

    const response = await fetch(
      `${API_URL}/api/settings/notifications`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
        body: JSON.stringify({
          [settingName]: value,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setNotificationSettings(
        previousSettings
      )

      showToast(
        data.message ||
          "Unable to save notification setting.",
        "error"
      )

      return
    }

    if (data.settings) {
      setNotificationSettings({
        connectRequests:
          data.settings.connectRequests ?? true,

        requestAccepted:
          data.settings.requestAccepted ?? true,

        studyMaterial:
          data.settings.studyMaterial ?? true,

          chatMessages:
       data.settings.chatMessages ?? true,

        queries:
          data.settings.queries ?? true,

        projectUpdates:
          data.settings.projectUpdates ?? true,

        importantWebsiteUpdates:
          data.settings
            .importantWebsiteUpdates ?? true,

        muteAll:
          data.settings.muteAll ?? false,
      })
    }
  } catch (error) {
    console.error(
      "Notification setting update error:",
      error
    )

    setNotificationSettings(
      previousSettings
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setNotificationSettingsSaving(false)
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
    await fetchConnections()
    await fetchNotifications()
  }
}
useEffect(() => {
  const handleOutsideNotificationClick = (event) => {
    if (
      showNotifications &&
      notificationRef.current &&
      !notificationRef.current.contains(event.target)
    ) {
      setShowNotifications(false)
    }
  }

  document.addEventListener(
    "mousedown",
    handleOutsideNotificationClick
  )

  return () => {
    document.removeEventListener(
      "mousedown",
      handleOutsideNotificationClick
    )
  }
}, [showNotifications])


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
    showToast("Please login again.", "warning")
    return
  }

  if (!materialForm.title.trim()) {
    showToast("Please enter a material title.", "warning")
    return
  }

  if (!materialForm.file) {
    showToast("Please select a study material file.", "warning")
    return
  }

  try {
    setMaterialUploading(true)

    // =========================================================
    // STEP 1 — UPLOAD MATERIAL
    // =========================================================

    const formData = new FormData()

    formData.append(
      "title",
      materialForm.title.trim()
    )

    formData.append(
      "description",
      materialForm.description.trim()
    )

    formData.append(
      "category",
      materialForm.category
    )

    formData.append(
      "file",
      materialForm.file
    )

    const response = await fetch(
      `${API_URL}/api/study-materials`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to upload material.",
        "error"
      )

      return
    }

    // =========================================================
    // STEP 2 — SAVE MATERIAL IN FRONTEND
    // =========================================================

    setStudyMaterials((previous) => [
      data.material,
      ...previous,
    ])

    const materialId =
      data.material?._id

    if (!materialId) {
      throw new Error(
        "Material uploaded but material ID was not returned."
      )
    }

    // =========================================================
    // STEP 3 — AI ANALYSIS
    // =========================================================

    showToast(
      "Material uploaded. AI is analyzing it...",
      "success"
    )

    const analysisResponse =
      await fetch(
        `${API_URL}/api/smarty-study/analyze/${materialId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "collegeConnectToken"
            )}`,
          },
        }
      )

    const analysisData =
      await analysisResponse.json()

    if (!analysisResponse.ok) {
      throw new Error(
        analysisData.message ||
          "AI analysis failed."
      )
    }

    // =========================================================
    // STEP 4 — SAVE COMPLETE AI RESULT
    // =========================================================

    if (
      !analysisData.smartyStudy
    ) {
      throw new Error(
        "AI analysis completed but study data was not returned."
      )
    }

    setSmartyStudy(
      analysisData.smartyStudy
    )

    setSmartyStudyView("dashboard")
    setSmartyLearningView("dashboard")

    // =========================================================
    // STEP 5 — RESET SELECTED TOPIC
    // =========================================================

    setSmartySelectedTopicIndex(0)

    // =========================================================
    // STEP 6 — OPEN SMARTY STUDY DASHBOARD
    // =========================================================

    setSmartyLearningView(
      "dashboard"
    )

    // =========================================================
    // STEP 7 — CLEAR OLD CARD STATE
    // =========================================================

    setSmartyActiveCard(null)

    setSmartyCardError("")

    setSmartyMockTestAnswers({})
    setSmartyMockTestSubmitted(false)
    setSmartyMockTestScore(null)

    setSmartyBossAnswers({})
    setSmartyBossSubmitted(false)
    setSmartyBossScore(null)

    setSmartySocraticAnswer("")
    setSmartySocraticSubmitted(false)

    setSmartyQuestStep(0)
    setSmartyQuestAnswer("")
    setSmartyQuestSubmitted(false)

    setSmartyMistakeAnswer("")
    setSmartyMistakeSubmitted(false)

    setSmartyScenarioAnswer("")
    setSmartyScenarioSubmitted(false)

    setSmartyTeachBackTopicIndex(null)
    setSmartyTeachBackAnswer("")
    setSmartyTeachBackSubmitted(false)
    setSmartyTeachBackEvaluation(null)
    setSmartyTeachBackError("")

    setSmartySpacedIndex(0)
    setSmartySpacedAnswer("")
    setSmartySpacedSubmitted(false)

    // =========================================================
    // STEP 8 — SUCCESS
    // =========================================================

    showToast(
      "Smarty Study analysis completed!",
      "success"
    )

    // =========================================================
    // STEP 9 — RESET UPLOAD FORM
    // =========================================================

    setMaterialForm({
      title: "",
      description: "",
      category: "Notes",
      file: null,
    })

    setShowUploadMaterial(false)

    const fileInput =
      document.getElementById(
        "study-material-file-input"
      )

    if (fileInput) {
      fileInput.value = ""
    }

  } catch (error) {

    console.error(
      "Study material upload / Smarty Study error:",
      error
    )

    showToast(
      error.message ||
        "Unable to connect to server.",
      "error"
    )

  } finally {

    setMaterialUploading(false)

  }
}

  const handleDeleteMaterial = async (materialId) => {
    const userId = currentUser?._id || currentUser?.id

    if (!userId) {
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to delete material.", "error")
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
      showToast("Unable to connect to server.", "error")
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
      showToast("Please login again.", "warning")
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
        showToast(data.message || "Unable to send connection request.", "error")
        return
      }

      showToast(data.message || "Connection request sent.", "success")
    } catch (error) {
      console.error("Connection error:", error)
      showToast("Unable to connect to server.", "error")
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

    setConnections(
  Array.isArray(data)
    ? data
    : data.connections || []
)
  } catch (error) {
    console.error("Connections fetch error:", error)
  } finally {
    setConnectionsLoading(false)
  }
}
const getStudentConnectionStatus = (studentId) => {
  const connection = connections.find((item) => {
    const requesterId =
      item.requester?._id || item.requester

    const recipientId =
      item.recipient?._id || item.recipient

    return (
      String(requesterId) === String(studentId) ||
      String(recipientId) === String(studentId)
    )
  })

  if (!connection) {
    return "none"
  }

  if (connection.status === "accepted") {
    return "accepted"
  }

  if (connection.status === "pending") {
    return "pending"
  }

  return "none"
}
const fetchBlockedStudents = async (studentList = students) => {
  if (!studentList || studentList.length === 0) {
    setBlockedStudentIds([])
    return
  }

  try {
    const token = localStorage.getItem(
      "collegeConnectToken"
    )

    const blockedIds = []

    for (const student of studentList) {
      const studentId =
        student._id || student.id

      const response = await fetch(
        `${API_URL}/api/blocks/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (response.ok && data.isBlocked) {
        blockedIds.push(String(studentId))
      }
    }

    setBlockedStudentIds(blockedIds)
  } catch (error) {
    console.error(
      "Blocked students fetch error:",
      error
    )
  }
}
// ======================================================
// ACCEPT CONNECTION REQUEST
// ======================================================

const handleAcceptConnection = async (connectionId) => {
  if (!connectionId) {
    showToast("Connection request not found.", "warning")
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
      showToast(data.message || "Unable to accept connection.", "error")
      return
    }

    showToast("Connection accepted.", "success")
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

    showToast("Unable to connect to server.", "error")
  }
}


// ======================================================
// REJECT CONNECTION REQUEST
// ======================================================

const handleRejectConnection = async (connectionId) => {
  if (!connectionId) {
    showToast("Connection request not found.", "warning")
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
      showToast(data.message || "Unable to reject connection.", "error")
      return
    }

    showToast("Connection request rejected.", "success")
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

    showToast("Unable to connect to server.", "error")
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
      showToast(data.message || "Unable to load chat.", "error")
      return
    }

    setChatMessages(data.messages || [])
  } catch (error) {
    console.error("Load chat error:", error)
    showToast("Unable to connect to server.", "error")
  } finally {
    setChatLoading(false)
  }
}

// ======================================================
// CHECK BLOCK STATUS
// ======================================================

const fetchBlockStatus = async () => {
  const studentId =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!studentId) {
    return
  }

  try {
    const response = await fetch(
      `${API_URL}/api/blocks/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return
    }

    setIsStudentBlocked(Boolean(data.isBlocked))
  } catch (error) {
    console.error("Check block status error:", error)
  }
}


// ======================================================
// BLOCK STUDENT
// ======================================================

const handleBlockStudent = async () => {
  const studentId =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!studentId) {
    return
  }

  try {
    setBlockLoading(true)

    const response = await fetch(
      `${API_URL}/api/blocks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
        body: JSON.stringify({
          blocked: studentId,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message || "Unable to block student.",
        "error"
      )
      return
    }

    setIsStudentBlocked(true)
    setChatMenuOpen(false)

    showToast("Student blocked.", "success")
  } catch (error) {
    console.error("Block student error:", error)

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setBlockLoading(false)
  }
}


// ======================================================
// UNBLOCK STUDENT
// ======================================================

const handleUnblockStudent = async () => {
  const studentId =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!studentId) {
    return
  }

  try {
    setBlockLoading(true)

    const response = await fetch(
      `${API_URL}/api/blocks/${studentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message || "Unable to unblock student.",
        "error"
      )
      return
    }

    setIsStudentBlocked(false)

    showToast("Student unblocked.", "success")
  } catch (error) {
    console.error("Unblock student error:", error)

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setBlockLoading(false)
  }
}
// ======================================================
// SEND PRIVATE CHAT MESSAGE
// ======================================================

const handleSendMessage = async () => {
  if (isStudentBlocked) {
  return
}
  const sender =
    currentUser?._id ||
    currentUser?.id

  const receiver =
    activeChatConnection?.otherUser?._id ||
    activeChatConnection?.otherUser?.id

  if (!sender || !receiver) {
    showToast("Chat connection not found.", "warning")
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
      showToast(data.message || "Unable to send message.", "error")
      return
    }

    setChatMessages((previous) => [
      ...previous,
      data.message,
    ])

    setChatText("")
  } catch (error) {
    console.error("Send message error:", error)
    showToast("Unable to connect to server.", "error")
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
    fetchBlockStatus()
  }, 0)

  return () => clearTimeout(timeoutId)
// eslint-disable-next-line react-hooks/exhaustive-deps
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
  const connection = notification.relatedId
    ? connections.find(
        (item) =>
          String(item._id) === String(notification.relatedId)
      )
    : null

  const isIncomingPendingConnection =
    notification.type === "connection" &&
    connection &&
    connection.status === "pending" &&
    String(
      connection.recipient?._id ||
      connection.recipient
    ) === String(
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
          : notification.type === "connection-accepted"
          ? "✅"
          : notification.type === "connection-rejected"
          ? "❌"
          : notification.type === "project"
          ? "💻"
          : notification.type === "study-material"
          ? "📚"
          : notification.type === "query"
          ? "❓"
          : notification.type === "chat"
          ? "💬"
          : "🔔"}
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

      {/* ACCEPT / REJECT */}
      {isIncomingPendingConnection && (
        <div
          className="notification-connection-actions"
          onClick={(e) => e.stopPropagation()}
        >

          <button
            type="button"
            className="notification-accept-button"
            onClick={() =>
              handleAcceptConnection(notification.relatedId)
            }
          >
            Accept
          </button>

          <button
            type="button"
            className="notification-reject-button"
            onClick={() =>
              handleRejectConnection(notification.relatedId)
            }
          >
            Reject
          </button>

        </div>
      )}

      {/* CHAT */}
      {isAcceptedConnection && connection && (
        <div
          className="notification-connection-actions"
          onClick={(e) => e.stopPropagation()}
        >

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
                showToast(
                  "Student information not found.",
                  "warning"
                )
                return
              }

              setActiveChatConnection({
                ...connection,
                otherUser,
              })

              setShowNotifications(false)
              setPage("chat")
            }}
          >
            💬 Chat
          </button>

        </div>
      )}

    </div>
  )
})
    )}
  </>
)
const handleUnsendMessage = async (messageId) => {
  if (!messageId) return

  try {
    setUnsendingMessageId(messageId)

    const response = await fetch(
      `${API_URL}/api/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "collegeConnectToken"
          )}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      showToast(
        data.message ||
          "Unable to unsend message.",
        "error"
      )
      return
    }

    // Remove immediately from current chat
    setChatMessages((previousMessages) =>
      previousMessages.filter(
        (message) =>
          String(message._id) !==
          String(messageId)
      )
    )

    setMessageMenuId(null)

    showToast(
      "Message unsent.",
      "success"
    )
  } catch (error) {
    console.error(
      "Unsend message error:",
      error
    )

    showToast(
      "Unable to connect to server.",
      "error"
    )
  } finally {
    setUnsendingMessageId(null)
  }
}

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
      Authorization: `Bearer ${localStorage.getItem(
        "collegeConnectToken"
      )}`,
    },
  }
)

        const data = await response.json()
if (response.ok) {
  setStudents(data.students)
  await fetchBlockedStudents(data.students)
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (page !== "studyHub" || !currentUser) return

    const loadTimer = window.setTimeout(() => {
      void fetchStudyMaterials()
    }, 0)

    return () => window.clearTimeout(loadTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, currentUser?._id, currentUser?.id])

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

  fetchConnections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser?._id, currentUser?.id])
useEffect(() => {
  let settingsLoadTimer

  if (
    page === "settings" &&
    settingsSection === "notifications" &&
    currentUser
  ) {
    settingsLoadTimer = window.setTimeout(() => {
      void fetchNotificationSettings()
    }, 0)
  }

  return () => window.clearTimeout(settingsLoadTimer)

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  page,
  settingsSection,
  currentUser,
])
  
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
        showToast("Account created successfully!", "success")

        setRegisterName("")
        setRegisterEmail("")
        setRegisterPassword("")
        setRegisterLevel("UG")
        setRegisterDegree("")
        setRegisterYear("")
        setRegisterMessage("")

        localStorage.setItem("collegeConnectToken", data.token)
localStorage.setItem(
  "collegeConnectUser",
  JSON.stringify(data.user)
)

setCurrentUser(data.user)
setPage("dashboard")
setShowIntro(false)
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

      showToast(
  "Login successful!",
  "success"
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
        {renderToast()}

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
        {renderToast()}

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
              setForgotPasswordSource("login")
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
        {renderToast()}

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

    if (forgotPasswordSource === "settings") {
      setPage("settings")
      setSettingsSection("account")
    } else {
      setPage("login")
    }

  }}
>
  {forgotPasswordSource === "settings"
    ? "← Back to Account Settings"
    : "← Back to Login"}
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
        {renderToast()}

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
          
          </div>

        </header>

        <main className="dashboard-main">

          <section className="dashboard-welcome-section">

            <div className="welcome-text">

              <span className="welcome-small-text">
                COLLEGE NETWORK
              </span>

             <h1>
  Welcome, {currentUser?.name || "Student"} 👋
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

                    {(() => {
  const connectionStatus =
    getStudentConnectionStatus(student._id)
    const isBlocked =
  blockedStudentIds.includes(
    String(student._id)
  )

  if (connectionStatus === "accepted" && !isBlocked) {
    return (
      <button
        className="student-connect-button"
        type="button"
        onClick={() => {
          setActiveChatConnection({
            otherUser: student,
          })
          setChatMessages([])
          setChatText("")
          setPage("chat")
        }}
      >
        💬 Chat
      </button>
    )
  }

  return (
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
  )
})()}

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
        {renderToast()}

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
        {renderToast()}

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

  <button
    type="button"
    className="profile-settings-button"
    onClick={() => setPage("settings")}
    title="Settings"
  >
    <span className="settings-gear" title="Settings">⚙️</span>
  </button>

</div>

        </header>

        <main className="dashboard-main">

          <section className="profile-page-card">

            {/* PROFILE HEADER */}
            {!isEditingProfile && (

            <div className="profile-main-header">

             <div className="profile-large-avatar">

  {currentUser?.profilePhoto ? (
    <img
      src={currentUser.profilePhoto}
      alt={currentUser?.name || "Profile"}
      className="profile-avatar-image"
    />
  ) : (
    currentUser?.name
      ?.charAt(0)
      .toUpperCase()
  )}

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

)}
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
                <div className="edit-profile-photo">

 <div className="profile-large-avatar">
  {typeof profileForm.profilePhoto === "string" &&
  profileForm.profilePhoto.trim() !== "" ? (
    <img
      src={profileForm.profilePhoto}
      alt="Profile"
      className="profile-avatar-image"
    />
  ) : (
    currentUser?.name
      ?.charAt(0)
      .toUpperCase()
  )}
</div>

  <div className="profile-photo-picker">

  <button
    type="button"
    className="profile-photo-add-button"
    onClick={() => {
      const isMobile =
        /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

      if (isMobile) {
        const choice = window.prompt(
          "Choose an option:\n\n1. Add from Gallery\n2. Take Photo"
        )

        if (choice === "1") {
          document
            .getElementById("gallery-photo-input")
            ?.click()
        }

        if (choice === "2") {
          document
            .getElementById("camera-photo-input")
            ?.click()
        }
      } else {
        document
          .getElementById("upload-photo-input")
          ?.click()
      }
    }}
  >
    +
  </button>
 {typeof profileForm.profilePhoto === "string" &&
  profileForm.profilePhoto.trim() !== "" && (
    <button
      type="button"
      className="profile-photo-remove-button"
      onClick={() => {
        setProfileForm({
          ...profileForm,
          profilePhoto: "",
        })
      }}
    >
      ✕ Remove Photo
    </button>
  )}

  {/* Gallery / PC Upload */}
  <input
    id="gallery-photo-input"
    type="file"
    accept="image/*"
    hidden
    onChange={(e) => {
      const file = e.target.files?.[0]

      if (!file) return

const previewUrl = URL.createObjectURL(file)

setPhotoPreview(previewUrl)
setPhotoZoom(1)
setPhotoPosition({
  x: 0,
  y: 0,
})
setShowPhotoCropper(true)
    }}
  />

  {/* Mobile Camera */}
  <input
    id="camera-photo-input"
    type="file"
    accept="image/*"
    capture="user"
    hidden
    onChange={(e) => {
      const file = e.target.files?.[0]

      if (!file) return

const previewUrl = URL.createObjectURL(file)

setPhotoPreview(previewUrl)
setPhotoZoom(1)
setPhotoPosition({
  x: 0,
  y: 0,
})
setShowPhotoCropper(true)
    }}
  />

  {/* PC Upload */}
  <input
    id="upload-photo-input"
    type="file"
    accept="image/*"
    hidden
    onChange={(e) => {
      const file = e.target.files?.[0]

      if (!file) return

const previewUrl = URL.createObjectURL(file)

setPhotoPreview(previewUrl)
setPhotoZoom(1)
setPhotoPosition({
  x: 0,
  y: 0,
})
setShowPhotoCropper(true)
    }}
  />
{showPhotoCropper && (
  <div className="photo-cropper-overlay">
    <div className="photo-cropper-box">

      <h3>Adjust Profile Photo</h3>

      <div
  className="photo-cropper-preview"
  onPointerDown={(e) => {
    e.currentTarget.setPointerCapture(e.pointerId)

    photoDragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: photoPosition.x,
      initialY: photoPosition.y,
    }
  }}
  onPointerMove={(e) => {
    if (!photoDragRef.current.dragging) return

    const moveX =
      e.clientX - photoDragRef.current.startX

    const moveY =
      e.clientY - photoDragRef.current.startY

    setPhotoPosition({
      x: photoDragRef.current.initialX + moveX,
      y: photoDragRef.current.initialY + moveY,
    })
  }}
  onPointerUp={() => {
    photoDragRef.current.dragging = false
  }}
  onPointerCancel={() => {
    photoDragRef.current.dragging = false
  }}
>
  <img
    src={photoPreview}
    alt="Adjust profile"
    draggable="false"
    style={{
      transform: `
        translate(
          ${photoPosition.x}px,
          ${photoPosition.y}px
        )
        scale(${photoZoom})
      `,
    }}
  />
</div>

      <div className="photo-cropper-controls">
        <label>Zoom</label>

        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={photoZoom}
          onChange={(e) =>
            setPhotoZoom(Number(e.target.value))
          }
        />
      </div>

      <div className="photo-cropper-actions">
        <button
          type="button"
          onClick={() => setShowPhotoCropper(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => {
            setProfileForm({
              ...profileForm,
              profilePhoto: photoPreview,
            })
            setShowPhotoCropper(false)
          }}
        >
          Use Photo
        </button>
      </div>

    </div>
  </div>
)}
</div>

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
  className="save-profile-button"
  onClick={handleSaveProfile}
  disabled={profileSaving}
>
  {profileSaving ? "Saving..." : "Save Changes"}
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
// SETTINGS PAGE
// =========================================================

if (page === "settings") {

  // =======================================================
  // MAIN SETTINGS PAGE
  // =======================================================

  if (settingsSection === null) {

    return (
      <div className="dashboard-page">

        {renderToast()}

        <header className="dashboard-header">

          <div className="dashboard-brand">

            <img
              src={collegeConnectLogo}
              alt="College Connect"
              className="dashboard-logo-image"
            />

          </div>



          <div className="dashboard-header-right">
          </div>

        </header>


        <main className="dashboard-main">

          <section className="settings-page-card">

            <div className="settings-page-header">

              <button
                type="button"
                className="settings-back-button"
                onClick={() =>
                  setPage("profile")
                }
              >
                ←
              </button>


              <h1>
                Settings
              </h1>

            </div>


            <div className="settings-category-list">

              {/* ACCOUNT SETTINGS */}

              <button
                type="button"
                className="settings-category-card"
                onClick={() =>
                  setSettingsSection("account")
                }
              >

                <span className="settings-category-icon">
                  👤
                </span>

                <span className="settings-category-name">
                  Account Settings
                </span>

              </button>


              {/* NOTIFICATION SETTINGS */}

              <button
                type="button"
                className="settings-category-card"
                onClick={() =>
                  setSettingsSection("notifications")
                }
              >

                <span className="settings-category-icon">
                  🔔
                </span>

                <span className="settings-category-name">
                  Notification Settings
                </span>

              </button>


              {/* ACCOUNT ACTIONS */}

              <button
                type="button"
                className="settings-category-card"
                onClick={() =>
                  setSettingsSection("actions")
                }
              >

                <span className="settings-category-icon">
                  ⚡
                </span>

                <span className="settings-category-name">
                  Account Actions
                </span>

              </button>

            </div>

          </section>

        </main>

      </div>
    )
  }


  // =======================================================
  // ACCOUNT SETTINGS PAGE
  // =======================================================

  if (settingsSection === "account") {

    return (
      <div className="dashboard-page">

        {renderToast()}

        <header className="dashboard-header">

          <div className="dashboard-brand">

            <img
              src={collegeConnectLogo}
              alt="College Connect"
              className="dashboard-logo-image"
            />

          </div>


          <div className="dashboard-header-right">
          </div>

        </header>


        <main className="dashboard-main">

          <section className="settings-page-card">

            <div className="settings-page-header">

              <button
                type="button"
                className="settings-back-button"
                onClick={() =>
                  setSettingsSection(null)
                }
              >
                ←
              </button>


              <h1>
                Account Settings
              </h1>

            </div>


            <div className="settings-category-list">

  {/* CHANGE EMAIL */}

  <button
    type="button"
    className="settings-option-card"
    onClick={() => {
      setChangeEmailForm({
        currentPassword: "",
        newEmail: "",
      })

      setShowChangeEmail(true)
    }}
  >

    <span className="settings-option-icon">
      ✉️
    </span>

    <span className="settings-option-name">
      Change Email
    </span>

  </button>


  {/* CHANGE PASSWORD */}

  <button
    type="button"
    className="settings-option-card"
    onClick={() => {
      setChangePasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setShowChangePassword(true)
    }}
  >

    <span className="settings-option-icon">
      🔒
    </span>

    <span className="settings-option-name">
      Change Password
    </span>

  </button>

</div>

          </section>
          {/* CHANGE EMAIL MODAL */}

{showChangeEmail && (
  <div className="settings-modal-overlay">

    <div className="settings-modal">

      <div className="settings-modal-header">

        <h3>
          Change Email
        </h3>

        <button
          type="button"
          className="settings-modal-close"
          onClick={() => {
            if (!accountSettingsSaving) {
              setShowChangeEmail(false)
            }
          }}
        >
          ×
        </button>

      </div>


      <div className="settings-form">

        <label>
          Current Password
        </label>

        <input
          type="password"
          value={
            changeEmailForm.currentPassword
          }
          onChange={(e) =>
            setChangeEmailForm(
              (previous) => ({
                ...previous,
                currentPassword:
                  e.target.value,
              })
            )
          }
          placeholder="Enter current password"
          disabled={accountSettingsSaving}
        />


        <label>
          New Email
        </label>

        <input
          type="email"
          value={
            changeEmailForm.newEmail
          }
          onChange={(e) =>
            setChangeEmailForm(
              (previous) => ({
                ...previous,
                newEmail:
                  e.target.value,
              })
            )
          }
          placeholder="Enter new email"
          disabled={accountSettingsSaving}
        />


        <button
          type="button"
          className="settings-save-button"
          onClick={handleChangeEmail}
          disabled={accountSettingsSaving}
        >
          {accountSettingsSaving
            ? "Saving..."
            : "Change Email"}
        </button>

      </div>

    </div>

  </div>
)}
{/* CHANGE PASSWORD MODAL */}

{showChangePassword && (
  <div className="settings-modal-overlay">

    <div className="settings-modal">

      <div className="settings-modal-header">

        <h3>
          Change Password
        </h3>

        <button
          type="button"
          className="settings-modal-close"
          onClick={() => {
            if (!accountSettingsSaving) {
              setShowChangePassword(false)
            }
          }}
        >
          ×
        </button>

      </div>


      <div className="settings-form">

        <label>
  Current Password
</label>

<input
  type="password"
  value={
    changePasswordForm.currentPassword
  }
  onChange={(e) =>
    setChangePasswordForm(
      (previous) => ({
        ...previous,
        currentPassword:
          e.target.value,
      })
    )
  }
  placeholder="Enter current password"
  disabled={accountSettingsSaving}
/>


<label>
  New Password
</label>
        <input
          type="password"
          value={
            changePasswordForm.newPassword
          }
          onChange={(e) =>
            setChangePasswordForm(
              (previous) => ({
                ...previous,
                newPassword:
                  e.target.value,
              })
            )
          }
          placeholder="Minimum 6 characters"
          disabled={accountSettingsSaving}
        />


        <label>
          Confirm New Password
        </label>

        <input
          type="password"
          value={
            changePasswordForm.confirmPassword
          }
          onChange={(e) =>
            setChangePasswordForm(
              (previous) => ({
                ...previous,
                confirmPassword:
                  e.target.value,
              })
            )
          }
          placeholder="Re-enter new password"
          disabled={accountSettingsSaving}
        />
        <button
  type="button"
  className="settings-forgot-password-button"
  onClick={() => {
  if (!accountSettingsSaving) {
    setShowChangePassword(false)
    setForgotEmail("")
    setForgotMessage("")
    setResendCountdown(0)
    setForgotPasswordSource("settings")
    setPage("forgot")
  }
}}
  disabled={accountSettingsSaving}
>
  Forgot Password?
</button>



        <button
          type="button"
          className="settings-save-button"
          onClick={handleChangePassword}
          disabled={accountSettingsSaving}
        >
          {accountSettingsSaving
            ? "Saving..."
            : "Change Password"}
        </button>

      </div>

    </div>

  </div>
)}

        </main>

      </div>
    )
  }


  // =======================================================
  // NOTIFICATION SETTINGS PAGE
  // =======================================================

  if (settingsSection === "notifications") {

    return (
      <div className="dashboard-page">

        {renderToast()}

        <header className="dashboard-header">

          <div className="dashboard-brand">

            <img
              src={collegeConnectLogo}
              alt="College Connect"
              className="dashboard-logo-image"
            />

          </div>




          <div className="dashboard-header-right">
          </div>

        </header>


        <main className="dashboard-main">

          <section className="settings-page-card">

            <div className="settings-page-header">

              <button
                type="button"
                className="settings-back-button"
                onClick={() =>
                  setSettingsSection(null)
                }
              >
                ←
              </button>


              <h1>
                Notification Settings
              </h1>

            </div>


            <div className="settings-toggle-list">

  <div className="settings-toggle-row">
    <span>
      Connect Requests
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.connectRequests}
      onChange={(e) =>
        handleNotificationSettingChange(
          "connectRequests",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>


  <div className="settings-toggle-row">
    <span>
      Request Accepted
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.requestAccepted}
      onChange={(e) =>
        handleNotificationSettingChange(
          "requestAccepted",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>


  <div className="settings-toggle-row">
    <span>
      New Notes / Study Material
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.studyMaterial}
      onChange={(e) =>
        handleNotificationSettingChange(
          "studyMaterial",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>
  
<div className="settings-toggle-row">
  <span>Chat Messages</span>

  <input
    type="checkbox"
    checked={notificationSettings.chatMessages}
    onChange={(e) =>
      handleNotificationSettingChange(
        "chatMessages",
        e.target.checked
      )
    }
    disabled={
      notificationSettingsLoading ||
      notificationSettingsSaving
    }
  />
</div>


  <div className="settings-toggle-row">
    <span>
      Queries
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.queries}
      onChange={(e) =>
        handleNotificationSettingChange(
          "queries",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>


  <div className="settings-toggle-row">
    <span>
      Project Updates
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.projectUpdates}
      onChange={(e) =>
        handleNotificationSettingChange(
          "projectUpdates",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>


  <div className="settings-toggle-row">
    <span>
      Important Website Updates
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.importantWebsiteUpdates}
      onChange={(e) =>
        handleNotificationSettingChange(
          "importantWebsiteUpdates",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>


  <div className="settings-toggle-row mute-all-row">
    <span>
      Mute All Notifications
    </span>

    <input
      type="checkbox"
      checked={notificationSettings.muteAll}
      onChange={(e) =>
        handleNotificationSettingChange(
          "muteAll",
          e.target.checked
        )
      }
      disabled={
        notificationSettingsLoading ||
        notificationSettingsSaving
      }
    />
  </div>

</div>
          </section>

        </main>

      </div>
    )
  }


  // =======================================================
  // ACCOUNT ACTIONS PAGE
  // =======================================================

  if (settingsSection === "actions") {

    return (
      <div className="dashboard-page">

        {renderToast()}

        <header className="dashboard-header">

          <div className="dashboard-brand">

            <img
              src={collegeConnectLogo}
              alt="College Connect"
              className="dashboard-logo-image"
            />

          </div>

          <div className="dashboard-header-right">
          </div>

        </header>


        <main className="dashboard-main">

          <section className="settings-page-card">

            <div className="settings-page-header">

              <button
                type="button"
                className="settings-back-button"
                onClick={() =>
                  setSettingsSection(null)
                }
              >
                ←
              </button>


              <h1>
                Account Actions
              </h1>

            </div>


            <div className="settings-category-list">

  {/* LOGOUT */}
  <button
    type="button"
    className="settings-option-card"
    onClick={handleLogout}
  >
    <span className="settings-option-icon">
      🚪
    </span>

    <span className="settings-option-name">
      Logout
    </span>
  </button>


  {/* DEACTIVATE ACCOUNT */}
  <button
  type="button"
  className="settings-action-card deactivate-account-option"
  onClick={() => setShowDeactivateConfirm(true)}
>
    <span className="settings-option-icon">
      ⏸️
    </span>

    <span className="settings-option-name">
      Deactivate Account
    </span>
  </button>


  {/* DELETE ACCOUNT */}
  <button
  type="button"
  className="settings-action-card delete-account-option"
  onClick={() => setShowDeleteConfirm(true)}
>
    <span className="settings-option-icon">
      🗑️
    </span>

    <span className="settings-option-name">
      Delete Account
    </span>
  </button>

</div>
{showLogoutConfirm && (
  <div className="logout-confirm-overlay">
    <div className="logout-confirm-box">

      <div className="logout-confirm-icon">
        ↪
      </div>

      <h3>Logout</h3>

      <p>
        Are you sure you want to logout?
      </p>

      <div className="logout-confirm-actions">

        <button
          type="button"
          className="logout-cancel-btn"
          onClick={() => setShowLogoutConfirm(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="logout-confirm-btn"
          onClick={confirmLogout}
        >
          Logout
        </button>

      </div>

    </div>
  </div>
)}

{showDeactivateConfirm && (
  <div className="logout-confirm-overlay">
    <div className="logout-confirm-box">
      <div className="logout-confirm-icon">
        !
      </div>

      <h3>Deactivate Account</h3>

      <p>
        Are you sure you want to deactivate your account?
        <br />
        Your account will be hidden from other students.
        <br />
        You can reactivate it by logging in within 30 days.
         <br />
        After 30 days, your account will be permanently deleted.
      </p>

      <div className="logout-confirm-actions">
        <button
          type="button"
          className="logout-cancel-btn"
          onClick={() =>
            setShowDeactivateConfirm(false)
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="logout-confirm-btn"
          onClick={() => {
            setShowDeactivateConfirm(false)
            handleDeactivateAccount()
          }}
        >
          Deactivate
        </button>
      </div>
    </div>
  </div>
)}

{showDeleteConfirm && (
  <div className="logout-confirm-overlay">
    <div className="logout-confirm-box">
      <div className="logout-confirm-icon">
        !
      </div>

      <h3>Delete Account</h3>

      <p>
        Are you sure you want to permanently delete your account?
        <br />
        This action cannot be undone.
        <br />
        Your profile and account data will be permanently deleted.
      </p>

      <div className="logout-confirm-actions">
        <button
          type="button"
          className="logout-cancel-btn"
          onClick={() =>
            setShowDeleteConfirm(false)
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="logout-confirm-btn"
          onClick={() => {
            setShowDeleteConfirm(false)
            handleDeleteAccount()
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
          </section>

        </main>

      </div>
    )
  }

}

  
// =========================================================
// CHAT PAGE
// =========================================================

if (page === "chat") {
  const otherUser = activeChatConnection?.otherUser

  return (
    <div className="dashboard-page">
        {renderToast()}

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
<div className="chat-header-menu">

  <button
    type="button"
    className="chat-menu-button"
    onClick={() =>
      setChatMenuOpen((previous) => !previous)
    }
  >
    ⋮
  </button>

  {chatMenuOpen && (
    <div className="chat-menu-dropdown">

      {!isStudentBlocked && (
        <button
          type="button"
          className="chat-menu-item block-item"
          onClick={handleBlockStudent}
          disabled={blockLoading}
        >
          🚫 {blockLoading ? "Blocking..." : "Block Student"}
        </button>
      )}

    </div>
  )}

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

  const startLongPress = (event) => {
    if (!isMine) return

    if (longPressTimerRef.current) {
      clearTimeout(
        longPressTimerRef.current
      )
    }

    longPressTimerRef.current =
      setTimeout(() => {
        setMessageMenuId(message._id)

        const touch =
          event.touches?.[0]

        if (touch) {
          setMessageMenuPosition({
            x: touch.clientX,
            y: touch.clientY,
          })
        }
      }, 600)
  }

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(
        longPressTimerRef.current
      )

      longPressTimerRef.current = null
    }
  }

  const handleMessageRightClick = (event) => {
    if (!isMine) return

    event.preventDefault()

    setMessageMenuId(message._id)

    setMessageMenuPosition({
      x: event.clientX,
      y: event.clientY,
    })
  }

  return (
    <div
      key={message._id}
      className={`chat-message-row ${
        isMine
          ? "mine"
          : "theirs"
      }`}
    >

      <div
        className="chat-message-bubble"
        onContextMenu={
          handleMessageRightClick
        }
        onTouchStart={
          startLongPress
        }
        onTouchEnd={
          cancelLongPress
        }
        onTouchMove={
          cancelLongPress
        }
        onTouchCancel={
          cancelLongPress
        }
      >

        <p>
          {message.text}
        </p>

        <span>
          {formatAnswerTime(
            message.createdAt
          )}
        </span>

      </div>
      {messageMenuId && (
  <div
    className="chat-unsend-menu"
    style={{
      left: `${messageMenuPosition.x}px`,
      top: `${messageMenuPosition.y}px`,
    }}
  >
    <button
      type="button"
      onClick={() =>
        handleUnsendMessage(
          messageMenuId
        )
      }
      disabled={
        unsendingMessageId ===
        messageMenuId
      }
    >
      {unsendingMessageId ===
      messageMenuId
        ? "Unsending..."
        : "Unsend"}
    </button>
  </div>
)}

    </div>
  )
})

            )}

          </div>


          <div className="chat-input-area">

  {isStudentBlocked ? (

    <button
      type="button"
      className="chat-unblock-button"
      onClick={handleUnblockStudent}
      disabled={blockLoading}
    >
      {blockLoading
        ? "Unblocking..."
        : "Unblock Student"}
    </button>

  ) : (

    <>
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
    </>

  )}

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
        {renderToast()}

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
        {renderToast()}

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
        {renderToast()}
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
// SMARTY STUDY PAGE
// =========================================================

if (page === "smartyStudy") {
  if (smartyLearningView !== "dashboard") {
    const topics = Array.isArray(smartyStudy?.topics)
      ? smartyStudy.topics
      : []

    const goBackToSmarty = () => {
      setSmartyLearningView("dashboard")
      setSmartyTeachBackTopicIndex(null)
      setSmartyTeachBackAnswer("")
      setSmartyTeachBackSubmitted(false)
      setSmartyTeachBackEvaluation(null)
      setSmartyTeachBackError("")
    }

    const spacedCards =
      topics.flatMap((topic) =>
        Array.isArray(topic.flashcards)
          ? topic.flashcards.map((card) => ({
              ...card,
              topicTitle: topic.title,
            }))
          : []
      )

    return (
      <div className="smarty-study-page">
        {renderToast()}

        <header className="smarty-detail-header">
          <button
            className="smarty-back-button"
            type="button"
            onClick={goBackToSmarty}
          >
            ← Back to Smarty Study
          </button>

          <div className="smarty-detail-header-content">
            <span className="smarty-section-label">
              SMART LEARNING MODE
            </span>

            <h1>
              {smartyLearningView === "learn" && "Learn"}
              {smartyLearningView === "practice" && "Practice"}
              {smartyLearningView === "challenge" && "Challenge"}
              {smartyLearningView === "master" && "Master"}
              {smartyLearningView === "socratic" &&
                "Interactive Socratic Questioning"}
              {smartyLearningView === "teachBack" && "Teach Back Mode"}
              {smartyLearningView === "studyQuest" && "Study Quest"}
              {smartyLearningView === "findMistake" && "Find the Mistake"}
              {smartyLearningView === "realLife" && "Real-Life Scenario"}
              {smartyLearningView === "examAnswer" && "Exam Answer Mode"}
              {smartyLearningView === "examNight" && "Exam Night Mode"}
              {smartyLearningView === "spacedRepetition" &&
                "Spaced Repetition"}
              {smartyLearningView === "result" && "Your Learning Result"}
              {smartyLearningView === "masteryMap" && "Mastery Map"}
              {smartyLearningView === "bossBattle" && "Boss Battle"}
            </h1>

            <p>
              {smartyLearningView === "learn" &&
                "Understand concepts from your uploaded study material."}
              {smartyLearningView === "practice" &&
                "Practice using questions and activities from your material."}
              {smartyLearningView === "challenge" &&
                "Challenge your understanding using your actual study material."}
              {smartyLearningView === "master" &&
                "Strengthen your understanding through revision and practice."}
              {smartyLearningView === "socratic" &&
                "Think through questions instead of receiving the answer immediately."}
              {smartyLearningView === "teachBack" &&
                "Explain what you learned in your own words."}
              {smartyLearningView === "studyQuest" &&
                "Move through the learning journey using your actual study content."}
              {smartyLearningView === "findMistake" &&
                "Identify mistakes and understand the correct reasoning."}
              {smartyLearningView === "realLife" &&
                "Connect concepts from your material with practical situations."}
              {smartyLearningView === "examAnswer" &&
                "Prepare answers using the AI-generated exam structure."}
              {smartyLearningView === "examNight" &&
                "Focus your revision around the material you actually uploaded."}
              {smartyLearningView === "spacedRepetition" &&
                "Review concepts again using generated flashcards."}
              {smartyLearningView === "result" &&
                "Review your latest Teach Back evaluation."}
              {smartyLearningView === "masteryMap" &&
                "See which topics need attention based on your learning data."}
              {smartyLearningView === "bossBattle" &&
                "Finish with a mixed challenge generated from your material."}
            </p>
          </div>
        </header>

        <main className="smarty-detail-main">
          {!Array.isArray(topics) || topics.length === 0 ? (
            <div className="smarty-empty-state">
              <h3>No study content available yet</h3>
              <p>Upload and analyze your study material first.</p>
            </div>
          ) : (
            <>
              {/* LEARN */}
              {smartyLearningView === "learn" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">UNDERSTAND</span>
                    <h2>Learn</h2>
                    <p>
                      Understand concepts from your actual study material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {topic.summary && (
                          <div className="smarty-content-list">
                            <h4>Topic Summary</h4>
                            <p>{topic.summary}</p>
                          </div>
                        )}

                        {topic.simpleExplanation && (
                          <div className="smarty-content-list">
                            <h4>Simple Explanation</h4>
                            <p>{topic.simpleExplanation}</p>
                          </div>
                        )}

                        {Array.isArray(topic.importantPoints) &&
                          topic.importantPoints.length > 0 && (
                            <div className="smarty-content-list">
                              <h4>Important Points</h4>
                              <ul>
                                {topic.importantPoints.map((point, i) => (
                                  <li key={i}>
                                    {typeof point === "string"
                                      ? point
                                      : point.text ||
                                        point.point ||
                                        point.answer ||
                                        ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                        {Array.isArray(topic.shortAnswers) &&
                          topic.shortAnswers.length > 0 && (
                            <div className="smarty-content-list">
                              <h4>Short Answers</h4>
                              {topic.shortAnswers.map((item, i) => (
                                <div key={i} className="smarty-short-answer-item">
                                  <strong>
                                    {item?.question || `Question ${i + 1}`}
                                  </strong>
                                  <p>{item?.answer || ""}</p>
                                </div>
                              ))}
                            </div>
                          )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* PRACTICE */}
              {smartyLearningView === "practice" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">PRACTICE</span>
                    <h2>Practice</h2>
                    <p>
                      Practice questions and MCQs generated from your material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, topicIndex) => (
                      <article
                        key={topic._id || topicIndex}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(topicIndex + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.mcqs) &&
                          topic.mcqs.map((mcq, mcqIndex) => (
                            <div className="smarty-mcq-item" key={mcqIndex}>
                              <h4>{mcq.question}</h4>
                              {Array.isArray(mcq.options) &&
                                mcq.options.map((option, optionIndex) => (
                                  <div className="smarty-option" key={optionIndex}>
                                    <span>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    {typeof option === "string"
                                      ? option
                                      : option?.text ||
                                        option?.label ||
                                        option?.value ||
                                        ""}
                                  </div>
                                ))}
                              {mcq.explanation && (
                                <p>{mcq.explanation}</p>
                              )}
                            </div>
                          ))}

                        {Array.isArray(topic.questions) &&
                          topic.questions.length > 0 && (
                            <div className="smarty-content-list">
                              <h4>Written Questions</h4>
                              <ul>
                                {topic.questions.map((question, i) => (
                                  <li key={i}>
                                    {typeof question === "string"
                                      ? question
                                      : question?.question || ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* CHALLENGE */}
              {smartyLearningView === "challenge" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">CHALLENGE</span>
                    <h2>Challenge</h2>
                    <p>
                      Try harder questions and mixed activities from your
                      actual study material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          CHALLENGE {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.questions) &&
                          topic.questions.map((question, i) => (
                            <div className="smarty-content-list" key={i}>
                              <h4>Question {i + 1}</h4>
                              <p>
                                {typeof question === "string"
                                  ? question
                                  : question?.question || ""}
                              </p>
                              {typeof question === "object" &&
                                question?.answer && (
                                  <details>
                                    <summary>Show answer</summary>
                                    <p>{question.answer}</p>
                                  </details>
                                )}
                            </div>
                          ))}

                        {Array.isArray(topic.mcqs) &&
                          topic.mcqs.slice(0, 3).map((mcq, i) => (
                            <div className="smarty-content-list" key={`mcq-${i}`}>
                              <h4>Challenge MCQ</h4>
                              <p>{mcq.question}</p>
                              {mcq.explanation && <p>{mcq.explanation}</p>}
                            </div>
                          ))}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* MASTER */}
              {smartyLearningView === "master" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">MASTER</span>
                    <h2>Strengthen what you learned</h2>
                    <p>
                      Review summaries, key concepts and questions from your
                      uploaded study material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => {
                      const mastery =
                        smartyStudy?.mastery?.find(
                          (item) => item.topic === topic.title
                        ) || null

                      return (
                        <article
                          key={topic._id || index}
                          className="smarty-topic-card"
                        >
                          <span className="smarty-topic-number">
                            TOPIC {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3>{topic.title}</h3>

                          {mastery && (
                            <p>
                              Mastery: {mastery.status} • {mastery.score || 0}%
                            </p>
                          )}

                          {topic.summary && (
                            <div className="smarty-content-list">
                              <h4>Review</h4>
                              <p>{topic.summary}</p>
                            </div>
                          )}

                          {Array.isArray(topic.importantPoints) &&
                            topic.importantPoints.length > 0 && (
                              <div className="smarty-content-list">
                                <h4>Key Points</h4>
                                <ul>
                                  {topic.importantPoints.map((point, i) => (
                                    <li key={i}>
                                      {typeof point === "string"
                                        ? point
                                        : point.text ||
                                          point.point ||
                                          point.answer ||
                                          ""}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* SOCRATIC */}
              {smartyLearningView === "socratic" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">THINK</span>
                    <h2>Interactive Socratic Questioning</h2>
                    <p>
                      Think through counter-questions instead of receiving the
                      answer immediately.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.socratic) &&
                        topic.socratic.length > 0 ? (
                          topic.socratic.map((item, i) => (
                            <div className="smarty-content-list" key={i}>
                              <h4>Think about this</h4>
                              <p>{item.question}</p>
                              {item.expectedDirection && (
                                <details>
                                  <summary>Guidance</summary>
                                  <p>{item.expectedDirection}</p>
                                </details>
                              )}
                            </div>
                          ))
                        ) : (
                          <p>No Socratic questions were generated.</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* TEACH BACK */}
              {smartyLearningView === "teachBack" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">EXPLAIN</span>
                    <h2>Teach Back Mode</h2>
                    <p>Choose a topic and explain it in your own words.</p>
                  </div>

                  {smartyTeachBackTopicIndex === null ? (
                    <div className="smarty-topic-list">
                      {topics.map((topic, index) => (
                        <button
                          key={topic._id || index}
                          type="button"
                          className="smarty-topic-card smarty-topic-select-card"
                          onClick={() => {
                            setSmartyTeachBackTopicIndex(index)
                            setSmartyTeachBackAnswer("")
                            setSmartyTeachBackSubmitted(false)
                            setSmartyTeachBackEvaluation(null)
                            setSmartyTeachBackError("")
                          }}
                        >
                          <span className="smarty-topic-number">
                            TOPIC {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3>{topic.title}</h3>
                          {topic.summary && <p>{topic.summary}</p>}
                          <span className="smarty-topic-select-action">
                            Explain this topic →
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="smarty-teachback-answer-panel">
                      <div className="smarty-selected-topic-card">
                        <span className="smarty-section-label">
                          SELECTED TOPIC
                        </span>
                        <h3>
                          {topics[smartyTeachBackTopicIndex]?.title}
                        </h3>
                        {topics[smartyTeachBackTopicIndex]?.summary && (
                          <p>{topics[smartyTeachBackTopicIndex].summary}</p>
                        )}
                      </div>

                      <div className="smarty-teachback-input-card">
                        <label htmlFor="smarty-teachback-answer">
                          Explain this topic in your own words
                        </label>
                        <textarea
                          id="smarty-teachback-answer"
                          value={smartyTeachBackAnswer}
                          onChange={(event) => {
                            setSmartyTeachBackAnswer(event.target.value)
                            setSmartyTeachBackSubmitted(false)
                            setSmartyTeachBackEvaluation(null)
                            setSmartyTeachBackError("")
                          }}
                          placeholder="Explain what you understood from this topic..."
                          rows={8}
                          disabled={smartyTeachBackLoading}
                        />

                        <div className="smarty-teachback-actions">
                          <button
                            type="button"
                            className="smarty-secondary-button"
                            onClick={() => {
                              setSmartyTeachBackTopicIndex(null)
                              setSmartyTeachBackAnswer("")
                              setSmartyTeachBackSubmitted(false)
                              setSmartyTeachBackEvaluation(null)
                              setSmartyTeachBackError("")
                            }}
                          >
                            ← Choose Another Topic
                          </button>

                          <button
                            type="button"
                            className="smarty-primary-button"
                            onClick={submitSmartyTeachBack}
                            disabled={
                              smartyTeachBackLoading ||
                              !smartyTeachBackAnswer.trim()
                            }
                          >
                            {smartyTeachBackLoading
                              ? "Evaluating Your Explanation..."
                              : "Submit Explanation →"}
                          </button>
                        </div>

                        {smartyTeachBackError && (
                          <div className="smarty-error-card">
                            <strong>Unable to evaluate</strong>
                            <p>{smartyTeachBackError}</p>
                          </div>
                        )}
                      </div>

                      {smartyTeachBackSubmitted &&
                        smartyTeachBackEvaluation && (
                          <div className="smarty-teachback-evaluation">
                            {Array.isArray(
                              smartyTeachBackEvaluation.understood
                            ) &&
                              smartyTeachBackEvaluation.understood.length > 0 && (
                                <div className="smarty-evaluation-card">
                                  <div className="smarty-evaluation-icon">✓</div>
                                  <div>
                                    <h4>What You Understood</h4>
                                    <ul>
                                      {smartyTeachBackEvaluation.understood.map(
                                        (item, index) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}

                            {Array.isArray(smartyTeachBackEvaluation.missed) &&
                              smartyTeachBackEvaluation.missed.length > 0 && (
                                <div className="smarty-evaluation-card">
                                  <div className="smarty-evaluation-icon">!</div>
                                  <div>
                                    <h4>What You Missed</h4>
                                    <ul>
                                      {smartyTeachBackEvaluation.missed.map(
                                        (item, index) => (
                                          <li key={index}>{item}</li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}

                            {smartyTeachBackEvaluation.improvement && (
                              <div className="smarty-evaluation-card">
                                <div className="smarty-evaluation-icon">💡</div>
                                <div>
                                  <h4>How You Can Improve</h4>
                                  <p>
                                    {smartyTeachBackEvaluation.improvement}
                                  </p>
                                </div>
                              </div>
                            )}

                            {smartyTeachBackEvaluation.followUpQuestion && (
                              <div className="smarty-evaluation-card smarty-followup-card">
                                <div className="smarty-evaluation-icon">?</div>
                                <div>
                                  <h4>Think About This</h4>
                                  <p>
                                    {smartyTeachBackEvaluation.followUpQuestion}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  )}
                </section>
              )}

              {/* STUDY QUEST */}
              {smartyLearningView === "studyQuest" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">STUDY QUEST</span>
                    <h2>Study Quest</h2>
                    <p>
                      Move through stages using content from your uploaded
                      material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          QUEST {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.studyQuest) &&
                        topic.studyQuest.length > 0 ? (
                          topic.studyQuest.map((item, i) => (
                            <div className="smarty-content-list" key={i}>
                              <h4>
                                Stage {item.stage || i + 1}
                              </h4>
                              <p>
                                <strong>Task:</strong> {item.task || ""}
                              </p>
                              <p>
                                <strong>Question:</strong> {item.question || ""}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No Study Quest stages were generated.</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* FIND THE MISTAKE */}
              {smartyLearningView === "findMistake" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">DETECT</span>
                    <h2>Find the Mistake</h2>
                    <p>
                      Try to identify the error before revealing the correction.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.findMistake) &&
                        topic.findMistake.length > 0 ? (
                          topic.findMistake.map((item, i) => (
                            <div className="smarty-content-list" key={i}>
                              <h4>Incorrect Statement</h4>
                              <p>{item.incorrectStatement}</p>

                              <details>
                                <summary>Reveal correction</summary>
                                {item.mistake && <p><strong>Mistake:</strong> {item.mistake}</p>}
                                {item.correctVersion && (
                                  <p>
                                    <strong>Correct version:</strong>{" "}
                                    {item.correctVersion}
                                  </p>
                                )}
                                {item.explanation && <p>{item.explanation}</p>}
                              </details>
                            </div>
                          ))
                        ) : (
                          <p>No mistake-detection activity was generated.</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* REAL LIFE */}
              {smartyLearningView === "realLife" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">APPLY</span>
                    <h2>Real-Life Scenario</h2>
                    <p>
                      Connect concepts from your material with realistic
                      situations.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          SCENARIO {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {Array.isArray(topic.realLifeScenarios) &&
                        topic.realLifeScenarios.length > 0 ? (
                          topic.realLifeScenarios.map((item, i) => (
                            <div className="smarty-content-list" key={i}>
                              <h4>Situation</h4>
                              <p>{item.scenario}</p>
                              <p>
                                <strong>Question:</strong> {item.question}
                              </p>
                              <details>
                                <summary>Show expected answer</summary>
                                <p>{item.expectedAnswer}</p>
                              </details>
                            </div>
                          ))
                        ) : (
                          <p>No real-life scenarios were generated.</p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* EXAM ANSWER */}
              {smartyLearningView === "examAnswer" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">WRITE</span>
                    <h2>Exam Answer Mode</h2>
                    <p>
                      Prepare answers by marks and focus on important keywords.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {[
                          ["2 Marks", topic.examAnswers?.twoMarks],
                          ["5 Marks", topic.examAnswers?.fiveMarks],
                          ["10 Marks", topic.examAnswers?.tenMarks],
                        ].map(([label, answers]) =>
                          Array.isArray(answers) && answers.length > 0 ? (
                            <div className="smarty-content-list" key={label}>
                              <h4>{label}</h4>
                              {answers.map((item, i) => (
                                <div
                                  className="smarty-short-answer-item"
                                  key={i}
                                >
                                  <strong>{item.question}</strong>
                                  <p>{item.answer}</p>
                                  {Array.isArray(item.keywords) &&
                                    item.keywords.length > 0 && (
                                      <small>
                                        Keywords: {item.keywords.join(", ")}
                                      </small>
                                    )}
                                </div>
                              ))}
                            </div>
                          ) : null
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* EXAM NIGHT */}
              {smartyLearningView === "examNight" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">EXAM</span>
                    <h2>Exam Night Mode</h2>
                    <p>
                      Use the generated revision plan when time is limited.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => (
                      <article
                        key={topic._id || index}
                        className="smarty-topic-card"
                      >
                        <span className="smarty-topic-number">
                          TOPIC {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3>{topic.title}</h3>

                        {[
                          ["Must Learn", topic.examNight?.mustLearn],
                          ["Important Questions", topic.examNight?.importantQuestions],
                          ["Weak Topic Check", topic.examNight?.weakTopicCheck],
                          ["Quick Revision", topic.examNight?.quickRevision],
                        ].map(([label, items]) =>
                          Array.isArray(items) && items.length > 0 ? (
                            <div className="smarty-content-list" key={label}>
                              <h4>{label}</h4>
                              <ul>
                                {items.map((item, i) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* SPACED REPETITION */}
              {smartyLearningView === "spacedRepetition" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">REMEMBER</span>
                    <h2>Spaced Repetition</h2>
                    <p>
                      Review generated flashcards again over time.
                    </p>
                  </div>

                  {spacedCards.length === 0 ? (
                    <div className="smarty-empty-state">
                      <h3>No review cards available</h3>
                      <p>
                        Upload and analyze study material with flashcards first.
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const safeIndex = Math.min(
                        smartySpacedIndex,
                        spacedCards.length - 1
                      )
                      const card = spacedCards[safeIndex]

                      return (
                        <div className="smarty-flashcard-page">
                          <div className="smarty-flashcard-progress">
                            Review card {safeIndex + 1} of {spacedCards.length}
                          </div>

                          <div className="smarty-content-list">
                            <h4>{card.topicTitle}</h4>
                            <p>{card.question || card.front || ""}</p>
                          </div>

                          {!smartySpacedSubmitted ? (
                            <>
                              <textarea
                                rows={5}
                                value={smartySpacedAnswer}
                                onChange={(event) => {
                                  setSmartySpacedAnswer(event.target.value)
                                }}
                                placeholder="Write what you remember..."
                              />

                              <button
                                type="button"
                                className="smarty-primary-btn"
                                onClick={() => {
                                  if (!smartySpacedAnswer.trim()) return
                                  setSmartySpacedSubmitted(true)
                                }}
                              >
                                Reveal Answer
                              </button>
                            </>
                          ) : (
                            <div className="smarty-content-list">
                              <h4>Answer</h4>
                              <p>{card.answer || card.back || ""}</p>

                              <div className="smarty-flashcard-controls">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSmartySpacedIndex((value) =>
                                      Math.max(0, value - 1)
                                    )
                                    setSmartySpacedAnswer("")
                                    setSmartySpacedSubmitted(false)
                                  }}
                                  disabled={safeIndex === 0}
                                >
                                  ← Previous
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (safeIndex < spacedCards.length - 1) {
                                      setSmartySpacedIndex((value) => value + 1)
                                      setSmartySpacedAnswer("")
                                      setSmartySpacedSubmitted(false)
                                    }
                                  }}
                                  disabled={
                                    safeIndex === spacedCards.length - 1
                                  }
                                >
                                  Next →
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })()
                  )}
                </section>
              )}

              {/* MASTERY MAP */}
              {/* RESULT */}
              {smartyLearningView === "result" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">RESULT</span>
                    <h2>Your Learning Result</h2>
                    <p>
                      Review the latest result from your Teach Back activity.
                    </p>
                  </div>

                  {smartyTeachBackEvaluation ? (
                    <div className="smarty-teachback-evaluation">
                      {Array.isArray(smartyTeachBackEvaluation.understood) &&
                        smartyTeachBackEvaluation.understood.length > 0 && (
                          <div className="smarty-evaluation-card">
                            <div className="smarty-evaluation-icon">✓</div>
                            <div>
                              <h4>What You Understood</h4>
                              <ul>
                                {smartyTeachBackEvaluation.understood.map(
                                  (item, index) => (
                                    <li key={index}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                      {Array.isArray(smartyTeachBackEvaluation.missed) &&
                        smartyTeachBackEvaluation.missed.length > 0 && (
                          <div className="smarty-evaluation-card">
                            <div className="smarty-evaluation-icon">!</div>
                            <div>
                              <h4>What You Missed</h4>
                              <ul>
                                {smartyTeachBackEvaluation.missed.map(
                                  (item, index) => (
                                    <li key={index}>{item}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                      {smartyTeachBackEvaluation.improvement && (
                        <div className="smarty-evaluation-card">
                          <div className="smarty-evaluation-icon">💡</div>
                          <div>
                            <h4>How You Can Improve</h4>
                            <p>{smartyTeachBackEvaluation.improvement}</p>
                          </div>
                        </div>
                      )}

                      {smartyTeachBackEvaluation.followUpQuestion && (
                        <div className="smarty-evaluation-card smarty-followup-card">
                          <div className="smarty-evaluation-icon">?</div>
                          <div>
                            <h4>Think About This</h4>
                            <p>
                              {smartyTeachBackEvaluation.followUpQuestion}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="smarty-empty-state">
                      <div className="smarty-empty-icon">📊</div>
                      <h3>Your result will appear here.</h3>
                      <p>
                        Open Teach Back Mode, explain a topic in your own words,
                        and submit it for AI evaluation.
                      </p>
                      <button
                        type="button"
                        className="smarty-primary-btn"
                        onClick={() => setSmartyLearningView("teachBack")}
                      >
                        Start Teach Back →
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* MASTERY MAP */}
              {smartyLearningView === "masteryMap" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">MASTERY MAP</span>
                    <h2>Know what needs your attention.</h2>
                    <p>
                      Your current AI-generated mastery structure for this
                      material.
                    </p>
                  </div>

                  <div className="smarty-topic-list">
                    {topics.map((topic, index) => {
                      const mastery =
                        smartyStudy?.mastery?.find(
                          (item) => item.topic === topic.title
                        ) || null

                      return (
                        <article
                          key={topic._id || index}
                          className="smarty-topic-card"
                        >
                          <span className="smarty-topic-number">
                            TOPIC {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3>{topic.title}</h3>

                          <p>
                            Status:{" "}
                            {mastery?.status || "needs-attention"}
                          </p>
                          <p>
                            Score: {mastery?.score || 0}%
                          </p>

                          {Array.isArray(mastery?.keyConcepts) &&
                            mastery.keyConcepts.length > 0 && (
                              <div className="smarty-content-list">
                                <h4>Key Concepts</h4>
                                <ul>
                                  {mastery.keyConcepts.map((concept, i) => (
                                    <li key={i}>{concept}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          {topic.summary && <p>{topic.summary}</p>}
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* BOSS BATTLE */}
              {smartyLearningView === "bossBattle" && (
                <section className="smarty-learning-detail">
                  <div className="smarty-detail-section-header">
                    <span className="smarty-section-label">
                      ⚔️ FINAL CHALLENGE
                    </span>
                    <h2>Boss Battle</h2>
                    <p>
                      Complete the final AI-generated challenge from your
                      material.
                    </p>
                  </div>

                  {!Array.isArray(smartyStudy?.bossBattle?.questions) ||
                  smartyStudy.bossBattle.questions.length === 0 ? (
                    <div className="smarty-empty-state">
                      <h3>Boss Battle is not available yet</h3>
                      <p>
                        Upload and analyze your study material first.
                      </p>
                    </div>
                  ) : (
                    <div className="smarty-topic-list">
                      {smartyStudy.bossBattle.questions.map((question, index) => (
                        <article
                          key={question._id || index}
                          className="smarty-topic-card"
                        >
                          <span className="smarty-topic-number">
                            BOSS {String(index + 1).padStart(2, "0")}
                          </span>

                          <h3>{question.question}</h3>

                          {Array.isArray(question.options) &&
                            question.options.length > 0 && (
                              <div className="smarty-content-list">
                                {question.options.map((option, optionIndex) => (
                                  <button
                                    type="button"
                                    key={optionIndex}
                                    className={`smarty-option ${
                                      smartyBossAnswers[index] === optionIndex
                                        ? "selected"
                                        : ""
                                    }`}
                                    onClick={() => {
                                      if (smartyBossSubmitted) return
                                      setSmartyBossAnswers((previous) => ({
                                        ...previous,
                                        [index]: optionIndex,
                                      }))
                                    }}
                                  >
                                    <span>
                                      {String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    {typeof option === "string"
                                      ? option
                                      : option?.text ||
                                        option?.label ||
                                        option?.value ||
                                        ""}
                                  </button>
                                ))}
                              </div>
                            )}

                          {smartyBossSubmitted && (
                            <div className="smarty-content-list">
                              <p>
                                Correct answer:{" "}
                                {typeof question.correctAnswer === "number"
                                  ? String.fromCharCode(
                                      65 + question.correctAnswer
                                    )
                                  : question.correctAnswer}
                              </p>
                              {question.explanation && (
                                <p>{question.explanation}</p>
                              )}
                            </div>
                          )}
                        </article>
                      ))}

                      {!smartyBossSubmitted ? (
                        <button
                          type="button"
                          className="smarty-primary-btn"
                          onClick={() => {
                            let score = 0

                            smartyStudy.bossBattle.questions.forEach(
                              (question, index) => {
                                const selected = smartyBossAnswers[index]
                                const correct =
                                  typeof question.correctAnswer === "number"
                                    ? question.correctAnswer
                                    : question.answerIndex

                                if (
                                  selected !== undefined &&
                                  selected === correct
                                ) {
                                  score += 1
                                }
                              }
                            )

                            setSmartyBossScore({
                              score,
                              total: smartyStudy.bossBattle.questions.length,
                            })
                            setSmartyBossSubmitted(true)
                          }}
                        >
                          Submit Boss Battle
                        </button>
                      ) : (
                        <div className="smarty-test-result">
                          <h3>Boss Battle Result</h3>
                          <strong>
                            {smartyBossScore?.score || 0} /{" "}
                            {smartyBossScore?.total ||
                              smartyStudy.bossBattle.questions.length}
                          </strong>
                          <p>
                            Your result is based on the answers you submitted.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>
    )
  }
}

  if (page === "smartyStudy" && smartyStudyView !== "dashboard") {
    return (
      <div className="smarty-study-page">
        {renderToast()}

        <header className="smarty-study-header">
          <div className="smarty-study-header-left">
            <div className="smarty-study-logo">
              🧠
            </div>

            <div>
              <h1>Smarty Study</h1>
              <p>Your personal smart learning space</p>
            </div>
          </div>

          <button
            type="button"
            className="smarty-study-home-btn"
            onClick={() => {
              setSmartyStudyView("dashboard")
              setSmartyFlashcardIndex(0)
              setSmartyFlashcardFlipped(false)
              setSmartySelectedAnswers({})
              setSmartyTestScore(null)
            }}
          >
            ← Smarty Study
          </button>
        </header>

        <main className="smarty-study-main">
          <section className="smarty-detail-page">

            {/* BACK */}
            <button
              type="button"
              className="smarty-detail-back"
              onClick={() => {
                setSmartyStudyView("dashboard")
                setSmartyFlashcardIndex(0)
                setSmartyFlashcardFlipped(false)
                setSmartySelectedAnswers({})
                setSmartyTestScore(null)
              }}
            >
              ← Back to Smarty Study
            </button>

            {/* =================================================
                IMPORTANT POINTS
            ================================================= */}
            {smartyStudyView === "importantPoints" && (
              <>
                <div className="smarty-detail-hero">
                  <span>💡</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>Important Points</h2>

                    <p>
                      Important information extracted from your
                      uploaded study material.
                    </p>
                  </div>
                </div>

                {!smartyStudy?.topics?.length ? (
                  <div className="smarty-empty-state">
                    <div>📚</div>
                    <h3>No study material analyzed yet</h3>
                    <p>
                      Upload your study material to generate
                      important points.
                    </p>
                  </div>
                ) : (
                  <div className="smarty-topic-list">
                    {smartyStudy.topics.map((topic, index) => (
                      <article
                        className="smarty-detail-card"
                        key={topic._id || `${topic.title}-${index}`}
                      >
                        <div className="smarty-topic-card-header">
                          <span className="smarty-topic-number">
                            {index + 1}
                          </span>

                          <h3>{topic.title}</h3>
                        </div>

                        {topic.importantPoints?.length ? (
                          <ul className="smarty-points-list">
                            {topic.importantPoints.map(
                              (point, pointIndex) => (
                                <li key={pointIndex}>
                                  {point}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="smarty-no-content">
                            No important points were generated
                            for this topic.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* =================================================
                SIMPLE EXPLANATIONS
            ================================================= */}
            {smartyStudyView === "explanations" && (
              <>
                <div className="smarty-detail-hero">
                  <span>📖</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>Simple Explanations</h2>

                    <p>
                      Concepts explained using the actual material
                      you uploaded.
                    </p>
                  </div>
                </div>

                {!smartyStudy?.topics?.length ? (
                  <div className="smarty-empty-state">
                    <div>📚</div>
                    <h3>No study material analyzed yet</h3>
                    <p>
                      Upload study material to generate
                      explanations.
                    </p>
                  </div>
                ) : (
                  <div className="smarty-topic-list">
                    {smartyStudy.topics.map((topic, index) => (
                      <article
                        className="smarty-detail-card"
                        key={topic._id || `${topic.title}-${index}`}
                      >
                        <div className="smarty-topic-card-header">
                          <span className="smarty-topic-number">
                            {index + 1}
                          </span>

                          <h3>{topic.title}</h3>
                        </div>

                        <div className="smarty-explanation-box">
                          {topic.simpleExplanation || (
                            <span>
                              No explanation was generated
                              for this topic.
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* =================================================
                SHORT ANSWERS
            ================================================= */}
            {smartyStudyView === "shortAnswers" && (
              <>
                <div className="smarty-detail-hero">
                  <span>✍️</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>Short Answers</h2>

                    <p>
                      Quick answers generated from your uploaded
                      study material.
                    </p>
                  </div>
                </div>

                {!smartyStudy?.topics?.length ? (
                  <div className="smarty-empty-state">
                    <div>📚</div>
                    <h3>No study material analyzed yet</h3>
                    <p>
                      Upload study material to generate
                      short answers.
                    </p>
                  </div>
                ) : (
                  <div className="smarty-topic-list">
                    {smartyStudy.topics.map((topic, index) => (
                      <article
                        className="smarty-detail-card"
                        key={topic._id || `${topic.title}-${index}`}
                      >
                        <div className="smarty-topic-card-header">
                          <span className="smarty-topic-number">
                            {index + 1}
                          </span>

                          <h3>{topic.title}</h3>
                        </div>

                        {topic.shortAnswers?.length ? (
                          <div className="smarty-answer-list">
                            {topic.shortAnswers.map(
                              (item, answerIndex) => (
                                <div
                                  className="smarty-answer-item"
                                  key={answerIndex}
                                >
                                  <strong>
                                    {item.question ||
                                      `Question ${answerIndex + 1}`}
                                  </strong>

                                  <p>
  {typeof item === "string"
    ? item
    : item.answer ||
      item.response ||
      item.text ||
      ""}
</p>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="smarty-no-content">
                            No short answers were generated
                            for this topic.
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* =================================================
                FLASHCARDS
            ================================================= */}
            {smartyStudyView === "flashcards" && (
              <>
                <div className="smarty-detail-hero">
                  <span>🗂️</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>Flashcards</h2>

                    <p>
                      Revise the concepts generated from your
                      actual study material.
                    </p>
                  </div>
                </div>

                {(() => {
                  const flashcards =
                    smartyStudy?.topics?.flatMap(
                      (topic) =>
                        (topic.flashcards || []).map(
                          (card) => ({
                            ...card,
                            topicTitle: topic.title,
                          })
                        )
                    ) || []

                  if (!flashcards.length) {
                    return (
                      <div className="smarty-empty-state">
                        <div>🗂️</div>
                        <h3>No flashcards available</h3>
                        <p>
                          Upload and analyze study material
                          to generate flashcards.
                        </p>
                      </div>
                    )
                  }

                  const safeIndex = Math.min(
                    smartyFlashcardIndex,
                    flashcards.length - 1
                  )

                  const currentCard =
                    flashcards[safeIndex]

                  return (
                    <div className="smarty-flashcard-page">
                      <div className="smarty-flashcard-progress">
                        Card {safeIndex + 1} of {flashcards.length}
                      </div>

                      <button
                        type="button"
                        className={`smarty-big-flashcard ${
                          smartyFlashcardFlipped
                            ? "is-flipped"
                            : ""
                        }`}
                        onClick={() =>
                          setSmartyFlashcardFlipped(
                            (value) => !value
                          )
                        }
                      >
                        <span className="smarty-flashcard-label">
                          {smartyFlashcardFlipped
                            ? "ANSWER"
                            : "QUESTION"}
                        </span>

                        <strong>
                          {smartyFlashcardFlipped
                            ? currentCard.answer ||
                              currentCard.back ||
                              "No answer available."
                            : currentCard.question ||
                              currentCard.front ||
                              "No question available."}
                        </strong>

                        <small>
                          {smartyFlashcardFlipped
                            ? "Click to see question"
                            : "Click to reveal answer"}
                        </small>
                      </button>

                      <div className="smarty-flashcard-controls">
                        <button
                          type="button"
                          disabled={safeIndex === 0}
                          onClick={() => {
                            setSmartyFlashcardIndex(
                              (value) => Math.max(0, value - 1)
                            )
                            setSmartyFlashcardFlipped(false)
                          }}
                        >
                          ← Previous
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (
                              safeIndex <
                              flashcards.length - 1
                            ) {
                              setSmartyFlashcardIndex(
                                (value) => value + 1
                              )
                              setSmartyFlashcardFlipped(false)
                            }
                          }}
                          disabled={
                            safeIndex ===
                            flashcards.length - 1
                          }
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </>
            )}

            {/* =================================================
                MCQs & QUESTIONS
            ================================================= */}
            {smartyStudyView === "mcqs" && (
              <>
                <div className="smarty-detail-hero">
                  <span>❓</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>MCQs & Questions</h2>

                    <p>
                      Practice questions generated from your
                      uploaded study material.
                    </p>
                  </div>
                </div>

                {!smartyStudy?.topics?.length ? (
                  <div className="smarty-empty-state">
                    <div>❓</div>
                    <h3>No questions available</h3>
                    <p>
                      Upload and analyze study material first.
                    </p>
                  </div>
                ) : (
                  <div className="smarty-question-list">
                    {smartyStudy.topics.map(
                      (topic, topicIndex) => (
                        <article
                          className="smarty-detail-card"
                          key={
                            topic._id ||
                            `${topic.title}-${topicIndex}`
                          }
                        >
                          <div className="smarty-topic-card-header">
                            <span className="smarty-topic-number">
                              {topicIndex + 1}
                            </span>

                            <h3>{topic.title}</h3>
                          </div>

                          {topic.mcqs?.map(
                            (mcq, mcqIndex) => (
                              <div
                                className="smarty-mcq-item"
                                key={mcqIndex}
                              >
                                <h4>
                                  {mcq.question ||
                                    `Question ${mcqIndex + 1}`}
                                </h4>

                                {mcq.options?.map(
                                  (option, optionIndex) => {
                                    const value =
                                      typeof option ===
                                      "string"
                                        ? option
                                        : option.text ||
                                          option.label ||
                                          option.value

                                    return (
                                      <button
                                        type="button"
                                        key={optionIndex}
                                        className={`smarty-option ${
                                          smartySelectedAnswers[
                                            `${topicIndex}-${mcqIndex}`
                                          ] ===
                                          optionIndex
                                            ? "selected"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          setSmartySelectedAnswers(
                                            (previous) => ({
                                              ...previous,
                                              [`${topicIndex}-${mcqIndex}`]:
                                                optionIndex,
                                            })
                                          )
                                        }
                                      >
                                        <span>
                                          {String.fromCharCode(
                                            65 + optionIndex
                                          )}
                                        </span>

                                        {value}
                                      </button>
                                    )
                                  }
                                )}
                              </div>
                            )
                          )}

                          {topic.questions?.map(
                            (question, questionIndex) => (
                              <div
                                className="smarty-written-question"
                                key={questionIndex}
                              >
                                <strong>
                                  Q{questionIndex + 1}.
                                </strong>

                                <span>
                                  {typeof question ===
                                  "string"
                                    ? question
                                    : question.question ||
                                      question.text}
                                </span>
                              </div>
                            )
                          )}
                        </article>
                      )
                    )}
                  </div>
                )}
              </>
            )}

            {/* =================================================
                MOCK TEST
            ================================================= */}
            {smartyStudyView === "mockTest" && (
              <>
                <div className="smarty-detail-hero">
                  <span>📝</span>
                  <div>
                    <span className="smarty-section-label">
                      MATERIAL → SMART LEARNING
                    </span>

                    <h2>Mock Test</h2>

                    <p>
                      Test yourself using questions generated
                      from your actual study material.
                    </p>
                  </div>
                </div>

                {!smartyStudy?.topics?.length ? (
                  <div className="smarty-empty-state">
                    <div>📝</div>
                    <h3>No mock test available</h3>
                    <p>
                      Upload and analyze study material first.
                    </p>
                  </div>
                ) : (
                  <div className="smarty-mock-test">
                    {!smartyStudy?.mockTest?.length ? (
                      <div className="smarty-empty-state">
                        <div>📝</div>

                        <h3>No mock test available</h3>

                        <p>
                          Upload and analyze study material first.
                        </p>
                      </div>
                    ) : (
                      <div className="smarty-mock-test">
                        {smartyStudy.mockTest.map(
                          (mcq, mcqIndex) => {
                            const key = `mock-${mcqIndex}`

                            return (
                              <article
                                className="smarty-test-question"
                                key={key}
                              >
                                <span>
                                  Question {mcqIndex + 1}
                                </span>

                                <h3>{mcq.question}</h3>

                                <div>
                                  {mcq.options?.map(
                                    (option, optionIndex) => {
                                      const value =
                                        typeof option === "string"
                                          ? option
                                          : option?.text ||
                                            option?.label ||
                                            option?.value ||
                                            ""

                                      return (
                                        <button
                                          type="button"
                                          key={optionIndex}
                                          className={
                                            smartySelectedAnswers[key] ===
                                            optionIndex
                                              ? "selected"
                                              : ""
                                          }
                                          onClick={() =>
                                            setSmartySelectedAnswers(
                                              (previous) => ({
                                                ...previous,
                                                [key]: optionIndex,
                                              })
                                            )
                                          }
                                        >
                                          {String.fromCharCode(
                                            65 + optionIndex
                                          )}. {value}
                                        </button>
                                      )
                                    }
                                  )}
                                </div>
                              </article>
                            )
                          }
                        )}

                        <button
                          type="button"
                          className="smarty-primary-btn"
                          onClick={() => {
                            let score = 0
                            let total = 0

                            smartyStudy.mockTest.forEach(
                              (mcq, mcqIndex) => {
                                total += 1

                                const key = `mock-${mcqIndex}`

                                const selected =
                                  smartySelectedAnswers[key]

                                let correctIndex = -1

                                if (
                                  typeof mcq.correctAnswer ===
                                  "number"
                                ) {
                                  correctIndex =
                                    mcq.correctAnswer
                                } else if (
                                  typeof mcq.correctAnswer ===
                                  "string"
                                ) {
                                  const answer =
                                    mcq.correctAnswer.trim()

                                  if (/^[0-9]+$/.test(answer)) {
                                    correctIndex = Number(answer)
                                  } else if (
                                    /^[A-Da-d]$/.test(answer)
                                  ) {
                                    correctIndex =
                                      answer
                                        .toUpperCase()
                                        .charCodeAt(0) - 65
                                  } else {
                                    correctIndex =
                                      mcq.options?.findIndex(
                                        (option) =>
                                          String(option)
                                            .trim()
                                            .toLowerCase() ===
                                            answer.toLowerCase()
                                      ) ?? -1
                                  }
                                }

                                if (
                                  selected !== undefined &&
                                  selected === correctIndex
                                ) {
                                  score += 1
                                }
                              }
                            )

                            setSmartyTestScore({
                              score,
                              total,
                            })
                          }}
                        >
                          Submit Mock Test
                        </button>

                        {smartyTestScore && (
                          <div className="smarty-test-result">
                            <h3>Test Result</h3>

                            <strong>
                              {smartyTestScore.score} / {" "}
                              {smartyTestScore.total}
                            </strong>

                            <p>
                              Your result is based on the
                              answers you submitted.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </section>
        </main>
      </div>
    )
  }

  if (page === "smartyStudy") {
  return (
    <div className="smarty-study-page">

      {renderToast()}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="smarty-study-header">

        <div className="smarty-study-header-left">

          <div className="smarty-study-logo">
            🧠
          </div>

          <div>
            <h1>Smarty Study</h1>
            <p>Your personal smart learning space</p>
          </div>

        </div>

        <button
          type="button"
          className="smarty-study-home-btn"
          onClick={() => setPage("dashboard")}
        >
          ← Home
        </button>

      </header>


      <main className="smarty-study-main">

        {smartyStudyLoading && (
          <div className="students-message" role="status">
            Loading your study material...
          </div>
        )}


        {/* =====================================================
            01. HERO
        ===================================================== */}

        <section className="smarty-study-hero">

          <div className="smarty-hero-content">

            <span className="smarty-hero-badge">
              ✨ Learn • Practice • Master
            </span>

            <h2>
              Study smarter,
              <br />
              not harder.
            </h2>

            <p>
              Turn your study material into an interactive
              learning experience designed to help you
              understand, practice and remember.
            </p>

            <div className="smarty-hero-actions">

              <button
                type="button"
                className="smarty-primary-btn"
                onClick={() => setShowUploadMaterial(true)}
              >
                📚 Upload Study Material
              </button>

            </div>

          </div>


          <div className="smarty-hero-visual">

            <div className="smarty-hero-orbit smarty-orbit-one">
              📖
            </div>

            <div className="smarty-hero-orbit smarty-orbit-two">
              💡
            </div>

            <div className="smarty-hero-orbit smarty-orbit-three">
              🎯
            </div>

            <div className="smarty-hero-brain">
              🧠
            </div>

            <div className="smarty-hero-floating-card smarty-float-card-one">
              <strong>Understand</strong>
              <span>Concepts made simple</span>
            </div>

            <div className="smarty-hero-floating-card smarty-float-card-two">
              <strong>Practice</strong>
              <span>Learn by doing</span>
            </div>

          </div>

        </section>


        {/* =====================================================
            02. MATERIAL → SMART LEARNING
        ===================================================== */}

        <section className="smarty-output-section">

          <div className="smarty-output-heading">

            <span className="smarty-section-label">
              MATERIAL → SMART LEARNING
            </span>

            <h2>
              One material.
              <br />
              Multiple ways to learn.
            </h2>

            <p>
              Smarty Study uses the material you upload to
              create useful learning and revision resources.
            </p>

          </div>


          <div className="smarty-output-grid">

            <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("importantPoints")
  }}
>

              <div>💡</div>

              <h3>
                Important Points
              </h3>

              <p>
                Identify the important information from
                the material you are studying.
              </p>

            </article>


            <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("explanations")
  }}
>

              <div>📖</div>

              <h3>
                Simple Explanations
              </h3>

              <p>
                Difficult concepts can be explained in
                simpler and easier language.
              </p>

            </article>


            <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("shortAnswers")
  }}
>

              <div>✍️</div>

              <h3>
                Short Answers
              </h3>

              <p>
                Get concise answers for understanding
                and quick revision.
              </p>

            </article>


            <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("flashcards")
    setSmartyFlashcardIndex(0)
    setSmartyFlashcardFlipped(false)
  }}
>

              <div>🗂️</div>

              <h3>
                Flashcards
              </h3>

              <p>
                Revise concepts through quick
                question-and-answer cards.
              </p>

            </article>


            <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("mcqs")
    setSmartySelectedAnswers({})
    setSmartyTestScore(null)
  }}
>

              <div>❓</div>

              <h3>
                MCQs & Questions
              </h3>

              <p>
                Practice questions based on the
                material you are actually studying.
              </p>

            </article>


           <article
  className="smarty-output-card"
  onClick={() => {
    setSmartyStudyView("mockTest")
    setSmartySelectedAnswers({})
    setSmartyTestScore(null)
  }}
>

              <div>📝</div>

              <h3>
                Mock Tests
              </h3>

              <p>
                Test your preparation with a
                complete practice session.
              </p>

            </article>

          </div>

        </section>

                


        {/* =====================================================
            03. LEARNING JOURNEY
        ===================================================== */}

        <section
          id="smarty-learning-path"
          className="smarty-section"
        >

          <div className="smarty-section-heading">

            <div>

              <span className="smarty-section-label">
                YOUR LEARNING JOURNEY
              </span>

              <h2>
                From learning to mastery.
              </h2>

              <p>
                Smarty Study turns studying into an active
                process instead of simply reading notes.
              </p>

            </div>

          </div>


          <div className="smarty-learning-path">

           <article
  className="smarty-learning-card"
  onClick={() => {
    setSmartyLearningView("learn")
  }}
>

              <div className="smarty-learning-number">
                01
              </div>

              <div className="smarty-learning-icon">
                🧠
              </div>

              <span>
                UNDERSTAND
              </span>

              <h3>
                Learn
              </h3>

              <p>
                Understand concepts using simple explanations,
                important points and short answers.
              </p>

            </article>


            <article
  className="smarty-learning-card"
  onClick={() => {
    setSmartyLearningView("practice")
  }}
>

              <div className="smarty-learning-number">
                02
              </div>

              <div className="smarty-learning-icon">
                🎯
              </div>

              <span>
                PRACTICE
              </span>

              <h3>
                Practice
              </h3>

              <p>
                Test your understanding with questions,
                MCQs, flashcards and interactive challenges.
              </p>

            </article>


            <article
  className="smarty-learning-card"
  onClick={() => {
    setSmartyLearningView("challenge")
  }}
>

              <div className="smarty-learning-number">
                03
              </div>

              <div className="smarty-learning-icon">
                ⚔️
              </div>

              <span>
                CHALLENGE
              </span>

              <h3>
                Challenge
              </h3>

              <p>
                Challenge your understanding using different
                interactive learning activities.
              </p>

            </article>


            <article
  className="smarty-learning-card"
  onClick={() => {
    setSmartyLearningView("master")
  }}
>

              <div className="smarty-learning-number">
                04
              </div>

              <div className="smarty-learning-icon">
                🏆
              </div>

              <span>
                MASTER
              </span>

              <h3>
                Master
              </h3>

              <p>
                Strengthen your understanding through
                practice, revision and repeated learning.
              </p>

            </article>

          </div>

        </section>


        {/* =====================================================
            04. SMART LEARNING MODES
        ===================================================== */}

        <section className="smarty-section">

          <div className="smarty-section-heading">

            <div>

              <span className="smarty-section-label">
                SMART LEARNING MODES
              </span>

              <h2>
                Learn in different ways.
              </h2>

              <p>
                Different learning modes help you understand,
                apply, explain and remember concepts.
              </p>

            </div>

          </div>


          <div className="smarty-mode-grid">


            {/* SOCRATIC */}

            <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("socratic")
  }}
>

              <div className="smarty-mode-icon">
                💬
              </div>

              <span className="smarty-mode-tag">
                THINK
              </span>

              <h3>
                Interactive Socratic Questioning
              </h3>

              <p>
                Instead of immediately giving the answer,
                Smarty Study guides you using counter-questions
                so you can reach the answer yourself.
              </p>

              <div className="smarty-mode-footer">
                Think → Question → Discover
              </div>

            </article>


            {/* TEACH BACK */}

            <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("teachBack")
  }}
>

              <div className="smarty-mode-icon">
                🗣️
              </div>

              <span className="smarty-mode-tag">
                EXPLAIN
              </span>

              <h3>
                Teach Back Mode
              </h3>

              <p>
                Explain the concept in your own words.
                Smarty Study evaluates your explanation and
                identifies what you understood and what you missed.
              </p>

              <div className="smarty-mode-footer">
                Learn → Explain → Evaluate
              </div>

            </article>


            {/* STUDY QUEST */}

           <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("studyQuest")
  }}
>

              <div className="smarty-mode-icon">
                🎮
              </div>

              <span className="smarty-mode-tag">
                JOURNEY
              </span>

              <h3>
                Study Quest
              </h3>

              <p>
                Move through Learn, Practice, Challenge
                and Master stages as you continue learning.
              </p>

              <div className="smarty-mode-footer">
                Learn → Practice → Challenge → Master
              </div>

            </article>


            {/* FIND THE MISTAKE */}

           <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("findMistake")
  }}
>

              <div className="smarty-mode-icon">
                🔎
              </div>

              <span className="smarty-mode-tag">
                DETECT
              </span>

              <h3>
                Find the Mistake
              </h3>

              <p>
                Find the mistake in an intentionally incorrect
                statement or solution and understand why it is wrong.
              </p>

              <div className="smarty-mode-footer">
                Find → Correct → Understand
              </div>

            </article>


            {/* REAL LIFE */}

           <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("realLife")
  }}
>

              <div className="smarty-mode-icon">
                🌍
              </div>

              <span className="smarty-mode-tag">
                APPLY
              </span>

              <h3>
                Real-Life Scenario
              </h3>

              <p>
                Connect theory with realistic situations so
                concepts become easier to understand and apply.
              </p>

              <div className="smarty-mode-footer">
                Theory → Situation → Application
              </div>

            </article>


            {/* EXAM ANSWER */}

            <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("examAnswer")
  }}
>

              <div className="smarty-mode-icon">
                ✍️
              </div>

              <span className="smarty-mode-tag">
                WRITE
              </span>

              <h3>
                Exam Answer Mode
              </h3>

              <p>
                Prepare 2-mark, 5-mark and 10-mark style answers
                with important keywords and points.
              </p>

              <div className="smarty-mode-footer">
                Understand → Structure → Write
              </div>

            </article>


            {/* EXAM NIGHT */}

            <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("examNight")
  }}
>

              <div className="smarty-mode-icon">
                🌙
              </div>

              <span className="smarty-mode-tag">
                EXAM
              </span>

              <h3>
                Exam Night Mode
              </h3>

              <p>
                Organize limited study time around Must Learn,
                Important Questions, Weak Topics, Mock Test
                and Quick Revision.
              </p>

              <div className="smarty-mode-footer">
                Focus → Practice → Revise
              </div>

            </article>


            {/* SPACED REPETITION */}

            <article
  className="smarty-mode-card"
  onClick={() => {
    setSmartyLearningView("spacedRepetition")
  }}
>

              <div className="smarty-mode-icon">
                🔄
              </div>

              <span className="smarty-mode-tag">
                REMEMBER
              </span>

              <h3>
                Spaced Repetition
              </h3>

              <p>
                Concepts that need another review can return
                later so revision happens over time.
              </p>

              <div className="smarty-mode-footer">
                Review → Remember → Review Again
              </div>

            </article>

          </div>

        </section>


        {/* =====================================================
            05. TEACH BACK
        ===================================================== */}

        <section
          className="smarty-teachback-section"
          role="button"
          tabIndex={0}
          onClick={() => setSmartyLearningView("result")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setSmartyLearningView("result")
            }
          }}
        >

          <div className="smarty-teachback-left">

            <span className="smarty-section-label">
              TEACH BACK MODE
            </span>

            <h2>
              Don't just read it.
              <br />
              Explain it.
            </h2>

            <p>
              After learning a concept, explain it in your own
              words. Smarty Study evaluates your explanation and
              helps identify what you understood and what you missed.
            </p>


            <div className="smarty-teachback-flow">

              <span>
                🧠 Learn
              </span>

              <span>→</span>

              <span>
                🗣️ Explain
              </span>

              <span>→</span>

              <span>
                🔍 Evaluate
              </span>

              <span>→</span>

              <span>
                🎯 Improve
              </span>

            </div>

          </div>


          <div className="smarty-teachback-result">

            <div className="smarty-result-header">

              <div>

                <span>
                  TEACH BACK RESULT
                </span>

                <h3>
                  Your answer
                </h3>

              </div>

              <div className="smarty-result-status">
                AI Evaluation
              </div>

            </div>


            <div className="smarty-result-placeholder">

              <div className="smarty-placeholder-icon">
                🗣️
              </div>

              <h3>
                Your result will appear here.
              </h3>

              <p>
                Explain a concept in your own words and Smarty
                Study can evaluate your answer, show what you
                missed and continue with the next question.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================================
            06. MASTERY MAP
        ===================================================== */}

        <section
          className="smarty-mastery-section"
          role="button"
          tabIndex={0}
          onClick={() => setSmartyLearningView("masteryMap")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setSmartyLearningView("masteryMap")
            }
          }}
        >

          <div className="smarty-section-heading">

            <div>

              <span className="smarty-section-label">
                MASTERY MAP
              </span>

              <h2>
                Know what needs your attention.
              </h2>

              <p>
                Your learning activity will determine which
                concepts are mastered, need practice or need
                more attention.
              </p>

            </div>

          </div>


          <div className="smarty-mastery-board">

            <div className="smarty-mastery-empty">

              <div className="smarty-mastery-empty-icon">
                🗺️
              </div>

              <h3>
                Your Mastery Map will appear here.
              </h3>

              <p>
                Topics will be added automatically after your
                uploaded material is analyzed and you start
                learning and practicing.
              </p>

            </div>

          </div>


          <div className="smarty-mastery-legend">

            <span>
              🟢 Mastered
            </span>

            <span>
              🟡 Needs Practice
            </span>

            <span>
              🔴 Needs Attention
            </span>

          </div>

        </section>


        



        {/* =====================================================
            09. BOSS BATTLE — FINAL
        ===================================================== */}

        <section
          className="smarty-boss-section"
          role="button"
          tabIndex={0}
          onClick={() => setSmartyLearningView("bossBattle")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              setSmartyLearningView("bossBattle")
            }
          }}
        >

          <div className="smarty-boss-content">

            <span className="smarty-boss-label">
              ⚔️ FINAL CHALLENGE
            </span>

            <h2>
              Boss Battle
            </h2>

            <p>
              A final mixed challenge can combine MCQs,
              concept questions, real-life situations,
              Find the Mistake and Teach Back.
            </p>

            <div className="smarty-boss-requirement">
              🔒 Unlocks after completing your learning journey
            </div>

          </div>


          <div className="smarty-boss-visual">
            ⚔️
          </div>

        </section>

      </main>


      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      {showUploadMaterial && (

        <div
          className="smarty-upload-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowUploadMaterial(false)
            }
          }}
        >

          <div className="smarty-upload-modal">


            <div className="smarty-upload-modal-header">

              <div>

                <span className="smarty-section-label">
                  SMARTY STUDY
                </span>

                <h2>
                  Upload Study Material
                </h2>

                <p>
                  Add your notes, PDF or study resource to
                  start your learning journey.
                </p>

              </div>


              <button
                type="button"
                className="smarty-upload-close"
                onClick={() => setShowUploadMaterial(false)}
              >
                ×
              </button>

            </div>


            <div className="smarty-upload-form">


              {/* MATERIAL TITLE */}

              <div className="smarty-form-group">

                <label>
                  Material Title
                </label>

                <input
                  type="text"
                  value={materialForm.title}
                  placeholder="Enter material title"
                  onChange={(event) =>
                    setMaterialForm((previous) => ({
                      ...previous,
                      title: event.target.value
                    }))
                  }
                />

              </div>


              {/* MATERIAL TYPE */}

              <div className="smarty-form-group">

                <label>
                  Material Type
                </label>

                <select
                  value={materialForm.category}
                  onChange={(event) =>
                    setMaterialForm((previous) => ({
                      ...previous,
                      category: event.target.value
                    }))
                  }
                >

                  <option value="Notes">
                    Notes
                  </option>

                  <option value="Previous Year Papers">
                    Previous Year Papers
                  </option>

                  <option value="Question Banks">
                    Question Banks
                  </option>

                  <option value="Assignments">
                    Assignments
                  </option>

                  <option value="Study PDFs/Resources">
                    Study PDFs / Resources
                  </option>

                  <option value="Practical/Viva Material">
                    Practical / Viva Material
                  </option>

                </select>

              </div>


              {/* DESCRIPTION */}

              <div className="smarty-form-group">

                <label>
                  Description <span>Optional</span>
                </label>

                <textarea
                  rows="4"
                  value={materialForm.description}
                  placeholder="Tell us what this material contains..."
                  onChange={(event) =>
                    setMaterialForm((previous) => ({
                      ...previous,
                      description: event.target.value
                    }))
                  }
                />

              </div>


              {/* FILE */}

              <div className="smarty-form-group">

                <label>
                  Study Material File
                </label>

                <label
                  htmlFor="study-material-file-input"
                  className="smarty-file-dropzone"
                >

                  <div className="smarty-file-icon">
                    📎
                  </div>

                  <strong>
                    Choose your study material
                  </strong>

                  <span>
                    PDF, DOC, DOCX, PPT, PPTX or image
                  </span>

                  {materialForm.file && (
                    <small>
                      Selected: {materialForm.file.name}
                    </small>
                  )}

                </label>


                <input
                  id="study-material-file-input"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp"
                  className="smarty-hidden-file-input"
                  onChange={(event) =>
                    setMaterialForm((previous) => ({
                      ...previous,
                      file: event.target.files?.[0] || null
                    }))
                  }
                />

              </div>


              {/* ACTIONS */}

              <div className="smarty-upload-actions">

                <button
                  type="button"
                  className="smarty-cancel-btn"
                  onClick={() => setShowUploadMaterial(false)}
                  disabled={materialUploading}
                >
                  Cancel
                </button>


                <button
                  type="button"
                  className="smarty-primary-btn"
                  onClick={handleUploadMaterial}
                  disabled={materialUploading}
                >
                  {materialUploading
                    ? "Uploading..."
                    : "📤 Upload Material"}
                </button>

              </div>


            </div>

          </div>

        </div>

      )}


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
        {renderToast()}

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

            {connectionsLoading ? (
              <div className="students-message">
                Loading connected students...
              </div>
            ) : connectedStudents.length === 0 ? (
              <div className="students-message">
                No connected students yet.
              </div>
            ) : (
              <div className="students-grid">
                {connectedStudents.map((student) => {
                  const studentId = student._id || student.id

                  return (
                    <article className="student-card" key={studentId}>
                      <button
                        type="button"
                        className="student-avatar student-avatar-button"
                        aria-label={`View ${student.name || "student"}'s profile`}
                        onClick={() => {
                          handleViewProfile(studentId)
                          setPage("student-profile")
                        }}
                      >
                        {student.name?.charAt(0)?.toUpperCase() || "S"}
                      </button>

                      <div className="student-card-info">
                        <h3>{student.name || "Student"}</h3>
                        <p>
                          {student.degree || "Degree not added"}
                          {student.year ? ` • ${student.year}` : ""}
                        </p>
                        <span>{student.college || "College not added"}</span>
                      </div>

                      <button
                        type="button"
                        className="student-connect-button"
                        onClick={() => {
                          setActiveChatConnection({ otherUser: student })
                          setChatMessages([])
                          setChatText("")
                          setPage("chat")
                        }}
                      >
                        💬 Chat
                      </button>
                    </article>
                  )
                })}
              </div>
            )}

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
        {renderToast()}

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

            <button
  className="dashboard-nav-link"
  onClick={() =>
    setPage("smartyStudy")
  }
>
  Smarty Study
</button>

          </nav>


          <div className="dashboard-header-right">

            <div
  className="notification-wrapper"
  ref={notificationRef}
>
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




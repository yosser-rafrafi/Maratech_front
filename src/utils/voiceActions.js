/**
 * Voice Action Dictionary - Tunisian Arabic (تونسي)
 * Maps action keys to simple Tunisian Arabic phrases for TTS accessibility.
 * Used when user clicks buttons - system speaks the action meaning.
 * No Modern Standard Arabic - colloquial Tunisian only.
 */

export const VOICE_ACTIONS = {
  // Formation Management
  ADD_FORMATION: "إصنع فورماسيون جديدة",
  DELETE_FORMATION: "إمسح الفورماسيون",
  EDIT_FORMATION: "عدّل الفورماسيون",
  ARCHIVE_FORMATION: "خبّي الفورماسيون",
  ACTIVATE_FORMATION: "فعّل الفورماسيون",
  MANAGE_FORMATION: "سيّر الفورماسيون",
  NEW_FORMATION: "فورماسيون جديدة",
  CREATE_FORMATION: "إصنع فورماسيون",

  // Formation Details - Sessions
  ADD_SESSION: "إصنع ساعة جديدة",
  EDIT_SESSION: "عدّل الساعة",
  DELETE_SESSION: "إمسح الساعة",
  ENROLL_PARTICIPANT: "سجّل مشارك",

  // Attendance
  VIEW_ABSENCES: "شوف الحصص المغيّبة",
  MARK_ATTENDANCE: "سجّل الحضور",
  SAVE_ATTENDANCE: "خزّن الحضور",

  // Certifications
  GENERATE_CERTIFICATE: "أخرج شهادة التكوين",
  VERIFY_ELIGIBILITY: "تأكد من الأهلية",
  DOWNLOAD_CERTIFICATE: "حمّل الشهادة",

  // User Management
  ADD_USER: "إصنع مستخدم جديد",
  EDIT_USER: "عدّل المستخدم",
  APPROVE_USER: "وافق على المستخدم",

  // Navigation / Common
  BACK: "رجع",
  SAVE: "خزّن",
  CANCEL: "إلغى",
};

export default VOICE_ACTIONS;

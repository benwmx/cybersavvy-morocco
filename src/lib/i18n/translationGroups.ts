export interface TranslationGroup {
  label: string;
  keys: readonly string[];
}

export const TRANSLATION_GROUPS: TranslationGroup[] = [
  {
    label: "Global / Partagé",
    keys: ["appName", "online", "offline", "syncing", "syncQueued", "syncDone", "save", "delete", "create", "update", "copy", "copied", "next", "finish", "retry", "unknownError", "noData", "tryAgain", "searchPlaceholder", "noResults"],
  },
  {
    label: "Page d'accueil — Hero",
    keys: ["tagline", "heroTitle", "heroSubtitle", "heroTag", "platformTitle", "platformTitleAr", "offlineResilience", "offlineResilienceAr", "freeAccess", "freeAccessAr"],
  },
  {
    label: "Page d'accueil — Portails",
    keys: ["studentPortal", "studentPortalDesc", "teacherPortal", "teacherPortalDesc", "getStarted", "student", "teacher", "startPath", "startPathAr", "learnerSpace", "learnerSpaceAr", "trainerSpace", "trainerSpaceAr", "learnerDesc", "learnerDescAr", "trainerDesc", "trainerDescAr", "learnerBullet1", "learnerBullet2", "learnerBullet3", "learnerPortalEntry", "trainerBullet1", "trainerBullet2", "trainerBullet3", "trainerPortalEntry"],
  },
  {
    label: "Page d'accueil — Piliers & Pied de page",
    keys: ["pillarsTitle", "pillarPhishing", "pillarPhishingAr", "pillarPasswords", "pillarPasswordsAr", "pillarSocial", "pillarSocialAr", "pillarBullying", "pillarBullyingAr", "pillarPrivacy", "pillarPrivacyAr", "pillarMalware", "pillarMalwareAr", "footerCopyright", "footerTerms", "footerPrivacy", "footerAccessibility"],
  },
  {
    label: "Authentification — Connexion",
    keys: ["platformAccess", "loginSubtitle", "email", "password", "signIn", "signUp", "needAccount", "haveAccount", "welcome", "welcomeBack", "loginError", "accountCreated", "invalidAccessCode", "massarNotFound", "invalidCode", "enterCode"],
  },
  {
    label: "Authentification — Mot de passe",
    keys: ["forgotPassword", "backToLogin", "sendResetLink", "resetLinkSent", "resetYourPassword", "newPassword", "confirmPassword", "passwordsNoMatch", "setNewPassword", "invalidResetLink"],
  },
  {
    label: "Élève — Rejoindre une classe",
    keys: ["classCode", "yourName", "join", "massarCode"],
  },
  {
    label: "Élève — Lecteur de parcours",
    keys: ["chooseTrack", "question", "of", "correct", "incorrect", "whyMatters", "yourScore", "backToTracks", "media", "trackNotFound", "noTracksAvailable", "backHome", "myClass", "guestMode", "guestDesc", "guestHistory", "greetingName"],
  },
  {
    label: "Enseignant — Navigation",
    keys: ["dashboard", "dashboardSubtitle", "overview", "classes", "analytics", "logout", "settings", "account", "myProfile", "tracks", "studentsLabel", "tutorialsLabel", "docsLabel", "quickAccess", "greeting"],
  },
  {
    label: "Enseignant — Tableau de bord",
    keys: ["avgGeneral", "analyticsDesc", "classesDesc", "tracksDesc", "studentsDesc", "tutorialsDesc"],
  },
  {
    label: "Enseignant — Classes",
    keys: ["createClass", "className", "accessCode", "noClasses", "deleteConfirm", "classesLabel", "classesSubtitle", "createClassDesc", "classNamePlaceholder"],
  },
  {
    label: "Enseignant — Scénarios & Quiz",
    keys: ["myScenarios", "systemScenarios", "createScenario", "scenarioTitleFr", "scenarioTitleAr", "category", "categorySelect", "categorySelectPlaceholder", "addQuestion", "mediaUrl", "scenarioCoverImage", "saveScenario", "assignScenarios", "manageQuizzes", "scenarioCustomDesc", "editTrackTitle", "editCategoryTitle", "quizzesTitle", "quizzesSubtitle", "newCategoryBtn", "categoryGlobal", "categoryMyVersion", "trackCount", "createMyVersion", "resetCategory", "hideBtn", "manageTracksBtn", "tracksInCategory", "noTracksInCategory", "questionAbbr", "confirmReset", "confirmDeleteCategory", "confirmDeleteTrack", "categoryCreated", "categoryUpdated", "categoryDeleted", "scenarioDeleted", "categoryCustomCreated", "trackResetSuccess", "newCategoryDesc", "media"],
  },
  {
    label: "Enseignant — Élèves",
    keys: ["manageStudents", "addStudent", "studentList", "noStudents", "studentAdded", "alreadyExists", "studentNameFr", "studentNameAr", "individual", "bulkImportLabel", "bulkImportDesc", "singleImportDesc", "bulkFormat", "validRows", "invalidRows", "importing", "importBtn", "studentRemoved", "studentsAddedMsg", "bulkPartialMsg", "studentIdentity", "studentNameColOther", "studentsRegister", "deleteStudentConfirm", "studentsTitle", "studentsSubtitle"],
  },
  {
    label: "Enseignant — Analyses",
    keys: ["avgScore", "targetGaps", "targetGapsDesc", "avgScoreLabel", "analyticsSubtitle", "allClasses", "attempts", "tracksCovered", "basedOnAttempts", "perfByCategory", "vigilancePoints", "noFrequentErrors", "studentsFailed", "perfByTrack", "average"],
  },
  {
    label: "Enseignant — Recommandations IA",
    keys: ["aiConfig", "aiConfigDesc", "aiProvider", "aiModel", "aiApiKey", "saveApiKey", "apiKeySaved", "removeApiKey", "keyConfigured", "keyNotConfigured", "testingKey", "keyValid", "keyInvalid", "aiRecommendations", "aiRecommendationsDesc", "generateRecommendations", "regenerate", "generating", "aiDisclaimer", "saveRecommendation", "saved", "lastSaved", "noApiKeyTitle", "noApiKeyDesc", "goToSettings", "noDataForAI"],
  },
  {
    label: "Enseignant — Paramètres",
    keys: ["updatePassword", "passwordUpdated", "firstName", "lastName", "profileUpdated", "settingsSubtitle", "profileDesc", "updatePasswordDesc", "passwordTooShort"],
  },
  {
    label: "Tutoriels",
    keys: ["comingSoon", "tutorialsPageDesc", "tutorialsComingSoonDesc"],
  },
  {
    label: "Documentation",
    keys: ["docs", "docsDesc", "noArticles"],
  },
  {
    label: "Admin — Navigation",
    keys: ["adminNavUsers", "adminNavContent", "adminNavClasses", "adminNavTranslations"],
  },
  {
    label: "Admin — Vue d'ensemble",
    keys: ["adminOverviewSubtitle", "adminQuickAccess", "adminPlatformLinks", "viewPublicSite", "teacherLoginLink", "studentLoginLink", "adminUsersDesc", "adminContentDesc", "adminClassesDesc", "adminTranslationsDesc", "adminSettingsDesc"],
  },
  {
    label: "Admin — Contenu global",
    keys: ["adminContentTitle", "adminContentSubtitle", "adminCategories", "adminNoCategories", "adminPickCategory", "adminScenarios", "adminNoScenarios", "adminPickScenario", "adminNoQuestions", "adminModify", "adminCancel", "adminNewCategory", "adminEditCategory", "adminNewScenario", "adminEditScenario", "adminNameFr", "adminNameAr", "adminColor", "adminChoicesLabel", "adminAddChoice", "adminExplanation", "adminQNoText", "adminEditQuestion", "adminCatSaved", "adminCatDeleted", "adminScenSaved", "adminScenDeleted", "adminQSaved", "adminDeleteCatConfirm", "adminDeleteScenConfirm", "adminDeleteQConfirm", "adminTitleFrField", "adminTitleArField", "adminDescFrField", "adminDescArField", "adminQuestionsLabel"],
  },
  {
    label: "Admin — Utilisateurs",
    keys: ["adminUsersTitle", "adminUsersSubtitle", "teachers", "results", "noUsers", "colName", "colEmail", "colRegisteredAt"],
  },
  {
    label: "Admin — Classes",
    keys: ["adminClassesSubtitle", "colCode", "colTeacher", "colScenarios", "colCreatedAt", "noClassesAdmin", "classesLabel"],
  },
  {
    label: "Admin — Traductions",
    keys: ["adminTranslationsTitle", "adminTranslationsSubtitle", "adminEntriesLabel", "adminSearch", "adminAdd", "adminColKey", "adminColFr", "adminColAr", "adminSaved", "adminDeleted", "adminNoResults", "migrationRequired", "migrationRequiredDesc"],
  },
  {
    label: "Admin — Documentation",
    keys: ["adminDocs", "adminDocsDesc", "sections", "noSections", "newSection", "editSection", "selectSection", "deleteSection", "noArticlesInSection", "newArticle", "editArticle", "sectionKey", "sectionLabel", "articleTitle", "articleContent", "published", "draft", "sortOrder", "adminDeleteDocConfirm", "showPreview", "hidePreview", "sectionInArticleForm", "cannotDeleteSection", "confirmDeleteSection"],
  },
  {
    label: "Admin — Paramètres",
    keys: ["adminSettingsSubtitle", "adminChangeEmail", "adminNewEmail", "adminEmailSent", "adminUpdateEmail", "adminSending", "adminChangePassword", "adminCurrentPassword", "adminNewPassword", "adminConfirmPassword", "adminUpdating", "adminUpdatePassword", "adminPasswordUpdated", "adminPasswordMismatch", "adminPasswordTooShort"],
  },
  {
    label: "Pages d'erreur",
    keys: ["notFoundDesc", "goHome", "errorTitle"],
  },
];

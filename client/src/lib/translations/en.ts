// English translations
export default {
  auth: {
    welcome: "Welcome to Tathyaganga",
    login: {
      title: "Login Failed",
      errorMessage: "The username or password you entered is incorrect. Please verify your credentials and try again.",
      success: "Welcome back!",
      successMessage: "Successfully logged in to your account.",
    },
    register: {
      title: "Registration Failed",
      success: "Welcome to Tathyaganga!",
      successMessage: "Your account has been created successfully.",
    },
    form: {
      username: "Username",
      password: "Password",
      loginButton: "Login",
      registerButton: "Register",
      usernameHint: "5-20 characters, must start with a letter, can contain letters, numbers, and underscores",
      passwordHint: "8-100 characters, must include uppercase letter, number, and special character",
    },
    hero: {
      title: "Create Content with Confidence",
      description: "Tathyaganga combines AI-powered fact-checking with professional content creation tools to help you produce accurate, engaging content."
    }
  },
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    settings: "Settings",
    darkMode: "Dark Mode",
    language: "Display Language",
    appName: "Tathyaganga",
    logo: "Tathyaganga Logo",
    delete: "Delete",
    cancel: "Cancel",
    back: "Back"
  },
  nav: {
    dashboard: "Dashboard",
    newContent: "New Content",
    settings: "Settings",
    logout: "Logout"
  },
  editor: {
    title: "Content Editor",
    newTitle: "Create New Content",
    editTitle: "Edit Content",
    saveButton: "Save",
    publishButton: "Publish",
    factCheck: "Fact Check",
    contentPlaceholder: "Start writing your content here...",
    titlePlaceholder: "Enter title...",
    titleLabel: "Title",
    contentLabel: "Content",
    wordCount: "Word count: {count}",
    wordsRequired: "words required",
    validation: {
      titleLength: "Title must be between 2 and 50 words",
      contentLength: "Content must be between 50 and 500 words",
    },
    messages: {
      saveSuccess: "Content saved successfully",
      saveError: "Error saving content",
      factCheckError: "Error checking facts",
      tryAgain: "Please try again later",
      factCheckServiceError: "Our fact-checking service is currently unavailable. Please try again in a few minutes.",
      factCheckNetworkError: "Network error while fact-checking. Please check your connection and try again."
    }
  },
  dashboard: {
    welcome: "Welcome, {username}",
    noContent: "No content yet",
    createFirstContent: "Create your first piece of content to get started",
    createContent: "Create Content",
    deleteTitle: "Delete Content",
    deleteConfirm: 'Are you sure you want to delete "{title}"? This action cannot be undone.',
    deleteSuccess: "Content deleted successfully",
    factCheckScore: "Score: {score}"
  }
};
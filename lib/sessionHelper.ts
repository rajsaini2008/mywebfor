/**
 * Helper functions for managing student session data
 * This provides a unified way to handle student identification
 * across both sessionStorage and NextAuth
 */

// Store student ID in sessionStorage
export const storeStudentId = (studentId: string): void => {
  try {
    if (!studentId) return;
    sessionStorage.setItem("current_user_id", studentId);
    console.log("Stored student ID in sessionStorage:", studentId);
  } catch (error) {
    console.error("Error storing student ID in sessionStorage:", error);
  }
};

// Store student email in sessionStorage
export const storeStudentEmail = (email: string): void => {
  try {
    if (!email) return;
    sessionStorage.setItem("current_user_email", email);
    console.log("Stored student email in sessionStorage:", email);
  } catch (error) {
    console.error("Error storing student email in sessionStorage:", error);
  }
};

// Get student ID from sessionStorage or nextAuth session
export const getStudentId = (sessionUserId?: string | null): string | null => {
  try {
    return sessionStorage.getItem("current_user_id") || sessionUserId || null;
  } catch (error) {
    console.error("Error getting student ID:", error);
    return sessionUserId || null;
  }
};

// Get student email from sessionStorage or nextAuth session
export const getStudentEmail = (sessionUserEmail?: string | null): string | null => {
  try {
    return sessionStorage.getItem("current_user_email") || sessionUserEmail || null;
  } catch (error) {
    console.error("Error getting student email:", error);
    return sessionUserEmail || null;
  }
};

// Clear student session data
export const clearStudentSession = (): void => {
  try {
    sessionStorage.removeItem("current_user_id");
    sessionStorage.removeItem("current_user_email");
    console.log("Cleared student session data");
  } catch (error) {
    console.error("Error clearing student session data:", error);
  }
}; 
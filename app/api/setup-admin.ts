import { ensureAdminExists } from "@/lib/seed-db";

// Run the admin setup immediately on server startup
(async () => {
  try {
    console.log("Setting up default admin user...");
    const result = await ensureAdminExists(true);
    if (result) {
      console.log("Default admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Failed to setup admin user:", error);
  }
})();

export {}; 
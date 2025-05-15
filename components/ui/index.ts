// Export UI components
// Only include what we're sure exists in this project
// Others can be added as needed

// Export all UI components
export * from "./button";
export * from "./card";
export * from "./checkbox";
export * from "./input";
export * from "./label";
export * from "./textarea";
export * from "./toast";
export * from "./tabs";

// Export TinyMCE wrapper as CKEditor for backward compatibility
import TinyMCEWrapper from "@/components/TinyMCEWrapper";
export const CKEditor = TinyMCEWrapper; 
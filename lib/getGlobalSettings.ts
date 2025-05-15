/**
 * This file contains the GlobalSettings interface used throughout the app
 * and utility for accessing settings
 */

// Define interface for global settings
export interface GlobalSettings {
  logo: string;
  favicon: string;
  websiteName: string;
  mobile: string;
  email: string;
  youtubeLink: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  [key: string]: string; // Allow any string key
}

// Default settings if database values are not available
export const defaultSettings: GlobalSettings = {
  logo: "",
  favicon: "",
  websiteName: "Krishna Computers",
  mobile: "9001203861, 9772225669",
  email: "krishna.computers.official2008@gmail.com",
  youtubeLink: "",
  facebookLink: "",
  instagramLink: "",
  twitterLink: ""
};

/**
 * Client-side function to fetch global settings from the API
 */
export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  try {
    const response = await fetch("/api/cms?section=global");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch global settings: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      const loadedSettings = { ...defaultSettings };
      
      // Convert array of CMS items to settings object
      data.data.forEach((item: any) => {
        if (item.key && typeof item.value === 'string' && 
            Object.keys(defaultSettings).includes(item.key)) {
          loadedSettings[item.key as keyof GlobalSettings] = item.value;
        }
      });
      
      return loadedSettings;
    }
    
    return { ...defaultSettings };
  } catch (error) {
    console.error("Error fetching global settings:", error);
    // Return default settings if there's an error
    return { ...defaultSettings };
  }
} 
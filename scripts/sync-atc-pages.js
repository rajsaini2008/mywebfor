const fs = require('fs');
const path = require('path');

// Configuration
const ADMIN_DIR = path.join('app', 'admin');
const ATC_DIR = path.join('app', 'atc');
const EXCLUDE_PAGES = ['login', 'layout.tsx', 'page.tsx'];

// Helper function to convert admin paths to ATC paths
function getAtcPath(adminPath) {
  return adminPath.replace(
    path.normalize(ADMIN_DIR), 
    path.normalize(ATC_DIR)
  );
}

// Helper function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Helper function to write a file
function writeFile(filePath, content) {
  // Create directory if it doesn't exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

// Helper function to find all files recursively
function findAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      findAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Helper function to modify admin file content for ATC
function modifyForAtc(content) {
  // Change paths from /admin/ to /atc/
  content = content.replace(/\/admin\//g, '/atc/');
  
  // Change references to admin to atc
  content = content.replace(/\"admin\"/g, '"atc"');
  
  // Fix potential auth issues
  if (content.includes('{ user }') || content.includes('{ userType }') || content.includes('{ isAuthenticated }')) {
    if (!content.includes('useAuth()')) {
      // Add import for useAuth if not already present
      content = content.replace(/import.*React.*from.*"react"/, 
        'import React from "react"\nimport { useAuth } from "@/lib/auth"');
    }
  }
  
  // Ensure centerId/atcId mapping
  if (content.includes('centerId') && !content.includes('atcId')) {
    // Add atcId mapping for API calls
    content = content.replace(/const response = await fetch\(`\/api\//g, 
      'const atcId = user?._id\n    const response = await fetch(`/api/');
    
    // Add atcId parameter to API calls
    content = content.replace(/fetch\(`\/api\/([^`]*)\`/g, 
      'fetch(`/api/$1${atcId ? `&atcId=${atcId}` : ""}`');
  }
  
  return content;
}

// Function to synchronize admin pages to ATC pages
function syncPages() {
  console.log(`Looking for admin pages in: ${ADMIN_DIR}`);
  
  // Get all admin pages
  const adminPages = findAllFiles(ADMIN_DIR);
  
  // Filter out excluded pages
  const filteredPages = adminPages.filter(page => {
    const baseName = path.basename(page);
    return !EXCLUDE_PAGES.some(exclude => baseName.includes(exclude));
  });
  
  console.log(`Found ${filteredPages.length} pages to synchronize`);
  
  // Process each page
  filteredPages.forEach(adminPath => {
    const atcPath = getAtcPath(adminPath);
    console.log(`Processing ${adminPath} -> ${atcPath}`);
    
    try {
      // Read admin page content
      const adminContent = readFile(adminPath);
      
      // Modify content for ATC
      const atcContent = modifyForAtc(adminContent);
      
      // Write to ATC path
      writeFile(atcPath, atcContent);
      console.log(`✓ Synchronized ${path.basename(adminPath)}`);
    } catch (error) {
      console.error(`Error processing ${adminPath}: ${error.message}`);
    }
  });
}

// Function to copy new admin pages to ATC
function copyNewPages() {
  // Get all admin pages
  const adminPages = findAllFiles(ADMIN_DIR);
  
  // Filter out excluded pages
  const filteredPages = adminPages.filter(page => {
    const baseName = path.basename(page);
    return !EXCLUDE_PAGES.some(exclude => baseName.includes(exclude));
  });
  
  // Count for new pages
  let newPagesCount = 0;
  
  // Process each page
  filteredPages.forEach(adminPath => {
    const atcPath = getAtcPath(adminPath);
    
    // Check if ATC page doesn't exist
    if (!fs.existsSync(atcPath)) {
      console.log(`New admin page found: ${adminPath}`);
      
      try {
        // Read admin page content
        const adminContent = readFile(adminPath);
        
        // Modify content for ATC
        const atcContent = modifyForAtc(adminContent);
        
        // Write to ATC path
        writeFile(atcPath, atcContent);
        console.log(`✓ Created new ATC page: ${atcPath}`);
        newPagesCount++;
      } catch (error) {
        console.error(`Error copying new page ${adminPath}: ${error.message}`);
      }
    }
  });
  
  console.log(`Created ${newPagesCount} new ATC pages`);
}

// Get current directory
const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// Run functions
console.log("Starting ATC page synchronization...");
syncPages();
copyNewPages();
console.log("Synchronization complete!"); 
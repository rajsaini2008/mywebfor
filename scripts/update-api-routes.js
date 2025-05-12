const fs = require('fs');
const path = require('path');

// Configuration
const API_DIR = path.join('app', 'api');

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
      if (file.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Helper function to read a file
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Helper function to write a file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
}

// Helper function to update an API route to handle atcId
function updateApiRoute(content) {
  // Check if the file already handles atcId
  if (content.includes('atcId = searchParams.get("atcId")')) {
    return content;
  }
  
  // Add atcId parameter after centerId
  content = content.replace(
    /const centerId = searchParams\.get\("centerId"\)/g,
    'const centerId = searchParams.get("centerId")\n    const atcId = searchParams.get("atcId")'
  );
  
  // Add atcId mapping to centerId
  content = content.replace(
    /if \(centerId\) {([^}]*)}/g,
    'if (centerId) {$1}\n    \n    // Map atcId to centerId if provided\n    if (atcId && !centerId) {\n      query.centerId = atcId\n    }'
  );
  
  return content;
}

// Function to update all API routes
function updateApiRoutes() {
  console.log(`Looking for API routes in: ${API_DIR}`);
  
  // Get all API route files
  const apiFiles = findAllFiles(API_DIR);
  
  console.log(`Found ${apiFiles.length} API route files`);
  
  let updatedCount = 0;
  
  // Process each file
  apiFiles.forEach(filePath => {
    // Skip auth routes
    if (filePath.includes('auth')) {
      return;
    }
    
    try {
      // Read file content
      const content = readFile(filePath);
      
      // Check if the file contains GET function and centerId parameter
      if (content.includes('export async function GET') && content.includes('centerId')) {
        console.log(`Processing ${filePath}`);
        
        // Update the file content
        const updatedContent = updateApiRoute(content);
        
        // If content was changed, write it back
        if (content !== updatedContent) {
          writeFile(filePath, updatedContent);
          console.log(`✓ Updated ${path.basename(filePath)}`);
          updatedCount++;
        } else {
          console.log(`- No changes needed for ${path.basename(filePath)}`);
        }
      }
    } catch (error) {
      console.error(`Error processing ${filePath}: ${error.message}`);
    }
  });
  
  console.log(`Updated ${updatedCount} API route files`);
}

// Get current directory
const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// Run the update function
console.log("Starting API route updates...");
updateApiRoutes();
console.log("API route updates complete!"); 
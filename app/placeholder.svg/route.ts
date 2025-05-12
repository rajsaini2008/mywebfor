import { NextRequest, NextResponse } from "next/server";

// Generate SVG placeholder with customizable parameters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get parameters with defaults
  const text = searchParams.get("text") || "Image";
  const width = parseInt(searchParams.get("width") || "400", 10);
  const height = parseInt(searchParams.get("height") || "400", 10);
  const bg = searchParams.get("bg") || "#e2e8f0"; // Light gray default
  const textColor = searchParams.get("color") || "#1a202c"; // Dark gray default
  
  // Generate unique patterns based on text or additional id parameter
  const uniqueId = searchParams.get("id") || text;
  const patternId = createHash(uniqueId);
  
  // Create SVG content with pattern background and text
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="pattern-${patternId}" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(45)">
          <rect width="100%" height="100%" fill="${bg}"/>
          <circle cx="25" cy="25" r="10" fill="${lightenColor(bg, 20)}" opacity="0.7"/>
          <rect x="5" y="5" width="20" height="20" fill="${darkenColor(bg, 10)}" opacity="0.3"/>
        </pattern>
      </defs>
      
      <rect width="${width}" height="${height}" fill="url(#pattern-${patternId})"/>
      
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${Math.min(width, height) / 10}px" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
        font-weight="bold"
      >
        ${text}
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}

// Helper function to create a deterministic hash from a string
function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 6);
}

// Helper function to lighten a color
function lightenColor(color: string, percent: number): string {
  if (color.startsWith('#')) {
    color = color.slice(1);
  }
  
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper function to darken a color
function darkenColor(color: string, percent: number): string {
  if (color.startsWith('#')) {
    color = color.slice(1);
  }
  
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
} 
import connectToDatabase from "@/lib/mongodb"
import CmsContent from "@/models/CmsContent"

// Default home page content
export const defaultHomeContent = {
  heroBanner: {
    title: "Welcome to Krishna Computers",
    subtitle: "Your Center for Quality IT Education and Training",
    buttonText: "Explore Courses",
    buttonLink: "/courses",
    imageUrl: "/images/hero-banner.jpg",
  },
  featureBoxes: [
    {
      title: "Professional Courses",
      description: "Comprehensive IT courses taught by industry professionals",
      iconName: "graduationCap",
    },
    {
      title: "Modern Facilities",
      description: "State-of-the-art computer labs and learning environments",
      iconName: "laptop",
    },
    {
      title: "Job Assistance",
      description: "Career guidance and placement assistance for all students",
      iconName: "briefcase",
    },
  ],
  welcomeSection: {
    title: "Welcome to Krishna Computers",
    description: "We are a leading computer training institute dedicated to providing quality education in the field of Information Technology. With experienced instructors and state-of-the-art facilities, we ensure that our students receive the best training possible to excel in their careers.",
    imageUrl: "/images/welcome-section.jpg",
  },
}

// Fetch home page content from the CMS
export async function getHomeContent() {
  try {
    await connectToDatabase()
    
    // Fetch all content for the "home" section
    const contentItems = await CmsContent.find({ section: "home" }).sort({ key: 1 })
    
    if (!contentItems || contentItems.length === 0) {
      return defaultHomeContent
    }
    
    // Process the hero banner data
    const heroBanner = {
      title: defaultHomeContent.heroBanner.title,
      subtitle: defaultHomeContent.heroBanner.subtitle,
      buttonText: defaultHomeContent.heroBanner.buttonText,
      buttonLink: defaultHomeContent.heroBanner.buttonLink,
      imageUrl: defaultHomeContent.heroBanner.imageUrl,
    }
    
    // Process the feature boxes data
    const featureBoxes = [...defaultHomeContent.featureBoxes]
    
    // Process the welcome section data
    const welcomeSection = {
      title: defaultHomeContent.welcomeSection.title,
      description: defaultHomeContent.welcomeSection.description,
      imageUrl: defaultHomeContent.welcomeSection.imageUrl,
    }
    
    // Map DB content to the expected structures
    contentItems.forEach(item => {
      if (item.key.startsWith('heroBanner_')) {
        const field = item.key.replace('heroBanner_', '')
        if (field in heroBanner) {
          heroBanner[field] = item.value
        }
      } else if (item.key.match(/^featureBox\d+_/)) {
        const matches = item.key.match(/^featureBox(\d+)_(.+)$/)
        if (matches) {
          const boxIndex = parseInt(matches[1]) - 1
          const field = matches[2]
          
          // Ensure the feature box exists at this index
          while (featureBoxes.length <= boxIndex) {
            featureBoxes.push({
              title: "",
              description: "",
              iconName: "",
            })
          }
          
          // Update the field
          if (field in featureBoxes[boxIndex]) {
            featureBoxes[boxIndex][field] = item.value
          }
        }
      } else if (item.key.startsWith('welcomeSection_')) {
        const field = item.key.replace('welcomeSection_', '')
        if (field in welcomeSection) {
          welcomeSection[field] = item.value
        }
      }
    })
    
    return {
      heroBanner,
      featureBoxes,
      welcomeSection,
    }
  } catch (error) {
    console.error("Error fetching home content:", error)
    return defaultHomeContent
  }
} 
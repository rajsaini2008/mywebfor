"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TinyMCEWrapper from "@/components/TinyMCEWrapper"
import { Trash2, Pencil, PlusCircle } from "lucide-react"
import * as z from "zod"

// Define the form schema for the hero section
const heroSectionSchema = z.object({
  heroTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  heroSubtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
});

// Define the form schema for the story section
const storySectionSchema = z.object({
  storyTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  storyContent1: z.string().min(10, { message: "Content must be at least 10 characters." }),
  storyContent2: z.string().min(10, { message: "Content must be at least 10 characters." }),
  storyContent3: z.string().min(10, { message: "Content must be at least 10 characters." }),
  storyButtonText: z.string().min(2, { message: "Button text must be at least 2 characters." }),
  storyImage: z.instanceof(File, { message: "Please select an image." }).optional(),
  currentStoryImageUrl: z.string().optional(),
});

// Define the form schema for the values section
const valuesSectionSchema = z.object({
  valuesTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  valuesSubtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
  value1Title: z.string().min(2, { message: "Value 1 title must be at least 2 characters." }),
  value1Description: z.string().min(10, { message: "Value 1 description must be at least 10 characters." }),
  value2Title: z.string().min(2, { message: "Value 2 title must be at least 2 characters." }),
  value2Description: z.string().min(10, { message: "Value 2 description must be at least 10 characters." }),
  value3Title: z.string().min(2, { message: "Value 3 title must be at least 2 characters." }),
  value3Description: z.string().min(10, { message: "Value 3 description must be at least 10 characters." }),
  value4Title: z.string().min(2, { message: "Value 4 title must be at least 2 characters." }),
  value4Description: z.string().min(10, { message: "Value 4 description must be at least 10 characters." }),
});

// Define the form schema for the why choose us section
const whyChooseSchema = z.object({
  whyChooseTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  whyChooseSubtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
  reason1: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason2: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason3: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason4: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason5: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason6: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason7: z.string().min(5, { message: "Reason must be at least 5 characters." }),
  reason8: z.string().min(5, { message: "Reason must be at least 5 characters." }),
});

// Define the form schema for team members
const teamMemberSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  position: z.string().min(2, { message: "Position must be at least 2 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageFile: z.instanceof(File, { message: "Please select an image." }).optional(),
  imageUrl: z.string().optional(),
  _id: z.string().optional(), // For editing existing members
});

// Define interface for CMS content item
interface CmsContentItem {
  section: string;
  key: string;
  value: string;
  _id: string;
}

// Define interface for Team Member
interface TeamMember {
  _id: string;
  name: string;
  position: string;
  description: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AboutPageEditor() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("heroSection")
  const [storyPreviewImage, setStoryPreviewImage] = useState<string | null>(null)
  
  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isEditingTeamMember, setIsEditingTeamMember] = useState(false)
  const [teamMemberPreviewImage, setTeamMemberPreviewImage] = useState<string | null>(null)
  
  // Hero section form
  const heroSectionForm = useForm<z.infer<typeof heroSectionSchema>>({
    resolver: zodResolver(heroSectionSchema),
    defaultValues: {
      heroTitle: "About Krishna Computers",
      heroSubtitle: "A leading computer education institute dedicated to empowering students with the skills they need to succeed in today's digital world.",
    },
  });

  // Story section form
  const storySectionForm = useForm<z.infer<typeof storySectionSchema>>({
    resolver: zodResolver(storySectionSchema),
    defaultValues: {
      storyTitle: "Our Story",
      storyContent1: "Founded in 2008, Krishna Computers has been at the forefront of computer education in Kaman, Rajasthan. What started as a small training center has now grown into a comprehensive institute offering a wide range of courses.",
      storyContent2: "Our journey has been defined by a commitment to quality education, innovative teaching methods, and a student-first approach. We have trained thousands of students who have gone on to build successful careers in the IT industry.",
      storyContent3: "At Krishna Computers, we believe in the power of education to transform lives and communities. Our mission is to make quality computer education accessible to all, regardless of their background or prior experience.",
      storyButtonText: "Learn More",
      currentStoryImageUrl: "",
    },
  });

  // Values section form
  const valuesSectionForm = useForm<z.infer<typeof valuesSectionSchema>>({
    resolver: zodResolver(valuesSectionSchema),
    defaultValues: {
      valuesTitle: "Our Values",
      valuesSubtitle: "The principles that guide everything we do at Krishna Computers",
      value1Title: "Quality Education",
      value1Description: "We are committed to providing the highest quality education with up-to-date curriculum.",
      value2Title: "Student-Centered",
      value2Description: "Our students are at the heart of everything we do, with personalized attention and support.",
      value3Title: "Innovation",
      value3Description: "We constantly innovate our teaching methods and curriculum to stay ahead of industry trends.",
      value4Title: "Excellence",
      value4Description: "We strive for excellence in all aspects of our operations, from teaching to administration.",
    },
  });

  // Why Choose Us form
  const whyChooseForm = useForm<z.infer<typeof whyChooseSchema>>({
    resolver: zodResolver(whyChooseSchema),
    defaultValues: {
      whyChooseTitle: "Why Choose Krishna Computers?",
      whyChooseSubtitle: "We offer more than just computer courses - we provide a pathway to success",
      reason1: "Experienced and qualified instructors",
      reason2: "State-of-the-art computer labs and facilities",
      reason3: "Comprehensive curriculum covering the latest technologies",
      reason4: "Hands-on practical training with real-world projects",
      reason5: "Flexible class timings to accommodate working professionals",
      reason6: "Placement assistance and career counseling",
      reason7: "Affordable fee structure with installment options",
      reason8: "Government recognized certifications",
    },
  });

  // Team member form
  const teamMemberForm = useForm<z.infer<typeof teamMemberSchema>>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: "",
      position: "",
      description: "",
      imageUrl: "",
    },
  });

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/cms?section=about");
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Create a map of keys to values
          const contentMap: Record<string, string> = {};
          data.data.forEach((item: CmsContentItem) => {
            contentMap[item.key] = item.value;
          });
          
          // Update hero section form values if data exists
          heroSectionForm.reset({
            heroTitle: contentMap["heroTitle"] || "About Krishna Computers",
            heroSubtitle: contentMap["heroSubtitle"] || "A leading computer education institute dedicated to empowering students with the skills they need to succeed in today's digital world.",
          });

          // Update story section form values if data exists
          storySectionForm.reset({
            storyTitle: contentMap["storyTitle"] || "Our Story",
            storyContent1: contentMap["storyContent1"] || "Founded in 2008, Krishna Computers has been at the forefront of computer education in Kaman, Rajasthan. What started as a small training center has now grown into a comprehensive institute offering a wide range of courses.",
            storyContent2: contentMap["storyContent2"] || "Our journey has been defined by a commitment to quality education, innovative teaching methods, and a student-first approach. We have trained thousands of students who have gone on to build successful careers in the IT industry.",
            storyContent3: contentMap["storyContent3"] || "At Krishna Computers, we believe in the power of education to transform lives and communities. Our mission is to make quality computer education accessible to all, regardless of their background or prior experience.",
            storyButtonText: contentMap["storyButtonText"] || "Learn More",
            currentStoryImageUrl: contentMap["storyImageUrl"] || "",
          });

          // Set the preview image if there's a story image URL
          if (contentMap["storyImageUrl"]) {
            setStoryPreviewImage(contentMap["storyImageUrl"]);
          }

          // Update values section form values if data exists
          valuesSectionForm.reset({
            valuesTitle: contentMap["valuesTitle"] || "Our Values",
            valuesSubtitle: contentMap["valuesSubtitle"] || "The principles that guide everything we do at Krishna Computers",
            value1Title: contentMap["value1Title"] || "Quality Education",
            value1Description: contentMap["value1Description"] || "We are committed to providing the highest quality education with up-to-date curriculum.",
            value2Title: contentMap["value2Title"] || "Student-Centered",
            value2Description: contentMap["value2Description"] || "Our students are at the heart of everything we do, with personalized attention and support.",
            value3Title: contentMap["value3Title"] || "Innovation",
            value3Description: contentMap["value3Description"] || "We constantly innovate our teaching methods and curriculum to stay ahead of industry trends.",
            value4Title: contentMap["value4Title"] || "Excellence",
            value4Description: contentMap["value4Description"] || "We strive for excellence in all aspects of our operations, from teaching to administration.",
          });

          // Update why choose us form values if data exists
          whyChooseForm.reset({
            whyChooseTitle: contentMap["whyChooseTitle"] || "Why Choose Krishna Computers?",
            whyChooseSubtitle: contentMap["whyChooseSubtitle"] || "We offer more than just computer courses - we provide a pathway to success",
            reason1: contentMap["reason1"] || "Experienced and qualified instructors",
            reason2: contentMap["reason2"] || "State-of-the-art computer labs and facilities",
            reason3: contentMap["reason3"] || "Comprehensive curriculum covering the latest technologies",
            reason4: contentMap["reason4"] || "Hands-on practical training with real-world projects",
            reason5: contentMap["reason5"] || "Flexible class timings to accommodate working professionals",
            reason6: contentMap["reason6"] || "Placement assistance and career counseling",
            reason7: contentMap["reason7"] || "Affordable fee structure with installment options",
            reason8: contentMap["reason8"] || "Government recognized certifications",
          });
        }
      } catch (error) {
        console.error("Error loading about page data:", error);
        toast({
          title: "Error",
          description: "Failed to load about page content. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [heroSectionForm, storySectionForm, valuesSectionForm, whyChooseForm, toast]);

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team");
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setTeamMembers(data.data);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchTeamMembers();
  }, [toast]);

  // Handle file change for story image
  const handleStoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      storySectionForm.setValue("storyImage", file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStoryPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save CMS content
  const saveCmsContent = async (section: string, data: Record<string, string>) => {
    for (const [key, value] of Object.entries(data)) {
      await fetch("/api/cms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          key,
          value,
        }),
      });
    }
  };

  // Handle hero section submit
  const onHeroSectionSubmit = async (values: z.infer<typeof heroSectionSchema>) => {
    setIsSubmitting(true);
    try {
      await saveCmsContent("about", {
        heroTitle: values.heroTitle,
        heroSubtitle: values.heroSubtitle,
      });
      
      toast({
        title: "Success",
        description: "Hero section updated successfully!",
      });
    } catch (error) {
      console.error("Error updating hero section:", error);
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle story section submit
  const onStorySectionSubmit = async (values: z.infer<typeof storySectionSchema>) => {
    setIsSubmitting(true);
    try {
      // Upload image if selected
      let storyImageUrl = values.currentStoryImageUrl || "";
      
      if (values.storyImage) {
        const formData = new FormData();
        formData.append('file', values.storyImage);
        formData.append('folder', 'cms/about');
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload story image");
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload story image");
        }
        
        storyImageUrl = uploadResult.urls[0];
      }
      
      await saveCmsContent("about", {
        storyTitle: values.storyTitle,
        storyContent1: values.storyContent1,
        storyContent2: values.storyContent2,
        storyContent3: values.storyContent3,
        storyButtonText: values.storyButtonText,
        storyImageUrl: storyImageUrl,
      });
      
      toast({
        title: "Success",
        description: "Story section updated successfully!",
      });
    } catch (error) {
      console.error("Error updating story section:", error);
      toast({
        title: "Error",
        description: "Failed to update story section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle values section submit
  const onValuesSectionSubmit = async (values: z.infer<typeof valuesSectionSchema>) => {
    setIsSubmitting(true);
    try {
      await saveCmsContent("about", {
        valuesTitle: values.valuesTitle,
        valuesSubtitle: values.valuesSubtitle,
        value1Title: values.value1Title,
        value1Description: values.value1Description,
        value2Title: values.value2Title,
        value2Description: values.value2Description,
        value3Title: values.value3Title,
        value3Description: values.value3Description,
        value4Title: values.value4Title,
        value4Description: values.value4Description,
      });
      
      toast({
        title: "Success",
        description: "Values section updated successfully!",
      });
    } catch (error) {
      console.error("Error updating values section:", error);
      toast({
        title: "Error",
        description: "Failed to update values section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle why choose us submit
  const onWhyChooseSubmit = async (values: z.infer<typeof whyChooseSchema>) => {
    setIsSubmitting(true);
    try {
      await saveCmsContent("about", {
        whyChooseTitle: values.whyChooseTitle,
        whyChooseSubtitle: values.whyChooseSubtitle,
        reason1: values.reason1,
        reason2: values.reason2,
        reason3: values.reason3,
        reason4: values.reason4,
        reason5: values.reason5,
        reason6: values.reason6,
        reason7: values.reason7,
        reason8: values.reason8,
      });
      
      toast({
        title: "Success",
        description: "Why Choose Us section updated successfully!",
      });
    } catch (error) {
      console.error("Error updating why choose us section:", error);
      toast({
        title: "Error",
        description: "Failed to update why choose us section. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file change for team member image
  const handleTeamMemberImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      teamMemberForm.setValue("imageFile", file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTeamMemberPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit team member
  const editTeamMember = (member: TeamMember) => {
    teamMemberForm.reset({
      name: member.name,
      position: member.position,
      description: member.description,
      imageUrl: member.imageUrl,
      _id: member._id,
    });
    
    setTeamMemberPreviewImage(member.imageUrl);
    setIsEditingTeamMember(true);
    setActiveTab("teamSection");
  };

  // Delete team member
  const deleteTeamMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    
    try {
      const response = await fetch(`/api/team?id=${id}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTeamMembers(teamMembers.filter(member => member._id !== id));
        
        toast({
          title: "Success",
          description: "Team member deleted successfully!",
        });
      } else {
        throw new Error(data.message || "Failed to delete team member");
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle team member submit
  const onTeamMemberSubmit = async (values: z.infer<typeof teamMemberSchema>) => {
    setIsSubmitting(true);
    try {
      // Upload image if selected
      let imageUrl = values.imageUrl || "";
      
      if (values.imageFile) {
        const formData = new FormData();
        formData.append('file', values.imageFile);
        formData.append('folder', 'cms/about/team');
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload team member image");
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload team member image");
        }
        
        imageUrl = uploadResult.urls[0];
      }
      
      const teamMemberData = {
        name: values.name,
        position: values.position,
        description: values.description,
        imageUrl: imageUrl,
        ...(values._id && { _id: values._id }), // Include ID if editing
      };
      
      // Determine whether to create or update
      const method = values._id ? "PUT" : "POST";
      
      const response = await fetch("/api/team", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teamMemberData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to save team member");
      }
      
      // Update local state
      if (values._id) {
        setTeamMembers(teamMembers.map(member => 
          member._id === values._id ? result.data : member
        ));
      } else {
        setTeamMembers([...teamMembers, result.data]);
      }
      
      // Reset form and state
      teamMemberForm.reset({
        name: "",
        position: "",
        description: "",
        imageUrl: "",
      });
      setTeamMemberPreviewImage(null);
      setIsEditingTeamMember(false);
      
      toast({
        title: "Success",
        description: `Team member ${values._id ? "updated" : "added"} successfully!`,
      });
    } catch (error) {
      console.error("Error saving team member:", error);
      toast({
        title: "Error",
        description: "Failed to save team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel team member edit
  const cancelTeamMemberEdit = () => {
    teamMemberForm.reset({
      name: "",
      position: "",
      description: "",
      imageUrl: "",
    });
    setTeamMemberPreviewImage(null);
    setIsEditingTeamMember(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">About Page Editor</h1>
        <Button onClick={() => router.push("/admin/cms")} variant="outline">
          Back to CMS
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="heroSection">Hero Section</TabsTrigger>
          <TabsTrigger value="storySection">Our Story</TabsTrigger>
          <TabsTrigger value="valuesSection">Our Values</TabsTrigger>
          <TabsTrigger value="whyChooseSection">Why Choose Us</TabsTrigger>
          <TabsTrigger value="teamSection">Our Team</TabsTrigger>
        </TabsList>

        {/* Hero Section Tab */}
        <TabsContent value="heroSection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Edit the hero section content that appears at the top of the about page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...heroSectionForm}>
                <form onSubmit={heroSectionForm.handleSubmit(onHeroSectionSubmit)} className="space-y-4">
                  <FormField
                    control={heroSectionForm.control}
                    name="heroTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hero title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={heroSectionForm.control}
                    name="heroSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hero Subtitle</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter hero subtitle"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Story Section Tab */}
        <TabsContent value="storySection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Our Story Section</CardTitle>
              <CardDescription>
                Edit the "Our Story" section content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...storySectionForm}>
                <form onSubmit={storySectionForm.handleSubmit(onStorySectionSubmit)} className="space-y-4">
                  <FormField
                    control={storySectionForm.control}
                    name="storyTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter section title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storySectionForm.control}
                    name="storyContent1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Paragraph 1</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter first paragraph"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storySectionForm.control}
                    name="storyContent2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Paragraph 2</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter second paragraph"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storySectionForm.control}
                    name="storyContent3"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Paragraph 3</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter third paragraph"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storySectionForm.control}
                    name="storyButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter button text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Story Image</FormLabel>
                    <div className="mt-2 mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleStoryImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                      />
                    </div>
                    {storyPreviewImage && (
                      <div className="mt-2 mb-4">
                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                        <img
                          src={storyPreviewImage}
                          alt="Story preview"
                          className="max-w-full h-auto max-h-[200px] rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Values Section Tab */}
        <TabsContent value="valuesSection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Our Values Section</CardTitle>
              <CardDescription>
                Edit the "Our Values" section content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...valuesSectionForm}>
                <form onSubmit={valuesSectionForm.handleSubmit(onValuesSectionSubmit)} className="space-y-4">
                  <FormField
                    control={valuesSectionForm.control}
                    name="valuesTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter section title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={valuesSectionForm.control}
                    name="valuesSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter section subtitle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-4">
                      <FormField
                        control={valuesSectionForm.control}
                        name="value1Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 1 Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={valuesSectionForm.control}
                        name="value1Description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 1 Description</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter value description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={valuesSectionForm.control}
                        name="value2Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 2 Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={valuesSectionForm.control}
                        name="value2Description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 2 Description</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter value description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={valuesSectionForm.control}
                        name="value3Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 3 Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={valuesSectionForm.control}
                        name="value3Description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 3 Description</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter value description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={valuesSectionForm.control}
                        name="value4Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 4 Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter value title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={valuesSectionForm.control}
                        name="value4Description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value 4 Description</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter value description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Us Tab */}
        <TabsContent value="whyChooseSection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Us Section</CardTitle>
              <CardDescription>
                Edit the "Why Choose Us" section content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...whyChooseForm}>
                <form onSubmit={whyChooseForm.handleSubmit(onWhyChooseSubmit)} className="space-y-4">
                  <FormField
                    control={whyChooseForm.control}
                    name="whyChooseTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter section title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={whyChooseForm.control}
                    name="whyChooseSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter section subtitle" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <FormField
                        key={num}
                        control={whyChooseForm.control}
                        name={`reason${num}` as keyof z.infer<typeof whyChooseSchema>}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason {num}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter reason ${num}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Section Tab */}
        <TabsContent value="teamSection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isEditingTeamMember ? "Edit Team Member" : "Add Team Member"}</CardTitle>
              <CardDescription>
                {isEditingTeamMember ? "Edit an existing team member's details." : "Add a new team member to your About Us page."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...teamMemberForm}>
                <form onSubmit={teamMemberForm.handleSubmit(onTeamMemberSubmit)} className="space-y-4">
                  <FormField
                    control={teamMemberForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team member's name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={teamMemberForm.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team member's position" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={teamMemberForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter team member description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Team Member Image</FormLabel>
                    <div className="mt-2 mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleTeamMemberImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90"
                      />
                    </div>
                    {teamMemberPreviewImage && (
                      <div className="mt-2 mb-4">
                        <p className="text-sm text-gray-500 mb-2">Preview:</p>
                        <img
                          src={teamMemberPreviewImage}
                          alt="Team member preview"
                          className="max-w-full h-auto max-h-[200px] rounded-md"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : isEditingTeamMember ? "Update Member" : "Add Member"}
                    </Button>
                    
                    {isEditingTeamMember && (
                      <Button type="button" variant="outline" onClick={cancelTeamMemberEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage the team members displayed on your About Us page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members added yet. Add your first team member above.
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div 
                      key={member._id} 
                      className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <img 
                          src={member.imageUrl} 
                          alt={member.name}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-blue-600">{member.position}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{member.description}</p>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editTeamMember(member)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteTeamMember(member._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
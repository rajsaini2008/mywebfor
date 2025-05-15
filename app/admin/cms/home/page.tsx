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
import { UploadCloud } from "lucide-react"
import * as z from "zod"

// Define the form schema for the main content
const mainContentSchema = z.object({
  bannerImage: z.instanceof(File, { message: "Please select a banner image." }).optional(),
  currentBannerUrl: z.string().optional(),
});

// Define the form schema for the about section
const aboutSectionSchema = z.object({
  aboutTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  aboutSubtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
  aboutContent: z.string().min(10, { message: "Content must be at least 10 characters." }),
  aboutButtonText: z.string().min(2, { message: "Button text must be at least 2 characters." }),
});

// Define the form schema for call to action
const ctaSchema = z.object({
  ctaTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  ctaContent: z.string().min(10, { message: "Content must be at least 10 characters." }),
  ctaButton1Text: z.string().min(2, { message: "Button 1 text must be at least 2 characters." }),
  ctaButton2Text: z.string().min(2, { message: "Button 2 text must be at least 2 characters." }),
});

// Define the form schema for feature boxes
const featureBoxesSchema = z.object({
  feature1Title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  feature1Content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  feature2Title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  feature2Content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  feature3Title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  feature3Content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  feature4Title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  feature4Content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

// Define the form schema for courses section
const courseSectionSchema = z.object({
  coursesTitle: z.string().min(2, { message: "Title must be at least 2 characters." }),
  coursesSubtitle: z.string().min(2, { message: "Subtitle must be at least 2 characters." }),
});

// Define interface for CMS content item
interface CmsContentItem {
  section: string;
  key: string;
  value: string;
  _id: string;
}

export default function HomePageEditor() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("mainContent")
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // Main content form
  const mainContentForm = useForm<z.infer<typeof mainContentSchema>>({
    resolver: zodResolver(mainContentSchema),
    defaultValues: {
      currentBannerUrl: "",
    },
  });

  // Feature boxes form
  const featureBoxesForm = useForm<z.infer<typeof featureBoxesSchema>>({
    resolver: zodResolver(featureBoxesSchema),
    defaultValues: {
      feature1Title: "Apply Online",
      feature1Content: "Ensuring quality and recognized technical education standards.",
      feature2Title: "Superfast Support",
      feature2Content: "Achieve digital success with our cutting edge computer institute courses.",
      feature3Title: "Certification",
      feature3Content: "Choose online or in person classes for flexibility.",
      feature4Title: "Online Payment",
      feature4Content: "Empowering minds through transformative computer institute education.",
    },
  });

  // About section form
  const aboutSectionForm = useForm<z.infer<typeof aboutSectionSchema>>({
    resolver: zodResolver(aboutSectionSchema),
    defaultValues: {
      aboutTitle: "ABOUT US",
      aboutSubtitle: "GIVE US A CHANCE AND SEE",
      aboutContent: "With experienced instructors and state-of-the-art facilities, We provide a dynamic learning environment that fosters innovation and creativity. Whether you are a beginner eager to start your journey in technology or a professional looking to enhance your skills.",
      aboutButtonText: "Learn More About Us",
    },
  });

  // Call to action form
  const ctaForm = useForm<z.infer<typeof ctaSchema>>({
    resolver: zodResolver(ctaSchema),
    defaultValues: {
      ctaTitle: "Ready to Start Your Career in IT?",
      ctaContent: "Join Krishna Computers today and take the first step towards a successful future in the digital world.",
      ctaButton1Text: "Apply Now",
      ctaButton2Text: "Contact Us",
    },
  });

  // Courses section form
  const courseSectionForm = useForm<z.infer<typeof courseSectionSchema>>({
    resolver: zodResolver(courseSectionSchema),
    defaultValues: {
      coursesTitle: "OUR COURSES",
      coursesSubtitle: "POPULAR COURSES WE OFFER",
    },
  });

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home page data
        const response = await fetch("/api/cms?section=home");
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Create a map of keys to values
          const contentMap: Record<string, string> = {};
          data.data.forEach((item: CmsContentItem) => {
            contentMap[item.key] = item.value;
          });
          
          // Update main content form values if data exists
          mainContentForm.reset({
            currentBannerUrl: contentMap["bannerUrl"] || "",
          });

          // Set the preview image if there's a banner URL
          if (contentMap["bannerUrl"]) {
            setPreviewImage(contentMap["bannerUrl"]);
          }

          // Update feature boxes form values if data exists
          featureBoxesForm.reset({
            feature1Title: contentMap["feature1Title"] || "Apply Online",
            feature1Content: contentMap["feature1Content"] || "Ensuring quality and recognized technical education standards.",
            feature2Title: contentMap["feature2Title"] || "Superfast Support",
            feature2Content: contentMap["feature2Content"] || "Achieve digital success with our cutting edge computer institute courses.",
            feature3Title: contentMap["feature3Title"] || "Certification",
            feature3Content: contentMap["feature3Content"] || "Choose online or in person classes for flexibility.",
            feature4Title: contentMap["feature4Title"] || "Online Payment",
            feature4Content: contentMap["feature4Content"] || "Empowering minds through transformative computer institute education.",
          });

          // Update about section form values if data exists
          aboutSectionForm.reset({
            aboutTitle: contentMap["aboutTitle"] || "ABOUT US",
            aboutSubtitle: contentMap["aboutSubtitle"] || "GIVE US A CHANCE AND SEE",
            aboutContent: contentMap["aboutContent"] || "With experienced instructors and state-of-the-art facilities...",
            aboutButtonText: contentMap["aboutButtonText"] || "Learn More About Us",
          });

          // Update CTA form values if data exists
          ctaForm.reset({
            ctaTitle: contentMap["ctaTitle"] || "Ready to Start Your Career in IT?",
            ctaContent: contentMap["ctaContent"] || "Join Krishna Computers today...",
            ctaButton1Text: contentMap["ctaButton1Text"] || "Apply Now",
            ctaButton2Text: contentMap["ctaButton2Text"] || "Contact Us",
          });

          // Update courses section form values if data exists
          courseSectionForm.reset({
            coursesTitle: contentMap["coursesTitle"] || "OUR COURSES",
            coursesSubtitle: contentMap["coursesSubtitle"] || "POPULAR COURSES WE OFFER",
          });
        }
      } catch (error) {
        console.error("Error loading home page data:", error);
        toast({
          title: "Error",
          description: "Failed to load home page content. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [mainContentForm, featureBoxesForm, aboutSectionForm, ctaForm, courseSectionForm, toast]);

  // Handle file change for banner image
  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      mainContentForm.setValue("bannerImage", file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle main content submit
  const onMainContentSubmit = async (values: z.infer<typeof mainContentSchema>) => {
    setIsSubmitting(true);
    try {
      if (values.bannerImage) {
        // Upload the banner image
        const formData = new FormData();
        formData.append('file', values.bannerImage);
        formData.append('folder', 'cms/home/banners');
        
        const uploadResponse = await fetch("/api/local-upload", {
          method: "POST",
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error("Failed to upload banner image");
        }
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload banner image");
        }
        
        // Save the banner URL to the database
        const response = await fetch("/api/cms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "home",
            key: "bannerUrl",
            value: uploadResult.url,
          }),
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to save banner URL");
        }
      }
      
      toast({
        title: "Success",
        description: "Banner updated successfully!",
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle about section submit
  const onAboutSectionSubmit = async (values: z.infer<typeof aboutSectionSchema>) => {
    setIsSubmitting(true);
    try {
      // Update each field one by one
      for (const [key, value] of Object.entries(values)) {
        const response = await fetch("/api/cms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "home",
            key,
            value,
          }),
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to save ${key}`);
        }
      }
      
      toast({
        title: "Success",
        description: "About section updated successfully!",
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CTA submit
  const onCtaSubmit = async (values: z.infer<typeof ctaSchema>) => {
    setIsSubmitting(true);
    try {
      // Update each field one by one
      for (const [key, value] of Object.entries(values)) {
        const response = await fetch("/api/cms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "home",
            key,
            value,
          }),
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to save ${key}`);
        }
      }
      
      toast({
        title: "Success",
        description: "Call to Action section updated successfully!",
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle feature boxes submit
  const onFeatureBoxesSubmit = async (values: z.infer<typeof featureBoxesSchema>) => {
    setIsSubmitting(true);
    try {
      // Update each field one by one
      for (const [key, value] of Object.entries(values)) {
        const response = await fetch("/api/cms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "home",
            key,
            value,
          }),
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to save ${key}`);
        }
      }
      
      toast({
        title: "Success",
        description: "Feature boxes updated successfully!",
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle courses section submit
  const onCourseSectionSubmit = async (values: z.infer<typeof courseSectionSchema>) => {
    setIsSubmitting(true);
    try {
      // Update each field one by one
      for (const [key, value] of Object.entries(values)) {
        const response = await fetch("/api/cms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: "home",
            key,
            value,
          }),
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || `Failed to save ${key}`);
        }
      }
      
      toast({
        title: "Success",
        description: "Courses section updated successfully!",
      });
      
      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 1000);
      
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Home Page Content</h1>
        <Button 
          onClick={() => router.push("/admin/cms")}
          variant="outline"
        >
          Back to CMS Panel
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="mainContent">Banner</TabsTrigger>
          <TabsTrigger value="featureBoxes">Feature Boxes</TabsTrigger>
          <TabsTrigger value="aboutSection">About Section</TabsTrigger>
          <TabsTrigger value="coursesSection">Courses Section</TabsTrigger>
          <TabsTrigger value="ctaSection">Call to Action</TabsTrigger>
        </TabsList>
        
        <TabsContent value="mainContent">
          <Card>
            <CardHeader>
              <CardTitle>Banner Image</CardTitle>
              <CardDescription>
                Upload the banner image that appears at the top of the home page. 
                The image will be displayed at its full width, maintaining its original aspect ratio.
                For best results, use a landscape orientation image with a width of at least 1200px.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...mainContentForm}>
                <form onSubmit={mainContentForm.handleSubmit(onMainContentSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormItem>
                      <FormLabel>Banner Image</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={handleBannerImageChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    
                    {previewImage && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="relative max-w-full h-auto overflow-hidden rounded-md border">
                          <img
                            src={previewImage}
                            alt="Banner preview"
                            className="max-w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featureBoxes">
          <Card>
            <CardHeader>
              <CardTitle>Feature Boxes</CardTitle>
              <CardDescription>
                Edit the feature boxes displayed on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...featureBoxesForm}>
                <form onSubmit={featureBoxesForm.handleSubmit(onFeatureBoxesSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Feature Box 1 */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-medium">Feature Box 1</h3>
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature1Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature1Content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Feature Box 2 */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-medium">Feature Box 2</h3>
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature2Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature2Content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Feature Box 3 */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-medium">Feature Box 3</h3>
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature3Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature3Content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Feature Box 4 */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <h3 className="font-medium">Feature Box 4</h3>
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature4Title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter title" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={featureBoxesForm.control}
                        name="feature4Content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <TinyMCEWrapper
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter content"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aboutSection">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>
                Edit the about section content on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aboutSectionForm}>
                <form onSubmit={aboutSectionForm.handleSubmit(onAboutSectionSubmit)} className="space-y-6">
                  <FormField
                    control={aboutSectionForm.control}
                    name="aboutTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter section title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aboutSectionForm.control}
                    name="aboutSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter section subtitle" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aboutSectionForm.control}
                    name="aboutContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter section content"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={aboutSectionForm.control}
                    name="aboutButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter button text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coursesSection">
          <Card>
            <CardHeader>
              <CardTitle>Courses Section</CardTitle>
              <CardDescription>
                Edit the courses section headings on the home page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...courseSectionForm}>
                <form onSubmit={courseSectionForm.handleSubmit(onCourseSectionSubmit)} className="space-y-6">
                  <FormField
                    control={courseSectionForm.control}
                    name="coursesTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter section title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={courseSectionForm.control}
                    name="coursesSubtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Subtitle</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter section subtitle" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ctaSection">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
              <CardDescription>
                Edit the call to action section at the bottom of the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ctaForm}>
                <form onSubmit={ctaForm.handleSubmit(onCtaSubmit)} className="space-y-6">
                  <FormField
                    control={ctaForm.control}
                    name="ctaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={ctaForm.control}
                    name="ctaContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <TinyMCEWrapper
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Enter CTA description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={ctaForm.control}
                      name="ctaButton1Text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter first button text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={ctaForm.control}
                      name="ctaButton2Text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Second Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter second button text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
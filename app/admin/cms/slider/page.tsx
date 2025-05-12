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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
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
import * as z from "zod"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

// Define the form schema
const sliderFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  boxDescription: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  boxTitle1: z.string().min(2, {
    message: "Box title must be at least 2 characters.",
  }),
  boxDescription1: z.string().min(10, {
    message: "Box description must be at least 10 characters.",
  }),
  boxTitle2: z.string().optional(),
  boxDescription2: z.string().optional(),
});

export default function SliderEditor() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("slider1")
  
  // Define form
  const form = useForm<z.infer<typeof sliderFormSchema>>({
    resolver: zodResolver(sliderFormSchema),
    defaultValues: {
      title: "Give us a chance and see",
      boxDescription: "With experienced instructors and state-of-the-art facilities, We provide a dynamic learning environment that fosters innovation and creativity. Whether you are a beginner eager to start your journey in technology or a professional looking to enhance your skills",
      boxTitle1: "Experienced IT",
      boxDescription1: "Industry leading instructors ensuring top-quality education",
      boxTitle2: "",
      boxDescription2: "",
    },
  })

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch slider data from API
        const response = await fetch("/api/cms/slider");
        const data = await response.json();
        
        if (data.success && data.data && data.data["1"]) {
          const slider1 = data.data["1"];
          form.reset({
            title: slider1.title || "Give us a chance and see",
            boxDescription: slider1.boxDescription || "With experienced instructors and state-of-the-art facilities, We provide a dynamic learning environment that fosters innovation and creativity. Whether you are a beginner eager to start your journey in technology or a professional looking to enhance your skills",
            boxTitle1: slider1.boxTitle1 || "Experienced IT",
            boxDescription1: slider1.boxDescription1 || "Industry leading instructors ensuring top-quality education",
            boxTitle2: slider1.boxTitle2 || "",
            boxDescription2: slider1.boxDescription2 || "",
          });
        }
      } catch (error) {
        console.error("Error loading slider data:", error);
        toast({
          title: "Error",
          description: "Failed to load slider content. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [form, toast]);

  const onSubmit = async (values: z.infer<typeof sliderFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Save data to API
      const response = await fetch("/api/cms/slider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sliderId: activeTab === "slider1" ? "1" : 
                    activeTab === "slider2" ? "2" : "3",
          ...values
        }),
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to save slider content");
      }
      
      toast({
        title: "Success",
        description: "Slider content updated successfully!",
      });
      
    } catch (error) {
      console.error("Error saving slider data:", error);
      toast({
        title: "Error",
        description: "Failed to save slider content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Slider Content</h1>
        <Button 
          onClick={() => router.push("/admin/cms")}
          variant="outline"
        >
          Back to CMS Panel
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="slider1">Slider 1</TabsTrigger>
          <TabsTrigger value="slider2">Slider 2</TabsTrigger>
          <TabsTrigger value="slider3">Slider 3</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slider1">
          <Card>
            <CardHeader>
              <CardTitle>About Us Content</CardTitle>
              <CardDescription>
                Edit the slider text that appears on the About Us section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="boxDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Box Description *</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="boxTitle1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Box Title 1 *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter box title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="boxDescription1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Box Description 1 *</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter box description"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="boxTitle2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Box Title 2</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter box title (optional)" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="boxDescription2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Box Description 2</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter box description (optional)"
                            rows={3}
                          />
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
        
        <TabsContent value="slider2">
          <Card>
            <CardHeader>
              <CardTitle>Slider 2</CardTitle>
              <CardDescription>
                Content for the second slider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Please configure Slider 2 content here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="slider3">
          <Card>
            <CardHeader>
              <CardTitle>Slider 3</CardTitle>
              <CardDescription>
                Content for the third slider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Please configure Slider 3 content here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
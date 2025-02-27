import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Content, insertContentSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Editor from "@/components/editor";
import { useEffect } from "react";
import { z } from "zod";

// Helper function to count words
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Extended schema with word count validation
const formSchema = insertContentSchema.extend({
  title: z.string()
    .refine(
      (title) => {
        const wordCount = countWords(title);
        return wordCount >= 2 && wordCount <= 50;
      },
      "Title must be between 2 and 50 words"
    ),
  content: z.string()
    .refine(
      (content) => {
        const wordCount = countWords(content);
        return wordCount >= 50 && wordCount <= 500;
      },
      "Content must be between 50 and 500 words"
    )
});

type FormValues = z.infer<typeof formSchema>;

export default function EditorPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: content, isLoading: isLoadingContent } = useQuery<Content>({
    queryKey: id ? [`/api/contents/${id}`] : [],
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      status: "draft",
    },
    mode: "onChange", // Enable real-time validation
  });

  // Get form state for validation
  const { isValid } = form.formState;

  // Update form values when content is loaded
  useEffect(() => {
    if (content) {
      form.reset({
        title: content.title,
        content: content.content,
        status: content.status,
      }, {
        keepDefaultValues: false
      });
    }
  }, [content, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await apiRequest(
        id ? "PATCH" : "POST",
        id ? `/api/contents/${id}` : "/api/contents",
        values
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: [`/api/contents/${id}`] });
      }
      toast({
        title: "Success",
        description: "Content saved successfully",
      });
      setLocation("/"); // Redirect to home page after successful save
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving content",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const factCheckMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/fact-check", { content });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: `Fact Check Score: ${data.score}`,
        description: data.explanation,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error checking facts",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: FormValues) {
    await saveMutation.mutateAsync(values);
  }

  if (isLoadingContent) {
    return (
      <div className="min-h-screen pt-16">
        <main className="p-8">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <main className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {id ? "Edit Content" : "New Content"}
          </h1>
        </div>

        <Card className="p-6 max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Word count: {countWords(field.value)} (2-50 words required)
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Editor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Word count: {countWords(field.value)} (50-500 words required)
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const content = form.getValues("content");
                    factCheckMutation.mutate(content);
                  }}
                  disabled={!isValid || factCheckMutation.isPending}
                >
                  {factCheckMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Fact Check
                </Button>

                <Button type="submit" disabled={!isValid || saveMutation.isPending}>
                  {saveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
}
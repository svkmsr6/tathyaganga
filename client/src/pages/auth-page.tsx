import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { t } = useTranslations();

  // Redirect if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {t('auth.welcome')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">{t('auth.form.loginButton')}</TabsTrigger>
                <TabsTrigger value="register">{t('auth.form.registerButton')}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Hero Section */}
      <div 
        className="hidden lg:flex flex-1 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1496664444929-8c75efb9546f')" }}
      >
        <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50 p-12">
          <div className="max-w-lg text-white">
            <h1 className="text-4xl font-bold mb-4">
              {t('auth.hero.title')}
            </h1>
            <p className="text-lg opacity-90">
              {t('auth.hero.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: { username: string; password: string }) {
    try {
      await loginMutation.mutateAsync(values);
      toast({
        title: t('auth.login.success'),
        description: t('auth.login.successMessage'),
      });
    } catch (error) {
      // Error is already handled by the mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.form.username')}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="username" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.form.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('auth.form.loginButton')
          )}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslations();

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  async function onSubmit(values: { username: string; password: string }) {
    try {
      await registerMutation.mutateAsync(values);
      toast({
        title: t('auth.register.success'),
        description: t('auth.register.successMessage'),
      });
    } catch (error) {
      // Error is already handled by the mutation
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.form.username')}</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="username" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {t('auth.form.usernameHint')}
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.form.password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} autoComplete="new-password" />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                {t('auth.form.passwordHint')}
              </p>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('auth.form.registerButton')
          )}
        </Button>
      </form>
    </Form>
  );
}
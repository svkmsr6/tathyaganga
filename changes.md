# Changes for GitHub Pull Request

## 1. shared/schema.ts
Enhanced user validation with password strength and username format requirements:

```typescript
// Enhanced user schema with strong validation
export const insertUserSchema = createInsertSchema(users)
  .extend({
    username: z.string()
      .min(5, "Username must be at least 5 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Username must start with a letter and can only contain letters, numbers, and underscores"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be at most 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")
      .refine(
        (password) => {
          // Additional entropy check - at least 3 character types
          const hasUpper = /[A-Z]/.test(password);
          const hasLower = /[a-z]/.test(password);
          const hasNumber = /[0-9]/.test(password);
          const hasSpecial = /[^a-zA-Z0-9]/.test(password);
          const characterTypes = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
          return characterTypes >= 3;
        },
        "Password must use at least 3 different types of characters (uppercase, lowercase, numbers, special characters)"
      ),
  });
```

## 2. client/src/hooks/use-auth.tsx
Improved error handling with professional error messages:

```typescript
const loginMutation = useMutation({
  mutationFn: async (credentials: LoginData) => {
    const res = await apiRequest("POST", "/api/login", credentials);
    if (!res.ok) {
      // Always throw a generic error, regardless of server response
      throw new Error("Login failed");
    }
    return await res.json();
  },
  onSuccess: (user: SelectUser) => {
    queryClient.setQueryData(["/api/user"], user);
    toast({
      title: "Welcome back!",
      description: "Successfully logged in to your account.",
    });
  },
  onError: () => {
    toast({
      title: "Unable to Log In",
      description: "The username or password you entered is incorrect. Please verify your credentials and try again.",
      variant: "destructive",
    });
  },
});
```

## 3. server/auth.ts
Professional error messages for authentication endpoints:

```typescript
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        error: "Login failed",
        message: info?.message || "Invalid credentials. Please check your username and password."
      });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json(user);
    });
  })(req, res, next);
});

app.get("/api/user", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource."
    });
  }
  res.json(req.user);
});
```

## 4. client/src/pages/auth-page.tsx
Updated form validations with helpful instructions:

```typescript
// In RegisterForm component
<FormField
  control={form.control}
  name="username"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Username</FormLabel>
      <FormControl>
        <Input {...field} autoComplete="username" />
      </FormControl>
      <FormMessage />
      <p className="text-xs text-muted-foreground">
        5-20 characters, must start with a letter, can contain letters, numbers, and underscores
      </p>
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <Input type="password" {...field} autoComplete="new-password" />
      </FormControl>
      <FormMessage />
      <p className="text-xs text-muted-foreground">
        8-100 characters, must include uppercase letter, number, and special character
      </p>
    </FormItem>
  )}
/>
```

To implement these changes in your GitHub repository:

1. Create a new branch (e.g., `feature/auth-improvements`)
2. Apply these changes to the corresponding files
3. Commit with a descriptive message like "Enhance authentication with improved validation and error handling"
4. Create a pull request to merge into main

The changes focus on:
- Strong password and username validation
- Professional error messages
- Improved user feedback
- Better form validation UI
- Enhanced security practices

Would you like me to explain any part of these changes in more detail?

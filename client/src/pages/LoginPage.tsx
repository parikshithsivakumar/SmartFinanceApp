import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useLogin } from "@/hooks/use-auth-simple";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingOverlay from "@/components/LoadingOverlay";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const login = useLogin();
  const [error, setError] = useState("");
  const isLoading = login.isPending;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setError("");
      await login.mutateAsync({
        email: values.email,
        password: values.password
      });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-container bg-cover bg-center" 
         style={{ backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')" }}>
      {isLoading && <LoadingOverlay />}
      
      <div className="container max-w-md mx-auto p-6">
        <Card className="rounded-xl shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Smart Finance</h1>
              <p className="text-gray-500">Finance & Legal Insight System</p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                            id="remember-me"
                          />
                        </FormControl>
                        <label 
                          htmlFor="remember-me" 
                          className="text-sm font-medium leading-none text-gray-700 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </FormItem>
                    )}
                  />
                  
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot password?
                    </a>
                  </div>
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">
                    {error}
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                  disabled={isLoading}
                >
                  Sign in
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                  Register now
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Chrome, Loader2, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  // Contractor-specific fields (optional)
  companyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  insuranceNumber: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  description: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.password.length >= 6, {
  message: "Password must be at least 6 characters long",
  path: ["password"],
}).refine((data) => {
  // If user is a contractor, require contractor-specific fields
  if (data.userType === "contractor") {
    return data.companyName && data.specialties && data.specialties.length > 0 && data.experienceYears !== undefined && data.description;
  }
  return true;
}, {
  message: "Please fill in all required contractor fields",
  path: ["companyName"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

interface AuthModalProps {
  children: React.ReactNode;
}

export default function AuthModal({ children }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>({ email: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    userType: "homeowner",
    companyName: "",
    licenseNumber: "",
    insuranceNumber: "",
    specialties: [],
    experienceYears: 0,
    description: "",
  });

  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const { signInWithGoogle, isLoading: googleLoading, isFirebaseConfigured } = useGoogleAuth();

  // Close modal when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setOpen(false);
    }
  }, [isAuthenticated]);

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      login(data.user);
      setOpen(false);
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
      // Reset form
      setLoginData({ email: "", password: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const { confirmPassword, ...userData } = data;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      return result;
    },
    onSuccess: (data) => {
      login(data.user);
      setOpen(false);
      toast({
        title: "Account Created!",
        description: "Welcome to HomeConnect Pro! Your account has been created successfully.",
      });
      // Reset form
      setRegisterData({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        userType: "homeowner",
        companyName: "",
        licenseNumber: "",
        insuranceNumber: "",
        specialties: [],
        experienceYears: 0,
        description: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = loginSchema.parse(loginData);
      loginMutation.mutate(validatedData);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = registerSchema.parse(registerData);
      registerMutation.mutate(validatedData);
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      toast({
        title: "Google Sign-In Unavailable",
        description: "Google authentication is currently being set up. Please use email/password to sign in.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await signInWithGoogle();
      // Modal will close automatically when authentication succeeds
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to HomeConnect Pro</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to get started with your renovation projects.
          </DialogDescription>
        </DialogHeader>
        
        {/* Google Sign In Button */}
        <Button 
          onClick={handleGoogleSignIn}
          variant="outline" 
          className="w-full mb-4 border-gray-300 hover:bg-gray-50"
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4 text-blue-500" />
          )}
          {googleLoading ? "Signing in with Google..." : "Continue with Google"}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
        
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">First Name *</Label>
                  <Input
                    id="register-firstName"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    placeholder="John"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Last Name *</Label>
                  <Input
                    id="register-lastName"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-email">Email *</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-username">Username *</Label>
                <Input
                  id="register-username"
                  value={registerData.username}
                  onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                  placeholder="johndoe"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password *</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-userType">I am a *</Label>
                <Select
                  value={registerData.userType}
                  onValueChange={(value) => setRegisterData({ ...registerData, userType: value as "homeowner" | "contractor" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homeowner">Homeowner - I need renovation work done</SelectItem>
                    <SelectItem value="contractor">Contractor - I provide renovation services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contractor-specific fields */}
              {registerData.userType === "contractor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="register-companyName">Company Name *</Label>
                    <Input
                      id="register-companyName"
                      value={registerData.companyName}
                      onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                      placeholder="ABC Construction LLC"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-licenseNumber">License Number</Label>
                      <Input
                        id="register-licenseNumber"
                        value={registerData.licenseNumber}
                        onChange={(e) => setRegisterData({ ...registerData, licenseNumber: e.target.value })}
                        placeholder="LIC123456"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-insuranceNumber">Insurance Number</Label>
                      <Input
                        id="register-insuranceNumber"
                        value={registerData.insuranceNumber}
                        onChange={(e) => setRegisterData({ ...registerData, insuranceNumber: e.target.value })}
                        placeholder="INS789012"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-specialties">Specialties *</Label>
                    <Input
                      id="register-specialties"
                      value={(registerData.specialties || []).join(", ")}
                      onChange={(e) => setRegisterData({ 
                        ...registerData, 
                        specialties: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                      })}
                      placeholder="Kitchen Remodeling, Bathroom Renovation, Flooring"
                      required
                    />
                    <p className="text-sm text-gray-500">Separate multiple specialties with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-experienceYears">Years of Experience *</Label>
                    <Input
                      id="register-experienceYears"
                      type="number"
                      min="0"
                      value={registerData.experienceYears}
                      onChange={(e) => setRegisterData({ ...registerData, experienceYears: parseInt(e.target.value) || 0 })}
                      placeholder="5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-description">Business Description *</Label>
                    <textarea
                      id="register-description"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={registerData.description}
                      onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
                      placeholder="Tell homeowners about your business, services, and what makes you unique..."
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone</Label>
                <Input
                  id="register-phone"
                  type="tel"
                  value={registerData.phone ?? ""}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-address">Address</Label>
                <Input
                  id="register-address"
                  value={registerData.address ?? ""}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-city">City</Label>
                  <Input
                    id="register-city"
                    value={registerData.city ?? ""}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-state">State</Label>
                  <Input
                    id="register-state"
                    value={registerData.state ?? ""}
                    onChange={(e) => setRegisterData({ ...registerData, state: e.target.value })}
                    placeholder="NY"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-zipCode">ZIP Code</Label>
                  <Input
                    id="register-zipCode"
                    value={registerData.zipCode ?? ""}
                    onChange={(e) => setRegisterData({ ...registerData, zipCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
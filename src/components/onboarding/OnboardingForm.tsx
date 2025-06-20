// src/components/onboarding/OnboardingForm.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Phone, CalendarDays } from "lucide-react";
import type { UserProfile } from "@/types/user";

export const OnboardingForm = () => {
  const { user, saveOnboardingProfile, isLoadingAuth, isLoadingProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // Stored as "YYYY-MM-DD"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      router.push("/auth");
      return;
    }
    if (!displayName.trim()) {
      toast({ title: "Validation Error", description: "Full name is required.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const profileData: Partial<UserProfile> = {
        displayName,
        phoneNumber: phoneNumber || undefined, 
        dateOfBirth: dateOfBirth || undefined,
      };
      await saveOnboardingProfile(profileData);
      toast({ title: "Welcome!", description: "Your profile has been set up." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ title: "Onboarding Failed", description: error.message || "Could not save profile.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallLoading = isSubmitting || isLoadingAuth || isLoadingProfile;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4 sm:p-8 antialiased">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl border-border/70 bg-card">
        <CardHeader className="text-center pt-8 pb-6">
          <CardTitle className="text-3xl font-bold text-foreground font-headline">Tell Us About Yourself</CardTitle>
          <CardDescription className="text-muted-foreground font-body text-base">
            Just a few more details to personalize your Blisszits experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="displayName" className="font-medium">Full Name <span className="text-destructive">*</span></Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="e.g., Adaeze Nwosu"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="pl-10 pr-3 py-2.5 bg-input border-border focus:border-primary"
                  disabled={overallLoading}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="font-medium">Phone Number (Optional)</Label>
               <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 pr-3 py-2.5 bg-input border-border focus:border-primary"
                  disabled={overallLoading}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth" className="font-medium">Date of Birth (Optional)</Label>
              <div className="relative mt-1">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="pl-10 pr-3 py-2.5 bg-input border-border focus:border-primary appearance-none" // appearance-none for better date input styling control
                  disabled={overallLoading}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full font-semibold py-3 text-base shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={overallLoading}
            >
              {overallLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
         <CardFooter className="px-6 md:px-8 pb-8 pt-4">
          <p className="text-xs text-muted-foreground/80 text-center w-full font-body">
            You can update these details later in your settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

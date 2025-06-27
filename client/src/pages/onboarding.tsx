import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker } from "@/components/onboarding/LocationPicker";
import { Heart, Sparkles, Globe, Users, ArrowRight, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { value: "spanish", label: "Spanish", emoji: "🇪🇸" },
  { value: "english", label: "English", emoji: "🇺🇸" },
  { value: "italian", label: "Italian", emoji: "🇮🇹" },
  { value: "french", label: "French", emoji: "🇫🇷" },
  { value: "german", label: "German", emoji: "🇩🇪" },
  { value: "portuguese", label: "Portuguese", emoji: "🇵🇹" },
  { value: "russian", label: "Russian", emoji: "🇷🇺" },
  { value: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { value: "chinese", label: "Chinese (Mandarin)", emoji: "🇨🇳" },
  { value: "arabic", label: "Arabic", emoji: "🇸🇦" },
  { value: "dutch", label: "Dutch", emoji: "🇳🇱" },
  { value: "swedish", label: "Swedish", emoji: "🇸🇪" },
  { value: "norwegian", label: "Norwegian", emoji: "🇳🇴" },
  { value: "polish", label: "Polish", emoji: "🇵🇱" },
  { value: "korean", label: "Korean", emoji: "🇰🇷" },
  { value: "hindi", label: "Hindi", emoji: "🇮🇳" },
  { value: "turkish", label: "Turkish", emoji: "🇹🇷" },
  { value: "hebrew", label: "Hebrew", emoji: "🇮🇱" },
  { value: "greek", label: "Greek", emoji: "🇬🇷" },
  { value: "czech", label: "Czech", emoji: "🇨🇿" },
];

const tangoRoles = [
  { value: "dancer", label: "Dancer", emoji: "💃", description: "Social dancers seeking partners and events" },
  { value: "dj", label: "DJ", emoji: "🎵", description: "Music curators setting the mood for milongas" },
  { value: "teacher", label: "Teacher", emoji: "📚", description: "Instructors offering classes and workshops" },
  { value: "performer", label: "Performer", emoji: "⭐", description: "Artists sharing tango through shows and festivals" },
  { value: "organizer", label: "Organizer", emoji: "🎪", description: "Event planners managing milongas and festivals" },
  { value: "creator", label: "Creator", emoji: "🎨", description: "Artisans making tango-related products and art" },
  { value: "volunteer", label: "Volunteer", emoji: "🤝", description: "Community supporters helping at events" },
  { value: "host", label: "Housing Host", emoji: "🏠", description: "Hosts welcoming traveling dancers" },
  { value: "photographer", label: "Photographer", emoji: "📸", description: "Visual storytellers capturing tango moments" },
  { value: "traveler", label: "Traveler/Nomadic", emoji: "🌍", description: "Nomadic dancers exploring global tango scenes" },
  { value: "taxi", label: "Taxi Dancer", emoji: "🚕", description: "Professional dance partners" },
  { value: "musician", label: "Musician", emoji: "🎼", description: "Live music performers" },
  { value: "content", label: "Content Creator", emoji: "🎙️", description: "Podcasters, YouTubers, article writers sharing tango stories" },
  { value: "historian", label: "Historian", emoji: "📜", description: "Cultural preservationists documenting tango heritage" },
  { value: "school", label: "Tango School", emoji: "📚", description: "A hub for classes, teachers, and learning" },
];

const onboardingSchema = z.object({
  nickname: z.string().min(1, "Nickname is required").max(50, "Nickname too long"),
  languages: z.array(z.string()).min(1, "Select at least one language"),
  tangoRoles: z.array(z.string()).min(1, "Select at least one tango role"),
  location: z.object({
    country: z.string().min(1, "Country is required"),
    state: z.string(),
    city: z.string(),
    countryCode: z.string(),
    stateCode: z.string(),
  }),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nickname: "",
      languages: ["english"],
      tangoRoles: [],
      location: {
        country: "",
        state: "",
        city: "",
        countryCode: "",
        stateCode: "",
      },
    },
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      return apiRequest("/api/onboarding", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Mundo Tango!",
        description: "Your profile has been set up successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/user";
    },
    onError: (error) => {
      toast({
        title: "Setup Error",
        description: "There was an issue setting up your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingData) => {
    onboardingMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Mundo Tango!</h2>
              <p className="text-gray-600">What do you want to be called in the milonga?</p>
            </div>
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700">Your Nickname</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="How should we call you?"
                      className="text-lg p-4 border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">What languages do you speak?</h2>
              <p className="text-gray-600">Help us connect you with the right community</p>
            </div>
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700">Languages</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={languages}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select languages you speak..."
                      className="border-2 border-cyan-200 focus:border-cyan-500 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-teal-500" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Your role in tango 🎭</h2>
              <p className="text-gray-600">Select all roles that describe you in the tango community</p>
            </div>
            <FormField
              control={form.control}
              name="tangoRoles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700">What do you do in tango?</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={tangoRoles}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder="Select your tango roles..."
                      className="border-2 border-teal-200 focus:border-teal-500 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Where are you located?</h2>
              <p className="text-gray-600">Help us connect you with local tango events and communities</p>
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-700">Your Location</FormLabel>
                  <FormControl>
                    <LocationPicker
                      value={field.value}
                      onChange={field.onChange}
                      className="border-2 border-blue-200 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Mundo Tango
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step < currentStep ? 'bg-green-500 text-white' :
                  step === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 mx-2 ${
                    step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {renderStepContent()}

              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-8 py-3 rounded-xl"
                >
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={onboardingMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-3 rounded-xl flex items-center gap-2"
                  >
                    {onboardingMutation.isPending ? "Setting up..." : "Complete Setup"}
                    <Sparkles className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
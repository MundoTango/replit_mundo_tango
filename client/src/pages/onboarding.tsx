import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker } from "@/components/onboarding/LocationPicker";
import { Heart, Sparkles, Globe, Users } from "lucide-react";
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
  { value: "student", label: "Student/Beginner", emoji: "🎓", description: "New to tango, eager to learn and grow" },
  { value: "musician", label: "Musician", emoji: "🎼", description: "Musicians playing for tango events" },
  { value: "promoter", label: "Promoter", emoji: "📢", description: "Marketing and promoting tango events and culture" },
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nickname: "",
      languages: [],
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

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">Complete Your Profile</h1>
          <p className="text-lg text-gray-600">Join the global tango community</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Nickname Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-cyan-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">Nickname</h2>
              </div>
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">How should the community know you?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your tango nickname"
                        {...field}
                        className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">Languages</h2>
              </div>
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">What languages do you speak?</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={languages}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select languages"
                        className="border-gray-200 focus:border-blue-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tango Roles Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">Tango Activities</h2>
              </div>
              <FormField
                control={form.control}
                name="tangoRoles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">What do you do in tango?</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={tangoRoles}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Select your roles"
                        className="border-gray-200 focus:border-teal-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-xl font-medium text-gray-900">Location</h2>
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Where are you dancing?</FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        className="border-gray-200 focus:border-indigo-500 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8">
              <Button
                type="submit"
                disabled={onboardingMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                {onboardingMutation.isPending ? (
                  "Setting up profile..."
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
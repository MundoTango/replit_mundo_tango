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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-20 h-20 mx-auto mb-4 text-pink-500" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Mundo Tango! 💃</h1>
          <p className="text-xl text-gray-600">Let's get you connected with the global tango community</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Nickname Section */}
            <Card className="border-2 border-pink-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-pink-100 to-rose-100">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800">
                  <Heart className="w-8 h-8 text-pink-500" />
                  Your Tango Nickname
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">How should the community know you?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your tango nickname..."
                          {...field}
                          className="border-2 border-pink-200 focus:border-pink-500 rounded-xl text-lg p-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card className="border-2 border-cyan-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-cyan-100 to-blue-100">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800">
                  <Globe className="w-8 h-8 text-cyan-500" />
                  What languages do you speak?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="languages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Help us connect you with the right community</FormLabel>
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
              </CardContent>
            </Card>

            {/* Tango Roles Section */}
            <Card className="border-2 border-teal-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-teal-100 to-emerald-100">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800">
                  <Users className="w-8 h-8 text-teal-500" />
                  Your role in tango 🎭
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
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
                          placeholder="Select your tango activities..."
                          className="border-2 border-teal-200 focus:border-teal-500 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card className="border-2 border-blue-200 shadow-lg">
              <CardHeader className="text-center bg-gradient-to-r from-blue-100 to-indigo-100">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl text-gray-800">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  Where are you dancing? 🌍
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-gray-700">Help local dancers find you</FormLabel>
                      <FormControl>
                        <LocationPicker
                          value={field.value}
                          onChange={field.onChange}
                          className="border-2 border-blue-200 focus:border-blue-500 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <Button
                type="submit"
                disabled={onboardingMutation.isPending}
                className="bg-gradient-to-r from-pink-500 via-cyan-500 to-teal-500 hover:from-pink-600 hover:via-cyan-600 hover:to-teal-600 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {onboardingMutation.isPending ? (
                  "Setting up your profile..."
                ) : (
                  "Join the Tango Community 🎉"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
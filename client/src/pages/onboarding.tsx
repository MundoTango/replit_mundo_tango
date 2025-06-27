import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TileSelect } from "@/components/ui/tile-select";
import { LocationPicker } from "@/components/onboarding/LocationPicker";
import { Heart, Sparkles, Globe, Users, Music } from "lucide-react";
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
  leaderLevel: z.number().min(0).max(10),
  followerLevel: z.number().min(0).max(10),
  yearsOfDancing: z.number().min(0).max(30),
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
      leaderLevel: 0,
      followerLevel: 0,
      yearsOfDancing: 0,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <Heart className="w-16 h-16 mx-auto mb-4 text-pink-500 animate-pulse hover:scale-110 transition-transform duration-300 cursor-pointer" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-bounce"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 hover:scale-105 transition-transform duration-300">
            Complete Your Profile
          </h1>
          <p className="text-xl text-gray-600 hover:text-gray-800 transition-colors duration-200">Join the global tango community</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            
            {/* Nickname Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-cyan-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-100 to-pink-100 rounded-full flex items-center justify-center group-hover:animate-bounce shadow-lg">
                  <Heart className="w-5 h-5 text-cyan-600 group-hover:text-pink-500 transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-cyan-700 transition-colors">Nickname</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">✨ Your tango identity!</span>
                </div>
              </div>
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-cyan-700 transition-colors">How should the community know you?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your tango nickname"
                        {...field}
                        className="h-12 border-gray-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-lg hover:border-cyan-300 transition-all duration-200 focus:shadow-lg focus:shadow-cyan-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Languages Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-blue-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center group-hover:animate-spin shadow-lg">
                  <Globe className="w-5 h-5 text-blue-600 group-hover:text-cyan-600 transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-blue-700 transition-colors">Languages</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">🌍 Connect globally!</span>
                </div>
              </div>
              <FormField
                control={form.control}
                name="languages"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">What languages do you speak?</FormLabel>
                    <FormControl>
                      <TileSelect
                        options={languages}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Choose the languages you speak"
                        columns={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tango Roles Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-teal-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                  <Users className="w-5 h-5 text-teal-600 group-hover:text-emerald-600 transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-teal-700 transition-colors">Tango Activities</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">💃 Your tango style!</span>
                </div>
              </div>
              <FormField
                control={form.control}
                name="tangoRoles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-teal-700 transition-colors">What do you do in tango?</FormLabel>
                    <FormControl>
                      <TileSelect
                        options={tangoRoles}
                        selected={field.value}
                        onChange={field.onChange}
                        placeholder="Choose your tango activities"
                        columns={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dance Role Skills Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-purple-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:animate-pulse shadow-lg">
                  <Music className="w-5 h-5 text-purple-600 group-hover:text-pink-600 transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-purple-700 transition-colors">Do you dance as:</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🕺 Your dance style!</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Leader Level */}
                <FormField
                  control={form.control}
                  name="leaderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                        <span className="text-lg">🤵</span>
                        Leader Level: {field.value}/10
                      </FormLabel>
                      <FormControl>
                        <div className="px-3">
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Follower Level */}
                <FormField
                  control={form.control}
                  name="followerLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors flex items-center gap-2">
                        <span className="text-lg">💃</span>
                        Follower Level: {field.value}/10
                      </FormLabel>
                      <FormControl>
                        <div className="px-3">
                          <Slider
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            max={10}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Beginner</span>
                            <span>Expert</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Years of Dancing Experience Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-orange-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center group-hover:animate-bounce shadow-lg">
                  <span className="text-xl group-hover:animate-pulse">⏰</span>
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-orange-700 transition-colors">Dancing Experience</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">📅 Your journey!</span>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="yearsOfDancing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-orange-700 transition-colors flex items-center gap-2">
                      <span className="text-lg">🎭</span>
                      How long have you been dancing tango? {field.value === 30 ? '30+' : field.value} years
                    </FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Just starting</span>
                          <span>0-1</span>
                          <span>2-5</span>
                          <span>6-10</span>
                          <span>11-20</span>
                          <span>20+</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4 group hover:scale-[1.02] transition-all duration-300 hover:shadow-lg rounded-xl p-4 hover:bg-white/50">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200 group-hover:border-indigo-300 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center group-hover:animate-bounce shadow-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600 group-hover:text-purple-600 transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">Location</h2>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">📍 Find your scene!</span>
                </div>
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors">Where are you dancing?</FormLabel>
                    <FormControl>
                      <LocationPicker
                        value={field.value}
                        onChange={field.onChange}
                        className="border-gray-200 focus:border-indigo-500 rounded-lg hover:border-indigo-300 transition-all duration-200 focus:shadow-lg focus:shadow-indigo-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-8 text-center">
              <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-400 rounded-xl blur opacity-75 group-hover:opacity-100 group-hover:blur-sm transition duration-300"></div>
                <Button
                  type="submit"
                  disabled={onboardingMutation.isPending}
                  className="relative w-full h-14 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group-hover:shadow-cyan-500/25 disabled:hover:scale-100 disabled:opacity-50"
                >
                  <span className="flex items-center justify-center gap-3">
                    {onboardingMutation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Setting up profile...
                      </>
                    ) : (
                      <>
                        <span className="group-hover:animate-bounce">✨</span>
                        Complete Profile
                        <Heart className="w-5 h-5 group-hover:animate-pulse text-pink-200" />
                      </>
                    )}
                  </span>
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Join thousands of tango dancers worldwide!
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Heart, Shield, Users, Globe, CheckCircle, UserCheck, MessageSquare, AlertTriangle, Flag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const codeOfConductSchema = z.object({
  respectfulBehavior: z.boolean().refine(val => val === true, "You must agree to be respectful"),
  friendlyEnvironment: z.boolean().refine(val => val === true, "You must agree to keep it friendly"),
  consentRequired: z.boolean().refine(val => val === true, "You must agree to share with consent"),
  appropriateContent: z.boolean().refine(val => val === true, "You must agree to keep content appropriate"),
  reportingPolicy: z.boolean().refine(val => val === true, "You must agree to report problems gently"),
  communityValues: z.boolean().refine(val => val === true, "You must agree to build something good together"),
  termsOfService: z.boolean().refine(val => val === true, "You must agree to the terms of service and privacy policy"),
});

type CodeOfConductData = z.infer<typeof codeOfConductSchema>;

export default function CodeOfConduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const navigate = useNavigate();

  const form = useForm<CodeOfConductData>({
    resolver: zodResolver(codeOfConductSchema),
    defaultValues: {
      respectfulBehavior: false,
      friendlyEnvironment: false,
      consentRequired: false,
      appropriateContent: false,
      reportingPolicy: false,
      communityValues: false,
      termsOfService: false,
    },
  });

  const acceptCodeOfConductMutation = useMutation({
    mutationFn: async (data: CodeOfConductData) => {
      return apiRequest("POST", "/api/code-of-conduct/accept", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Mundo Tango!",
        description: "You've successfully joined our community. Let's start dancing!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      // Navigation will be handled automatically by App.tsx routing logic
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to accept code of conduct. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CodeOfConductData) => {
    acceptCodeOfConductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Heart className="w-20 h-20 mx-auto text-pink-500 animate-pulse hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-bounce flex items-center justify-center">
              <span className="text-white text-xl">🌱</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Code of Conduct
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            A space for connection, creativity, and mutual respect
          </p>
          <p className="text-sm text-gray-500">Effective Date: June 27, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-white via-blue-50 to-cyan-50">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              Mundo Tango is a space for connection, creativity, and mutual respect. Everyone is here to enjoy, share, and grow — so we keep things simple and kind.
            </p>
          </CardContent>
        </Card>

        {/* Community Guidelines */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Be Respectful */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-pink-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                  <UserCheck className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle className="text-xl text-pink-700">Be Respectful</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Treat others the way you'd like to be treated. Don't be rude, aggressive, or dismissive — in words, comments, or behavior.
              </p>
            </CardContent>
          </Card>

          {/* Keep It Friendly */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Heart className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">Keep It Friendly</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                This isn't the place for political arguments, personal attacks, or divisive topics. Focus on what brings us together: dance, music, events, and memory.
              </p>
            </CardContent>
          </Card>

          {/* Share With Consent */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">Share With Consent</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Only tag, post, or share photos or videos that others have agreed to. Respect people's privacy and comfort.
              </p>
            </CardContent>
          </Card>

          {/* Don't Be Foul */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-700">Don't Be Foul</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                No bullying, hate speech, threats, or inappropriate language. Keep it clean and decent for all ages and regions.
              </p>
            </CardContent>
          </Card>

          {/* Report Problems Gently */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors">
                  <Flag className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-xl text-orange-700">Report Problems Gently</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                If something doesn't feel right, let us know. Reporting is confidential and reviewed with care.
              </p>
            </CardContent>
          </Card>

          {/* Let's Build Something Good */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-cyan-50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-100 rounded-full group-hover:bg-cyan-200 transition-colors">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
                <CardTitle className="text-xl text-cyan-700">Let's Build Something Good</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                Whether you're dancing, organizing, teaching, or just exploring — bring your best self, and let others do the same.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agreement Form */}
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-white via-cyan-50 to-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">Community Agreement</CardTitle>
            <p className="text-gray-600">Please confirm your commitment to our community values</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Agreement Checkboxes */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="respectfulBehavior"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-pink-200 p-4 hover:bg-pink-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I commit to being respectful to all community members
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="friendlyEnvironment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-200 p-4 hover:bg-blue-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I will keep discussions friendly and focused on our shared interests
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consentRequired"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-green-200 p-4 hover:bg-green-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I will only share content with proper consent from others
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appropriateContent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-purple-200 p-4 hover:bg-purple-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I will keep my content appropriate and family-friendly
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reportingPolicy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-orange-200 p-4 hover:bg-orange-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I will report any issues respectfully and constructively
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communityValues"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-cyan-200 p-4 hover:bg-cyan-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I will bring my best self and help build a positive community
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-300 p-4 hover:bg-gray-50 transition-colors">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium text-gray-800">
                            I agree to the Terms of Service, Privacy Policy, and Code of Conduct
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            By checking this box, you confirm that you have read and agree to our complete terms and policies.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 text-center">
                  <div className="relative inline-block group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-cyan-400 to-blue-400 rounded-xl blur opacity-75 group-hover:opacity-100 group-hover:blur-sm transition duration-300"></div>
                    <Button
                      type="submit"
                      disabled={acceptCodeOfConductMutation.isPending}
                      className="relative w-full sm:w-auto min-w-[300px] h-14 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group-hover:shadow-cyan-500/25 disabled:hover:scale-100 disabled:opacity-50"
                    >
                      <span className="flex items-center justify-center gap-3">
                        {acceptCodeOfConductMutation.isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Joining Community...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 group-hover:animate-pulse" />
                            Join Mundo Tango Community
                            <Heart className="w-5 h-5 group-hover:animate-bounce text-pink-200" />
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Welcome to the global tango family!
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Questions or Concerns?</h3>
            <p className="text-gray-600">
              Contact us at <span className="font-medium text-blue-600">support@mundotango.life</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Shield, Users, Globe, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const codeOfConductSchema = z.object({
  respectfulBehavior: z.boolean().refine(val => val === true, "You must agree to maintain respectful behavior"),
  safeEnvironment: z.boolean().refine(val => val === true, "You must agree to help create a safe environment"),
  noHarassment: z.boolean().refine(val => val === true, "You must agree to the no harassment policy"),
  communityGuidelines: z.boolean().refine(val => val === true, "You must agree to follow community guidelines"),
  termsOfService: z.boolean().refine(val => val === true, "You must agree to the terms of service"),
});

type CodeOfConductData = z.infer<typeof codeOfConductSchema>;

export default function CodeOfConduct() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const form = useForm<CodeOfConductData>({
    resolver: zodResolver(codeOfConductSchema),
    defaultValues: {
      respectfulBehavior: false,
      safeEnvironment: false,
      noHarassment: false,
      communityGuidelines: false,
      termsOfService: false,
    },
  });

  const acceptCodeOfConductMutation = useMutation({
    mutationFn: async (data: CodeOfConductData) => {
      return apiRequest("/api/code-of-conduct/accept", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Mundo Tango!",
        description: "You've successfully joined our community. Let's start dancing!",
      });
      setLocation("/user");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CodeOfConductData) => {
    acceptCodeOfConductMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-10 h-10 text-purple-600" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Community Code of Conduct
                </CardTitle>
                <p className="text-gray-600 mt-2 text-lg">
                  Together we create a safe, respectful, and inclusive tango community
                </p>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Community Values */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Heart className="w-6 h-6 text-purple-600" />
                      <h3 className="font-semibold text-gray-900">Respect & Kindness</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We treat everyone with dignity, regardless of skill level, background, or experience.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Inclusive Community</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We welcome dancers of all ages, identities, and abilities to our global tango family.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-gray-900">Safe Environment</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We maintain a harassment-free space where everyone feels comfortable expressing themselves.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-6 h-6 text-orange-600" />
                      <h3 className="font-semibold text-gray-900">Global Connection</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      We celebrate the diverse cultures and traditions that make tango a universal language.
                    </p>
                  </div>
                </div>

                {/* Agreement Checkboxes */}
                <div className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">By joining Mundo Tango, I agree to:</h3>
                  
                  <FormField
                    control={form.control}
                    name="respectfulBehavior"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Maintain respectful and considerate behavior in all interactions
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="safeEnvironment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Help create and maintain a safe, welcoming environment for all community members
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noHarassment"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Refrain from harassment, discrimination, or inappropriate behavior of any kind
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communityGuidelines"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Follow community guidelines and report any violations to maintain our standards
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsOfService"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            Accept the Terms of Service and Privacy Policy
                          </FormLabel>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    disabled={acceptCodeOfConductMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <span className="flex items-center gap-3">
                      {acceptCodeOfConductMutation.isPending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Joining Community...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-6 h-6 group-hover:animate-bounce" />
                          Join the Mundo Tango Community
                          <Heart className="w-6 h-6 group-hover:animate-pulse text-pink-200" />
                        </>
                      )}
                    </span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-4">
                    Welcome to a global community of passionate tango dancers!
                  </p>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
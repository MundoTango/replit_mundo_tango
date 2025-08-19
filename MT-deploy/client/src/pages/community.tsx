import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Link } from 'wouter';
import { Users, Calendar, MessageCircle, Sparkles, Heart, Globe, MapPin } from 'lucide-react';

export default function CommunityPage() {
  return (
    <DashboardLayout>
      {/* Enhanced gradient background matching Moments page */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-yellow-50/40 to-orange-50/30 relative overflow-hidden">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-turquoise-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-turquoise-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-cyan-200/15 to-turquoise-200/15 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-8">
          {/* Enhanced header section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg animate-pulse">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
              Welcome to the Tango Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with passionate dancers worldwide and discover the heart of tango culture
            </p>
          </div>
          
          {/* Enhanced navigation cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Link href="/community-world-map">
              <div className="group glassmorphic-card bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 border-2 border-turquoise-200/70 rounded-3xl p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-200/50 transition-all duration-300 cursor-pointer relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-semibold rounded-bl-2xl">
                  NEW
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Globe className="h-10 w-10 text-white animate-pulse" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">World Map</h3>
                  <p className="text-gray-600 leading-relaxed">Interactive global map of tango communities with live statistics</p>
                </div>
              </div>
            </Link>

            {/* ESA LIFE CEO 56x21 - Removed duplicate community link since World Map already shows communities */}

            <Link href="/moments">
              <div className="group glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <MessageCircle className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-turquoise-600 transition-colors">Share Moments</h3>
                  <p className="text-gray-600 leading-relaxed">Connect with dancers worldwide and share your tango journey through memories and stories</p>
                </div>
              </div>
            </Link>

            <Link href="/events">
              <div className="group glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Discover Events</h3>
                  <p className="text-gray-600 leading-relaxed">Find milongas, workshops, and festivals near you with location-based discovery</p>
                </div>
              </div>
            </Link>

            <Link href="/profile">
              <div className="group glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 hover:scale-105 hover:shadow-2xl hover:shadow-turquoise-100/30 transition-all duration-300 cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <div className="p-4 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center">
                      <Heart className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-turquoise-600 transition-colors">Your Profile</h3>
                  <p className="text-gray-600 leading-relaxed">Showcase your tango experience and connect with the global community</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Enhanced features section */}
          <div className="glassmorphic-card bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 p-8 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                Community Features
              </h2>
              <p className="text-gray-600 text-lg">
                Discover what makes our tango community special
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-turquoise-50/50 to-cyan-50/50 rounded-2xl border border-turquoise-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Global Network</h4>
                  <p className="text-gray-600 leading-relaxed">Connect with passionate tango dancers from every corner of the world and share your journey</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Real-time Updates</h4>
                  <p className="text-gray-600 leading-relaxed">Stay connected with live notifications, updates, and community activities as they happen</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-turquoise-50/50 to-blue-50/50 rounded-2xl border border-turquoise-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-turquoise-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-turquoise-600 transition-colors">Event Discovery</h4>
                  <p className="text-gray-600 leading-relaxed">Find and join local milongas, workshops, and international tango festivals with smart location features</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-6 bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Skill Development</h4>
                  <p className="text-gray-600 leading-relaxed">Learn from master teachers, skilled performers, and experienced dancers in our supportive community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
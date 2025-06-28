import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Link } from 'wouter';
import { Users, Calendar, MessageCircle } from 'lucide-react';

export default function CommunityPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <h1 className="text-3xl font-bold text-black-text-color mb-6">Welcome to the Tango Community</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/moments">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-center p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-btn-color mb-4" />
                  <h3 className="text-lg font-semibold text-black-text-color mb-2">Share Moments</h3>
                  <p className="text-gray-text-color">Connect with dancers worldwide and share your tango journey</p>
                </div>
              </div>
            </Link>

            <Link href="/events">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-center p-6 text-center">
                  <Calendar className="h-12 w-12 text-btn-color mb-4" />
                  <h3 className="text-lg font-semibold text-black-text-color mb-2">Discover Events</h3>
                  <p className="text-gray-text-color">Find milongas, workshops, and festivals near you</p>
                </div>
              </div>
            </Link>

            <Link href="/profile">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-center p-6 text-center">
                  <Users className="h-12 w-12 text-btn-color mb-4" />
                  <h3 className="text-lg font-semibold text-black-text-color mb-2">Your Profile</h3>
                  <p className="text-gray-text-color">Showcase your tango experience and connect with others</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="border-t border-border-color pt-6">
            <h2 className="text-xl font-semibold text-black-text-color mb-4">Community Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-btn-color rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-black-text-color">Global Network</h4>
                  <p className="text-sm text-gray-text-color">Connect with tango dancers from around the world</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-btn-color rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-black-text-color">Real-time Updates</h4>
                  <p className="text-sm text-gray-text-color">Stay updated with the latest community activities</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-btn-color rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-black-text-color">Event Discovery</h4>
                  <p className="text-sm text-gray-text-color">Find local and international tango events</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-btn-color rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-black-text-color">Skill Development</h4>
                  <p className="text-sm text-gray-text-color">Learn from experienced dancers and teachers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
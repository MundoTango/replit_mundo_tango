
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, Globe } from "lucide-react";

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("about");

  const communityStats = {
    totalMembers: 2890,
    activeDancers: 1250,
    upcomingEvents: 45,
    citiesWorldwide: 89
  };

  const nearbyDancers = [
    {
      id: 1,
      name: "Maria Rodriguez",
      username: "maria_tango",
      location: "Buenos Aires, Argentina",
      image: "/images/user-placeholder.jpeg",
      experience: "Advanced",
      mutualFriends: 12
    },
    {
      id: 2,
      name: "Carlos Mendez",
      username: "carlos_dance",
      location: "Montevideo, Uruguay", 
      image: "/images/user-placeholder.jpeg",
      experience: "Intermediate",
      mutualFriends: 8
    },
    {
      id: 3,
      name: "Elena Vasquez",
      username: "elena_tango",
      location: "Madrid, Spain",
      image: "/images/user-placeholder.jpeg",
      experience: "Expert",
      mutualFriends: 15
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Milonga La Viruta",
      location: "Buenos Aires, Argentina",
      date: "2024-01-15",
      time: "21:00",
      attendees: 85,
      image: "/images/event-placeholder.jpeg"
    },
    {
      id: 2,
      title: "Tango Workshop - Basic Steps",
      location: "New York, USA",
      date: "2024-01-18",
      time: "19:00", 
      attendees: 32,
      image: "/images/event-placeholder.jpeg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Trango Community</h1>
            <p className="text-xl mb-6">Connect with tango dancers worldwide</p>
            <div className="flex justify-center items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{communityStats.totalMembers.toLocaleString()} Members</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{communityStats.citiesWorldwide} Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{communityStats.upcomingEvents} Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 rounded-lg p-1">
            {[
              { id: "about", label: "About" },
              { id: "dancers", label: "Nearby Dancers" },
              { id: "events", label: "Events" },
              { id: "groups", label: "Groups" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "about" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  Total Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {communityStats.totalMembers.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Active tango community</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-red-600" />
                  Active Dancers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {communityStats.activeDancers.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Dancing regularly</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {communityStats.upcomingEvents}
                </div>
                <p className="text-sm text-gray-600">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Cities Worldwide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {communityStats.citiesWorldwide}
                </div>
                <p className="text-sm text-gray-600">Global presence</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "dancers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyDancers.map((dancer) => (
              <Card key={dancer.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={dancer.image} />
                      <AvatarFallback className="bg-red-600 text-white">
                        {dancer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{dancer.name}</h3>
                      <p className="text-gray-600">@{dancer.username}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {dancer.location}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Experience:</span>
                      <span className="text-sm font-medium">{dancer.experience}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mutual Friends:</span>
                      <span className="text-sm font-medium">{dancer.mutualFriends}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1">Connect</Button>
                    <Button size="sm" variant="outline" className="flex-1">Message</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                        <p>{event.date} at {event.time}</p>
                        <p>{event.attendees} attending</p>
                      </div>
                      <Button size="sm" className="mt-3">Join Event</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">Groups Coming Soon</h3>
            <p className="text-gray-600">Join specialized tango groups based on your interests and skill level.</p>
          </div>
        )}
      </div>
    </div>
  );
}

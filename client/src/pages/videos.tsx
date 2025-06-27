
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Heart, MessageCircle, Share2, MoreHorizontal, Play } from "lucide-react";

export default function VideosPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const videos = [
    {
      id: 1,
      thumbnail: "/images/video-thumb-1.jpg",
      title: "Tango Basics: The Walk",
      description: "Learn the fundamental walking technique in Argentine Tango",
      duration: "5:32",
      user: {
        name: "Isabella Martinez",
        username: "bella_tango_teacher",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 89,
      comments: 23,
      views: 1250,
      tags: ["tutorial", "basics", "walking"],
      createdAt: "2024-01-12",
      category: "Tutorial"
    },
    {
      id: 2,
      thumbnail: "/images/video-thumb-2.jpg",
      title: "Milonga Performance at Salon Canning",
      description: "Beautiful performance by professional dancers",
      duration: "3:45",
      user: {
        name: "Ricardo & Sofia",
        username: "ricardo_sofia_tango",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 156,
      comments: 34,
      views: 2890,
      tags: ["performance", "milonga", "professional"],
      createdAt: "2024-01-10",
      category: "Performance"
    },
    {
      id: 3,
      thumbnail: "/images/video-thumb-3.jpg",
      title: "Ochos and Giros Workshop",
      description: "Advanced technique for ochos and giros combination",
      duration: "12:18",
      user: {
        name: "Maestro Carlos Gavito",
        username: "gavito_tango",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 203,
      comments: 67,
      views: 4560,
      tags: ["workshop", "advanced", "ochos", "giros"],
      createdAt: "2024-01-08",
      category: "Workshop"
    },
    {
      id: 4,
      thumbnail: "/images/video-thumb-4.jpg",
      title: "Tango Vals at Practica",
      description: "Social dancing - Tango Vals in 3/4 time",
      duration: "4:21",
      user: {
        name: "Ana Lucia",
        username: "ana_tango_vals",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 72,
      comments: 18,
      views: 987,
      tags: ["vals", "social", "practica"],
      createdAt: "2024-01-06",
      category: "Social"
    }
  ];

  const filters = [
    { id: "all", label: "All Videos" },
    { id: "my_videos", label: "My Videos" },
    { id: "tutorial", label: "Tutorials" },
    { id: "performance", label: "Performances" },
    { id: "workshop", label: "Workshops" },
    { id: "social", label: "Social Dancing" }
  ];

  const categories = ["Tutorial", "Performance", "Workshop", "Social"];

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "my_videos") return matchesSearch && video.user.username === user?.username;
    if (activeFilter === "tutorial") return matchesSearch && video.category === "Tutorial";
    if (activeFilter === "performance") return matchesSearch && video.category === "Performance";
    if (activeFilter === "workshop") return matchesSearch && video.category === "Workshop";
    if (activeFilter === "social") return matchesSearch && video.category === "Social";
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Videos</h1>
              <p className="text-gray-600">Learn and share tango techniques</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={activeFilter === filter.id ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative cursor-pointer group">
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <Badge className="absolute top-2 left-2" variant="secondary">
                  {video.category}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={video.user.avatar} />
                    <AvatarFallback className="bg-red-600 text-white">
                      {video.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{video.user.name}</p>
                    <p className="text-xs text-gray-500">@{video.user.username}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Video Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {video.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="text-xs text-gray-500">
                    {video.views.toLocaleString()} views • {video.createdAt}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{video.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{video.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button variant="outline">Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

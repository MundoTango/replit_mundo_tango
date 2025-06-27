
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Heart, MessageCircle, Share2, MoreHorizontal, Filter } from "lucide-react";

export default function PhotosPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const photos = [
    {
      id: 1,
      url: "/images/tango-photo-1.jpg",
      title: "Milonga at La Viruta",
      description: "Amazing night of tango in Buenos Aires",
      user: {
        name: "Maria Rodriguez",
        username: "maria_tango", 
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 24,
      comments: 8,
      tags: ["milonga", "buenos_aires", "tango"],
      createdAt: "2024-01-10"
    },
    {
      id: 2,
      url: "/images/tango-photo-2.jpg", 
      title: "Tango Workshop",
      description: "Learning new figures with amazing teachers",
      user: {
        name: "Carlos Mendez",
        username: "carlos_dance",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 18,
      comments: 5,
      tags: ["workshop", "learning", "tango"],
      createdAt: "2024-01-08"
    },
    {
      id: 3,
      url: "/images/tango-photo-3.jpg",
      title: "Street Tango Performance", 
      description: "Performing on the streets of San Telmo",
      user: {
        name: "Elena Vasquez",
        username: "elena_tango",
        avatar: "/images/user-placeholder.jpeg"
      },
      likes: 45,
      comments: 12,
      tags: ["performance", "street", "san_telmo"],
      createdAt: "2024-01-05"
    }
  ];

  const filters = [
    { id: "all", label: "All Photos" },
    { id: "my_photos", label: "My Photos" },
    { id: "friends", label: "Friends" },
    { id: "popular", label: "Popular" },
    { id: "recent", label: "Recent" }
  ];

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "my_photos") return matchesSearch && photo.user.username === user?.username;
    if (activeFilter === "popular") return matchesSearch && photo.likes > 20;
    if (activeFilter === "recent") return matchesSearch;
    if (activeFilter === "friends") return matchesSearch;
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Photos</h1>
              <p className="text-gray-600">Share and discover tango moments</p>
            </div>
            <Button className="bg-red-600 hover:bg-red-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
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
              placeholder="Search photos, tags, or descriptions..."
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

        {/* Photos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Photo Preview</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={photo.user.avatar} />
                    <AvatarFallback className="bg-red-600 text-white">
                      {photo.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{photo.user.name}</p>
                    <p className="text-xs text-gray-500">@{photo.user.username}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Photo Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold">{photo.title}</h3>
                  <p className="text-sm text-gray-600">{photo.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{photo.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{photo.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">{photo.createdAt}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No photos found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button variant="outline">Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

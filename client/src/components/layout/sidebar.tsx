import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  Users
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="card-shadow">
        <CardContent className="p-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage src={user?.profileImage || ""} alt={user?.name} />
              <AvatarFallback className="text-lg">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg text-tango-black">{user?.name}</h3>
            <p className="text-gray-600 text-sm mb-2">@{user?.username}</p>
            <p className="text-gray-500 text-xs mb-4">{user?.city || 'Location not set'}</p>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-semibold text-tango-red">1,234</div>
                <div className="text-xs text-gray-500">Followers</div>
              </div>
              <div>
                <div className="font-semibold text-tango-red">567</div>
                <div className="text-xs text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card className="card-shadow">
        <CardContent className="p-4">
          <h4 className="font-semibold text-tango-black mb-4">Quick Access</h4>
          <nav className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto hover:bg-tango-gray"
            >
              <Calendar className="h-5 w-5 text-tango-red mr-3" />
              Events Calendar
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto hover:bg-tango-gray"
            >
              <MessageSquare className="h-5 w-5 text-tango-red mr-3" />
              Community Forums
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto hover:bg-tango-gray"
            >
              <BarChart3 className="h-5 w-5 text-tango-red mr-3" />
              Analytics
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto hover:bg-tango-gray"
            >
              <Users className="h-5 w-5 text-tango-red mr-3" />
              Find Dancers
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start p-2 h-auto hover:bg-tango-gray"
            >
              <Settings className="h-5 w-5 text-tango-red mr-3" />
              Settings
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}

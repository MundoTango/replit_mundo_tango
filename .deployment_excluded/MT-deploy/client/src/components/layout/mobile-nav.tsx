import { Button } from "@/components/ui/button";
import { 
  Home, 
  Calendar, 
  Plus, 
  MessageCircle, 
  User 
} from "lucide-react";

interface MobileNavProps {
  onOpenChat: () => void;
}

export default function MobileNav({ onOpenChat }: MobileNavProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 gap-1">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center py-2 px-1 text-tango-red h-auto"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center py-2 px-1 text-gray-600 h-auto"
        >
          <Calendar className="h-6 w-6" />
          <span className="text-xs mt-1">Events</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center py-2 px-1 text-gray-600 h-auto"
        >
          <Plus className="h-6 w-6" />
          <span className="text-xs mt-1">Create</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center py-2 px-1 text-gray-600 relative h-auto"
          onClick={onOpenChat}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 bg-tango-red text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
          <span className="text-xs mt-1">Messages</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="flex flex-col items-center py-2 px-1 text-gray-600 h-auto"
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Profile</span>
        </Button>
      </div>
    </div>
  );
}

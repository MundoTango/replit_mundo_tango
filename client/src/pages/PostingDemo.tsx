import UniversalPostCreator from '@/components/universal/UniversalPostCreator';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PostingDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Universal Posting System Demo</h1>
      
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">Feed Post</TabsTrigger>
          <TabsTrigger value="event">Event Post</TabsTrigger>
          <TabsTrigger value="group">Group Post</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create a Feed Post</h2>
            <p className="text-gray-600 mb-4">
              Share your tango moments with the community. Posts can include photos, 
              location tags, and @mentions.
            </p>
            <UniversalPostCreator
              context={{
                type: 'feed'
              }}
              onPostCreated={(post) => {
                console.log('Feed post created:', post);
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="event">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Post to Event</h2>
            <p className="text-gray-600 mb-4">
              Share updates about an event. Your post will appear on the event page 
              and include automatic location context.
            </p>
            <UniversalPostCreator
              context={{
                type: 'event',
                contextId: '123', // Replace with actual event ID
                defaultLocation: 'La Viruta Tango Club, Buenos Aires'
              }}
              placeholder="Share your experience at this event..."
              showRecommendationOptions={false}
              onPostCreated={(post) => {
                console.log('Event post created:', post);
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="group">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Post to Group</h2>
            <p className="text-gray-600 mb-4">
              Share content with your group members. Posts can include recommendations 
              specific to your city.
            </p>
            <UniversalPostCreator
              context={{
                type: 'group',
                contextId: 'buenos-aires-argentina', // Replace with actual group slug
                defaultVisibility: 'public'
              }}
              placeholder="Share something with your group..."
              onPostCreated={(post) => {
                console.log('Group post created:', post);
              }}
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendation">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create a Recommendation</h2>
            <p className="text-gray-600 mb-4">
              Recommend a restaurant, venue, school, or any place to the tango community. 
              Your recommendation will appear on the city map.
            </p>
            <UniversalPostCreator
              context={{
                type: 'recommendation',
                defaultLocation: 'Buenos Aires, Argentina'
              }}
              placeholder="What place would you recommend to other dancers?"
              onPostCreated={(post) => {
                console.log('Recommendation created:', post);
              }}
            />
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Features Demonstrated:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🗺️ Google Maps Integration</h3>
            <p className="text-gray-600">
              Enhanced location picker with business search, automatic geocoding, 
              and location suggestions based on your events.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">📸 Media Metadata</h3>
            <p className="text-gray-600">
              Automatically extracts location from photos using EXIF data and 
              suggests locations based on where the photo was taken.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">@ Mentions</h3>
            <p className="text-gray-600">
              Type @ to mention users, events, or groups. Mentions are clickable 
              and send notifications to mentioned users.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">⭐ Recommendations</h3>
            <p className="text-gray-600">
              Create recommendations with ratings, tags, and business details. 
              These appear as pins on the city map with filtering options.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🎯 Context Awareness</h3>
            <p className="text-gray-600">
              Posts adapt to their context - event posts include event location, 
              group posts respect group privacy settings.
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🌍 Location Intelligence</h3>
            <p className="text-gray-600">
              Detects locations from content, correlates with your events, and 
              provides contextual hints based on your activity.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
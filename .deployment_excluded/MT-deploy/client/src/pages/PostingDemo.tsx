import { BeautifulPostCreator } from '@/components/universal/BeautifulPostCreator';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PostingDemo() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">ESA Life CEO Post Creation Demo</h1>
      
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Beautiful Post Creator</TabsTrigger>
          <TabsTrigger value="internal">Internal Upload Demo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create a Beautiful Post</h2>
            <p className="text-gray-600 mb-4">
              ESA Framework 61x21 - Single internal upload system with 30 files, 500MB support.
              No Cloudinary dependencies, pure internal reliability.
            </p>
            <BeautifulPostCreator />
          </Card>
        </TabsContent>
        
        <TabsContent value="internal">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Internal Upload System</h2>
            <p className="text-gray-600 mb-4">
              Test the internal upload functionality with drag-and-drop, progress tracking,
              and batch uploads. All files stored locally in /uploads directory.
            </p>
            <BeautifulPostCreator />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
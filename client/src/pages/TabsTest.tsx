import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TabsTest() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tabs Test Page (Controlled)</h1>
      <p className="mb-4">Active tab: {activeTab}</p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tab1" className="mt-4">
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="text-xl font-bold">Tab 1 Content</h2>
            <p>This is the content for Tab 1</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tab2" className="mt-4">
          <div className="p-4 bg-green-100 rounded">
            <h2 className="text-xl font-bold">Tab 2 Content</h2>
            <p>This is the content for Tab 2</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tab3" className="mt-4">
          <div className="p-4 bg-red-100 rounded">
            <h2 className="text-xl font-bold">Tab 3 Content</h2>
            <p>This is the content for Tab 3</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Manual Tab Buttons</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('tab1')} 
            className={`px-4 py-2 rounded ${activeTab === 'tab1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Go to Tab 1
          </button>
          <button 
            onClick={() => setActiveTab('tab2')} 
            className={`px-4 py-2 rounded ${activeTab === 'tab2' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Go to Tab 2
          </button>
          <button 
            onClick={() => setActiveTab('tab3')} 
            className={`px-4 py-2 rounded ${activeTab === 'tab3' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Go to Tab 3
          </button>
        </div>
      </div>
    </div>
  );
}

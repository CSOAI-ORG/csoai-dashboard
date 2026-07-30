import { useState } from 'react';

export default function SimpleReactTabsTest() {
  const [activeTab, setActiveTab] = useState('tab1');
  
  console.log('SimpleReactTabsTest render - activeTab:', activeTab);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple React Tabs Test (No Radix)</h1>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => {
            console.log('Clicking tab1');
            setActiveTab('tab1');
          }}
          className={`px-4 py-2 rounded ${activeTab === 'tab1' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tab 1
        </button>
        <button
          onClick={() => {
            console.log('Clicking tab2');
            setActiveTab('tab2');
          }}
          className={`px-4 py-2 rounded ${activeTab === 'tab2' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tab 2
        </button>
        <button
          onClick={() => {
            console.log('Clicking tab3');
            setActiveTab('tab3');
          }}
          className={`px-4 py-2 rounded ${activeTab === 'tab3' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Tab 3
        </button>
      </div>
      
      {activeTab === 'tab1' && (
        <div className="p-4 bg-blue-100 rounded">
          <h2 className="text-xl font-bold">Tab 1 Content</h2>
          <p>This is the content for Tab 1</p>
        </div>
      )}
      
      {activeTab === 'tab2' && (
        <div className="p-4 bg-green-100 rounded">
          <h2 className="text-xl font-bold">Tab 2 Content</h2>
          <p>This is the content for Tab 2</p>
        </div>
      )}
      
      {activeTab === 'tab3' && (
        <div className="p-4 bg-red-100 rounded">
          <h2 className="text-xl font-bold">Tab 3 Content</h2>
          <p>This is the content for Tab 3</p>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="font-mono">Active tab: {activeTab}</p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const ApiTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testApiEndpoints = async () => {
    setLoading(true);
    const results = [];
    
    try {
      // Test the test endpoint
      const testResponse = await fetch('/api/test');
      results.push({
        endpoint: '/api/test',
        status: testResponse.status,
        success: testResponse.ok,
        data: testResponse.ok ? await testResponse.json() : null,
        error: testResponse.ok ? null : `HTTP ${testResponse.status}`
      });
      
      // Test the upload endpoint (GET method)
      const uploadResponse = await fetch('/api/upload');
      results.push({
        endpoint: '/api/upload',
        status: uploadResponse.status,
        success: uploadResponse.ok,
        data: uploadResponse.ok ? 'Upload endpoint accessible' : null,
        error: uploadResponse.ok ? null : `HTTP ${uploadResponse.status}`
      });
      
      setTestResults(results);
      toast.success('API tests completed');
    } catch (error) {
      console.error('API test failed:', error);
      results.push({
        endpoint: 'General',
        status: 'Error',
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setTestResults(results);
      toast.error('API tests failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoint Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={testApiEndpoints} disabled={loading}>
              {loading ? 'Testing...' : 'Test API Endpoints'}
            </Button>
            
            {testResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Test Results</h3>
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border ${
                      result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{result.endpoint}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    {result.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error: {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestPage;
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Document } from '@shared/schema';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import LoadingOverlay from '@/components/LoadingOverlay';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ComparisonPage() {
  const [selectedDocument1, setSelectedDocument1] = useState<string>('');
  const [selectedDocument2, setSelectedDocument2] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const { toast } = useToast();

  // Fetch user's documents
  const { data: documentData, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Compare documents mutation
  const compareDocumentsMutation = useMutation({
    mutationFn: async ({ document1Id, document2Id }: { document1Id: string; document2Id: string }) => {
      const response = await apiRequest(
        'POST',
        '/api/documents/compare',
        {
          documentId1: document1Id,
          documentId2: document2Id
        }
      );
      
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: (data) => {
      setComparisonResult(data.comparison);
      toast({
        title: 'Documents compared successfully',
        description: 'The comparison results are now available.'
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Comparison failed',
        description: error instanceof Error ? error.message : 'Failed to compare documents'
      });
    }
  });

  const documents = documentData?.documents || [];

  const handleCompare = () => {
    if (!selectedDocument1 || !selectedDocument2) {
      toast({
        variant: 'destructive',
        title: 'Selection required',
        description: 'Please select two documents to compare'
      });
      return;
    }
    
    if (selectedDocument1 === selectedDocument2) {
      toast({
        variant: 'destructive',
        title: 'Invalid selection',
        description: 'Please select two different documents to compare'
      });
      return;
    }
    
    compareDocumentsMutation.mutate({
      document1Id: selectedDocument1,
      document2Id: selectedDocument2
    });
  };

  // Find document by ID
  const getDocumentById = (id: string): Document | undefined => {
    return documents.find((doc: Document) => doc.id.toString() === id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {(isLoadingDocuments || compareDocumentsMutation.isPending) && <LoadingOverlay />}
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Compare Documents</h1>
            <p className="text-gray-600">Compare and analyze differences between two documents</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Document Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Documents to Compare</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Document 1 Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Document</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={selectedDocument1}
                    onChange={(e) => setSelectedDocument1(e.target.value)}
                  >
                    <option value="">Select a document</option>
                    {documents.map((doc: Document) => (
                      <option key={`doc1-${doc.id}`} value={doc.id.toString()}>
                        {doc.name} ({doc.fileType})
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Document 2 Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Second Document</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    value={selectedDocument2}
                    onChange={(e) => setSelectedDocument2(e.target.value)}
                  >
                    <option value="">Select a document</option>
                    {documents.map((doc: Document) => (
                      <option key={`doc2-${doc.id}`} value={doc.id.toString()}>
                        {doc.name} ({doc.fileType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-6 text-right">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleCompare}
                  disabled={!selectedDocument1 || !selectedDocument2 || compareDocumentsMutation.isPending}
                >
                  Compare Documents
                </button>
              </div>
            </div>
            
            {/* Comparison Results */}
            {comparisonResult && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Comparison Results</h2>
                
                <div className="space-y-6">
                  {/* Documents Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparisonResult.documents.map((doc: any, index: number) => (
                      <div key={`result-doc-${index}`} className="border rounded-md p-4">
                        <h3 className="font-medium text-gray-900">Document {index + 1}</h3>
                        <p className="text-sm text-gray-600">{doc.name}</p>
                        <div className="mt-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            doc.type === 'Financial' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Similarity Score */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Similarity Analysis</h3>
                    <div className="bg-gray-50 rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Similarity Score</span>
                        <span className="text-lg font-semibold">{comparisonResult.similarityScore.toFixed(2)}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            comparisonResult.similarityScore > 80 
                              ? 'bg-green-600' 
                              : comparisonResult.similarityScore > 50 
                                ? 'bg-yellow-400' 
                                : 'bg-red-600'
                          }`}
                          style={{ width: `${comparisonResult.similarityScore}%` }}
                        ></div>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">
                        {comparisonResult.similarityScore > 80 
                          ? 'The documents are highly similar.' 
                          : comparisonResult.similarityScore > 50 
                            ? 'The documents have moderate similarities.' 
                            : 'The documents are significantly different.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Information Differences */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Key Information Differences</h3>
                    
                    {Object.keys(comparisonResult.differences).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(comparisonResult.differences).map(([category, diff]: [string, any], index) => (
                          <div key={`diff-${index}`} className="bg-gray-50 rounded-md p-4">
                            <h4 className="font-medium text-gray-900 capitalize mb-2">{category}</h4>
                            
                            {diff.additions.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-green-700">Added in Document 2:</p>
                                <ul className="list-disc pl-5 mt-1">
                                  {diff.additions.map((item: string, idx: number) => (
                                    <li key={`add-${idx}`} className="text-sm text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {diff.removals.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-red-700">Only in Document 1:</p>
                                <ul className="list-disc pl-5 mt-1">
                                  {diff.removals.map((item: string, idx: number) => (
                                    <li key={`rem-${idx}`} className="text-sm text-gray-700">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-md p-4 text-center">
                        <p className="text-gray-500">No significant information differences found</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Recommendation */}
                  <div className="bg-gray-50 rounded-md p-4 border-l-4 border-primary-500">
                    <h3 className="font-medium text-gray-900 mb-2">Analysis Summary</h3>
                    <p className="text-gray-700">
                      {comparisonResult.similarityScore > 80 
                        ? 'These documents are very similar. Any differences are likely minor and may not be significant.' 
                        : comparisonResult.similarityScore > 50 
                          ? 'These documents have notable differences. Review the specific changes highlighted above.' 
                          : 'These documents are substantially different. A detailed review is recommended.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
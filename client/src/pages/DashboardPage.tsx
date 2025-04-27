import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import StatCard from "@/components/StatCard";
import DocumentCard from "@/components/DocumentCard";
import DocumentViewModal from "@/components/DocumentViewModal";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useAuth } from "@/hooks/useAuth";
import { Document } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

  // Fetch documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const documents = documentsData?.documents || [];
  
  // Calculate statistics
  const totalDocuments = documents.length;
  const financialDocuments = documents.filter(doc => doc.fileType === 'Financial').length;
  const legalDocuments = documents.filter(doc => doc.fileType === 'Legal').length;
  
  // Calculate compliance rate
  const compliantDocuments = documents.filter(doc => doc.complianceStatus === 'Pass').length;
  const complianceRate = totalDocuments > 0 
    ? Math.round((compliantDocuments / totalDocuments) * 100) 
    : 0;

  // Open document modal
  const openDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    setIsDocumentModalOpen(true);
  };

  // Get recent documents (max 3)
  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {isLoading ? (
            <LoadingOverlay />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}! Here's an overview of your documents and insights.</p>
              </div>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <StatCard 
                  title="Total Documents" 
                  value={totalDocuments} 
                  icon={<i className="ri-file-list-3-line text-primary-600 text-xl"></i>}
                  color="primary"
                />
                
                <StatCard 
                  title="Financial Documents" 
                  value={financialDocuments} 
                  icon={<i className="ri-bank-line text-blue-600 text-xl"></i>}
                  color="blue"
                />
                
                <StatCard 
                  title="Legal Documents" 
                  value={legalDocuments} 
                  icon={<i className="ri-scales-3-line text-yellow-600 text-xl"></i>}
                  color="yellow"
                />
                
                <StatCard 
                  title="Compliance Rate" 
                  value={`${complianceRate}%`} 
                  icon={<i className="ri-shield-check-line text-green-600 text-xl"></i>}
                  color="green"
                />
              </div>
              
              {/* Recent Documents */}
              <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Documents</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Compliance
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentDocuments.length > 0 ? (
                        recentDocuments.map((document) => (
                          <DocumentCard 
                            key={document.id} 
                            document={document} 
                            onView={() => openDocumentModal(document)}
                            showDelete={false}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                            No documents found. <a href="/upload" className="text-primary-600 hover:text-primary-900">Upload your first document</a>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {recentDocuments.length > 0 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                          Showing <span className="font-medium">1</span> to <span className="font-medium">{recentDocuments.length}</span> of <span className="font-medium">{totalDocuments}</span> documents
                        </div>
                        <div>
                          <a href="/history" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-white hover:bg-gray-50">
                            View all
                            <i className="ri-arrow-right-line ml-2"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Document View Modal */}
              {selectedDocument && (
                <DocumentViewModal
                  document={selectedDocument}
                  isOpen={isDocumentModalOpen}
                  onClose={() => setIsDocumentModalOpen(false)}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

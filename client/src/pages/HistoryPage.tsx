import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import DocumentCard from "@/components/DocumentCard";
import DocumentViewModal from "@/components/DocumentViewModal";
import LoadingOverlay from "@/components/LoadingOverlay";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Document } from "@shared/schema";

export default function HistoryPage() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [complianceFilter, setComplianceFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("date-desc");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  // Fetch documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh document list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete document",
      });
    },
  });

  // Handle document deletion
  const handleDeleteDocument = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
    }
  };

  // Open document modal
  const openDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    setIsDocumentModalOpen(true);
  };

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    const documents = documentsData?.documents || [];
    
    return documents
      .filter(doc => {
        // Search filter
        const nameMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Type filter
        const typeMatch = typeFilter === "" || doc.fileType === typeFilter;
        
        // Compliance filter
        const complianceMatch = complianceFilter === "" || doc.complianceStatus === complianceFilter;
        
        return nameMatch && typeMatch && complianceMatch;
      })
      .sort((a, b) => {
        // Sort by date
        if (sortOrder === "date-desc") {
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        } else {
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        }
      });
  }, [documentsData, searchTerm, typeFilter, complianceFilter, sortOrder]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {(isLoading || deleteMutation.isPending) && <LoadingOverlay />}
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document History</h1>
            <p className="text-gray-600">View and manage all your processed documents</p>
          </div>
          
          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg mb-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full md:w-96">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-search-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Financial">Financial</option>
                  <option value="Legal">Legal</option>
                </select>
                
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={complianceFilter}
                  onChange={(e) => setComplianceFilter(e.target.value)}
                >
                  <option value="">All Compliance</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Warning">Warning</option>
                </select>
                
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Document List */}
          <div className="bg-white shadow rounded-lg">
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
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedDocuments.length > 0 ? (
                    paginatedDocuments.map((document) => (
                      <DocumentCard 
                        key={document.id} 
                        document={document} 
                        onView={() => openDocumentModal(document)}
                        onDelete={() => handleDeleteDocument(document.id)}
                        showDelete={true}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        {filteredDocuments.length === 0 && !isLoading
                          ? "No documents found. Upload your first document."
                          : "No documents match your filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {filteredDocuments.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filteredDocuments.length)}
                        </span>{" "}
                        of <span className="font-medium">{filteredDocuments.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">Previous</span>
                          <i className="ri-arrow-left-s-line"></i>
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                              ${page === currentPage
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">Next</span>
                          <i className="ri-arrow-right-s-line"></i>
                        </button>
                      </nav>
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
        </main>
      </div>
    </div>
  );
}

import { Document } from "@shared/schema";

interface DocumentViewModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentViewModal({ document, isOpen, onClose }: DocumentViewModalProps) {
  if (!isOpen) return null;

  // Format date
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Get extraction data
  const extractedData = document.extractedData || {};
  const extractedItems = Object.entries(extractedData).map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    value: Array.isArray(value) ? value.join(', ') : value
  }));
  
  // Check for anomalies
  const hasAnomalies = document.anomalies && 
    document.anomalies.detected && 
    document.anomalies.items && 
    document.anomalies.items.length > 0;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {document.name}
                </h3>
                
                <div className="mt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      document.fileType === 'Financial' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.fileType}
                    </span>
                    <span className="text-sm text-gray-500">
                      <i className="ri-time-line"></i> {formatDate(document.uploadDate)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      document.complianceStatus === 'Pass'
                        ? 'bg-green-100 text-green-800'
                        : document.complianceStatus === 'Warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      Compliance: {document.complianceStatus}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Document Preview */}
                      <div className="md:col-span-1 border rounded-lg overflow-hidden h-96">
                        <div className="bg-gray-100 text-center p-8 h-full flex flex-col items-center justify-center">
                          <i className="ri-file-text-line text-gray-400 text-6xl mb-4"></i>
                          <p className="text-gray-500">Document Preview</p>
                          <button className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            <i className="ri-download-line mr-2"></i>
                            Download Original
                          </button>
                        </div>
                      </div>
                      
                      {/* Document Analysis */}
                      <div className="md:col-span-2">
                        <div className="space-y-6">
                          {/* Summary */}
                          {document.summary && (
                            <div>
                              <h4 className="text-base font-medium text-gray-900 mb-2">Summary</h4>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <p className="text-sm text-gray-600">
                                  {document.summary}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Extracted Information */}
                          {extractedItems.length > 0 && (
                            <div>
                              <h4 className="text-base font-medium text-gray-900 mb-2">Extracted Information</h4>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="grid grid-cols-2 gap-4">
                                  {extractedItems.map((item, index) => (
                                    <div key={index}>
                                      <p className="text-xs text-gray-500">{item.label}</p>
                                      <p className="text-sm font-medium">{item.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Anomalies & Compliance */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-base font-medium text-gray-900 mb-2">Anomaly Detection</h4>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {hasAnomalies ? (
                                      <i className="ri-error-warning-line text-error-500 text-2xl"></i>
                                    ) : (
                                      <i className="ri-shield-check-line text-success-500 text-2xl"></i>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    {hasAnomalies ? (
                                      <div>
                                        <p className="text-sm font-medium text-gray-700">Anomalies detected:</p>
                                        <ul className="mt-1 text-sm text-gray-600 list-disc pl-5">
                                          {document.anomalies.items.map((item: any, index: number) => (
                                            <li key={index}>
                                              {item.type} (Confidence: {item.confidence}%)
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-gray-600">No anomalies detected in this document.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-base font-medium text-gray-900 mb-2">Compliance Check</h4>
                              <div className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0">
                                    {document.complianceStatus === 'Pass' ? (
                                      <i className="ri-shield-check-line text-success-500 text-2xl"></i>
                                    ) : document.complianceStatus === 'Warning' ? (
                                      <i className="ri-alert-line text-warning-500 text-2xl"></i>
                                    ) : (
                                      <i className="ri-close-circle-line text-error-500 text-2xl"></i>
                                    )}
                                  </div>
                                  <div className="ml-3">
                                    {document.complianceStatus === 'Pass' ? (
                                      <p className="text-sm text-gray-600">This document passes all compliance checks.</p>
                                    ) : document.complianceStatus === 'Warning' ? (
                                      <p className="text-sm text-gray-600">This document has minor compliance issues.</p>
                                    ) : (
                                      <p className="text-sm text-gray-600">This document has major compliance violations.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

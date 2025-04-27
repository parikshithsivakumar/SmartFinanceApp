import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import LoadingOverlay from "@/components/LoadingOverlay";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [documentType, setDocumentType] = useState<string>("Financial");
  const [file, setFile] = useState<File | null>(null);
  const [extractInfo, setExtractInfo] = useState<boolean>(true);
  const [summarize, setSummarize] = useState<boolean>(true);
  const [anomalyDetection, setAnomalyDetection] = useState<boolean>(true);
  const [complianceCheck, setComplianceCheck] = useState<boolean>(true);
  const [_, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh document list
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      
      // Show success message
      toast({
        title: "Upload successful",
        description: "Your document has been uploaded and processed successfully.",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload document",
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setFile(event.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("name", file.name);
    formData.append("documentType", documentType);
    formData.append("extractInfo", extractInfo.toString());
    formData.append("summarize", summarize.toString());
    formData.append("anomalyDetection", anomalyDetection.toString());
    formData.append("complianceCheck", complianceCheck.toString());
    
    uploadMutation.mutate(formData);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {uploadMutation.isPending && <LoadingOverlay />}
          
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Upload Document</h1>
            <p className="text-gray-600">Upload financial or legal documents for analysis</p>
          </div>
          
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Document Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="relative flex cursor-pointer">
                        <input
                          type="radio"
                          name="documentType"
                          value="Financial"
                          className="peer sr-only"
                          checked={documentType === "Financial"}
                          onChange={() => setDocumentType("Financial")}
                        />
                        <div className="flex items-center px-5 py-3 border-2 rounded-lg peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:bg-gray-50">
                          <i className="ri-bank-line text-xl mr-2 text-gray-500 peer-checked:text-primary-500"></i>
                          <span className="font-medium">Financial Document</span>
                        </div>
                      </label>
                      
                      <label className="relative flex cursor-pointer">
                        <input
                          type="radio"
                          name="documentType"
                          value="Legal"
                          className="peer sr-only"
                          checked={documentType === "Legal"}
                          onChange={() => setDocumentType("Legal")}
                        />
                        <div className="flex items-center px-5 py-3 border-2 rounded-lg peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:bg-gray-50">
                          <i className="ri-scales-3-line text-xl mr-2 text-gray-500 peer-checked:text-primary-500"></i>
                          <span className="font-medium">Legal Document</span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="space-y-1 text-center">
                        <i className="ri-upload-cloud-2-line text-gray-400 text-5xl mx-auto"></i>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.jpg,.jpeg,.png,.txt"
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG, TXT up to 10MB</p>
                      </div>
                    </div>
                    {file && (
                      <div className="mt-2">
                        <div className="flex items-center p-2 bg-gray-50 rounded-md">
                          <i className="ri-file-text-line text-gray-500 text-xl mr-2"></i>
                          <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            className="ml-auto text-red-500 hover:text-red-700"
                            onClick={removeFile}
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Processing Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Processing Options</label>
                    <div className="space-y-2">
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="extract-info"
                            name="extract-info"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={extractInfo}
                            onChange={(e) => setExtractInfo(e.target.checked)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="extract-info" className="font-medium text-gray-700">Extract Key Information</label>
                          <p className="text-gray-500">Extract names, dates, amounts, and other important details</p>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="summarize"
                            name="summarize"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={summarize}
                            onChange={(e) => setSummarize(e.target.checked)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="summarize" className="font-medium text-gray-700">Summarize Document</label>
                          <p className="text-gray-500">Generate a concise summary of the document</p>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="anomaly-detection"
                            name="anomaly-detection"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={anomalyDetection}
                            onChange={(e) => setAnomalyDetection(e.target.checked)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="anomaly-detection" className="font-medium text-gray-700">Detect Anomalies</label>
                          <p className="text-gray-500">Identify unusual patterns or suspicious activities</p>
                        </div>
                      </div>
                      
                      <div className="relative flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="compliance-check"
                            name="compliance-check"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            checked={complianceCheck}
                            onChange={(e) => setComplianceCheck(e.target.checked)}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="compliance-check" className="font-medium text-gray-700">Check Compliance</label>
                          <p className="text-gray-500">Verify compliance with regulatory standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                      disabled={uploadMutation.isPending || !file}
                    >
                      Process Document
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

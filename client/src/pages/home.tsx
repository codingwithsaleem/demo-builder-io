import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Calculator, History } from "lucide-react";
import FileUpload from "@/components/file-upload";
import MaterialSelection from "@/components/material-selection";
import QuoteResults from "@/components/quote-results";
import RecentQuotes from "@/components/recent-quotes";
import type { Material, FileUploadResult, QuoteCalculationRequest } from "@shared/schema";

interface QuoteCalculation {
  volume: number;
  material: Material;
  weight: number;
  materialCost: number;
  quantity: number;
  markupPercentage: number;
  subtotal: number;
  markupAmount: number;
  total: number;
}

export default function Home() {
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [markupPercentage, setMarkupPercentage] = useState(25);
  const [quoteCalculation, setQuoteCalculation] = useState<QuoteCalculation | null>(null);

  // Fetch materials
  const { data: materials = [] } = useQuery<Material[]>({
    queryKey: ['/api/materials'],
  });

  const handleFileUploaded = (result: FileUploadResult) => {
    setUploadResult(result);
    // Clear previous calculation when new file is uploaded
    setQuoteCalculation(null);
  };

  const handleMaterialSelected = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleQuoteCalculated = (calculation: QuoteCalculation) => {
    setQuoteCalculation(calculation);
  };

  const canCalculateQuote = uploadResult && selectedMaterial;

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-main))]">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Box className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-foreground">STP Quote Generator</h1>
            </div>
            <div className="text-sm text-secondary">
              Professional Manufacturing Tool
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Section */}
          <div className="space-y-6">
            <FileUpload onFileUploaded={handleFileUploaded} />
            
            <MaterialSelection 
              materials={materials}
              selectedMaterial={selectedMaterial}
              onMaterialSelected={handleMaterialSelected}
            />

            {/* Additional Options */}
            <div className="quote-card rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <Calculator className="mr-2 text-primary" />
                Additional Options
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-foreground mb-2">
                    Quantity
                  </label>
                  <input 
                    type="number" 
                    id="quantity" 
                    value={quantity} 
                    min="1" 
                    className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    data-testid="input-quantity"
                  />
                </div>
                
                <div>
                  <label htmlFor="markup" className="block text-sm font-medium text-foreground mb-2">
                    Markup Percentage
                  </label>
                  <select 
                    id="markup" 
                    value={markupPercentage}
                    className="w-full border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                    onChange={(e) => setMarkupPercentage(parseInt(e.target.value))}
                    data-testid="select-markup"
                  >
                    <option value={0}>No markup</option>
                    <option value={15}>15%</option>
                    <option value={25}>25%</option>
                    <option value={35}>35%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results Section */}
          <div className="space-y-6">
            <QuoteResults 
              uploadResult={uploadResult}
              selectedMaterial={selectedMaterial}
              quantity={quantity}
              markupPercentage={markupPercentage}
              canCalculate={!!canCalculateQuote}
              onQuoteCalculated={handleQuoteCalculated}
              quoteCalculation={quoteCalculation}
            />

            <div className="quote-card rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <History className="mr-2 text-primary" />
                Recent Quotes
              </h2>
              <RecentQuotes />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-sm text-secondary">
              © 2024 STP Quote Generator. Professional manufacturing quotes.
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Help</a>
              <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">API Docs</a>
              <a href="#" className="text-sm text-secondary hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

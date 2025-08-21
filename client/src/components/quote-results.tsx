import { useEffect, useState } from "react";
import { Calculator, Info, Box, TrendingUp, Download, Save, AlertTriangle, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Material, FileUploadResult } from "@shared/schema";

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

interface QuoteResultsProps {
  uploadResult: FileUploadResult | null;
  selectedMaterial: Material | null;
  quantity: number;
  markupPercentage: number;
  canCalculate: boolean;
  onQuoteCalculated: (calculation: QuoteCalculation) => void;
  quoteCalculation: QuoteCalculation | null;
}

export default function QuoteResults({ 
  uploadResult, 
  selectedMaterial, 
  quantity, 
  markupPercentage, 
  canCalculate,
  onQuoteCalculated,
  quoteCalculation 
}: QuoteResultsProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!canCalculate) {
      return;
    }

    const calculateQuote = async () => {
      setIsCalculating(true);
      setError(null);

      try {
        const response = await apiRequest('POST', '/api/quotes/calculate', {
          volume: uploadResult!.volume,
          materialId: selectedMaterial!.id,
          quantity,
          markupPercentage,
        });

        const calculation: QuoteCalculation = await response.json();
        onQuoteCalculated(calculation);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Quote calculation failed';
        setError(errorMessage);
        toast({
          title: "Calculation failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsCalculating(false);
      }
    };

    calculateQuote();
  }, [uploadResult, selectedMaterial, quantity, markupPercentage, canCalculate, onQuoteCalculated, toast]);

  const handleSaveQuote = async () => {
    if (!quoteCalculation || !uploadResult) return;

    try {
      await apiRequest('POST', '/api/quotes', {
        fileName: uploadResult.fileName,
        volume: quoteCalculation.volume,
        materialId: quoteCalculation.material.id,
        weight: quoteCalculation.weight,
        materialCost: quoteCalculation.materialCost,
        quantity: quoteCalculation.quantity,
        markupPercentage: quoteCalculation.markupPercentage,
        subtotal: quoteCalculation.subtotal,
        total: quoteCalculation.total,
      });

      toast({
        title: "Quote saved",
        description: "Quote has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save quote",
        variant: "destructive",
      });
    }
  };

  const handleExportQuote = () => {
    if (!quoteCalculation || !uploadResult) return;

    const quoteData = {
      fileName: uploadResult.fileName,
      material: quoteCalculation.material.name,
      volume: quoteCalculation.volume,
      weight: quoteCalculation.weight,
      quantity: quoteCalculation.quantity,
      materialCost: quoteCalculation.materialCost,
      markupPercentage: quoteCalculation.markupPercentage,
      subtotal: quoteCalculation.subtotal,
      total: quoteCalculation.total,
      date: new Date().toLocaleDateString(),
    };

    const dataStr = JSON.stringify(quoteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-${uploadResult.fileName.replace('.stp', '')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="quote-card rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Calculator className="mr-2 text-primary" />
        Quote Results
      </h2>

      {/* Default State */}
      {!canCalculate && !quoteCalculation && !error && (
        <div className="text-center py-12" data-testid="default-state">
          <File className="mx-auto text-6xl text-muted-foreground mb-4" />
          <p className="text-lg text-secondary mb-2">Upload a file and select material</p>
          <p className="text-sm text-muted-foreground">to generate your quote</p>
        </div>
      )}

      {/* Loading State */}
      {isCalculating && (
        <div className="text-center py-12">
          <Calculator className="mx-auto text-6xl text-muted-foreground mb-4 animate-pulse" />
          <p className="text-lg text-secondary mb-2">Calculating quote...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      )}

      {/* Results Display */}
      {quoteCalculation && !isCalculating && (
        <div data-testid="results-display">
          {/* File Information */}
          <div className="info-bg rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <Info className="mr-2 text-primary" />
              File Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary">File Name</p>
                <p className="font-medium text-foreground" data-testid="text-result-filename">
                  {uploadResult?.fileName}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Volume</p>
                <p className="font-medium text-foreground" data-testid="text-result-volume">
                  {quoteCalculation.volume.toFixed(2)} cm³
                </p>
              </div>
            </div>
          </div>

          {/* Material Information */}
          <div className="success-bg rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <Box className="mr-2 text-success" />
              Material Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-secondary">Material</p>
                <p className="font-medium text-foreground" data-testid="text-result-material">
                  {quoteCalculation.material.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Density</p>
                <p className="font-medium text-foreground" data-testid="text-result-density">
                  {quoteCalculation.material.density} g/cm³
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary">Weight</p>
                <p className="font-medium text-foreground" data-testid="text-result-weight">
                  {quoteCalculation.weight.toFixed(1)} g
                </p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center">
              <TrendingUp className="mr-2 text-secondary" />
              Cost Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Material Cost</span>
                <span className="font-medium" data-testid="text-result-material-cost">
                  ${quoteCalculation.materialCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Quantity</span>
                <span className="font-medium" data-testid="text-result-quantity">
                  {quoteCalculation.quantity} unit{quoteCalculation.quantity > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Subtotal</span>
                <span className="font-medium" data-testid="text-result-subtotal">
                  ${quoteCalculation.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Markup ({quoteCalculation.markupPercentage}%)</span>
                <span className="font-medium" data-testid="text-result-markup">
                  ${quoteCalculation.markupAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-semibold text-foreground">Total Quote</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-result-total">
                  ${quoteCalculation.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              className="flex-1" 
              onClick={handleExportQuote}
              data-testid="button-export-quote"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Quote
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={handleSaveQuote}
              data-testid="button-save-quote"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Quote
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12" data-testid="error-state">
          <AlertTriangle className="mx-auto text-6xl text-destructive mb-4" />
          <p className="text-lg text-destructive mb-2">Processing Error</p>
          <p className="text-sm text-secondary mb-4" data-testid="text-error-message">
            {error}
          </p>
          <Button 
            onClick={() => setError(null)}
            data-testid="button-retry"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}

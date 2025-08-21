import { Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Material } from "@shared/schema";

interface MaterialSelectionProps {
  materials: Material[];
  selectedMaterial: Material | null;
  onMaterialSelected: (material: Material) => void;
}

export default function MaterialSelection({ materials, selectedMaterial, onMaterialSelected }: MaterialSelectionProps) {
  const handleMaterialChange = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      onMaterialSelected(material);
    }
  };

  return (
    <div className="quote-card rounded-lg p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <Layers className="mr-2 text-primary" />
        Select Material
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="material" className="block text-sm font-medium text-foreground mb-2">
            Material Type
          </label>
          <Select onValueChange={handleMaterialChange} value={selectedMaterial?.id || ""}>
            <SelectTrigger className="w-full" data-testid="select-material">
              <SelectValue placeholder="Select material..." />
            </SelectTrigger>
            <SelectContent>
              {materials.map((material) => (
                <SelectItem 
                  key={material.id} 
                  value={material.id}
                  data-testid={`option-material-${material.id}`}
                >
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Material Properties Display */}
        {selectedMaterial && (
          <div className="bg-muted rounded-md p-4" data-testid="material-properties">
            <h3 className="text-sm font-medium text-foreground mb-2">Material Properties</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-secondary">Density</p>
                <p className="font-semibold text-foreground" data-testid="text-material-density">
                  {selectedMaterial.density} g/cm³
                </p>
              </div>
              <div>
                <p className="text-xs text-secondary">Cost per gram</p>
                <p className="font-semibold text-foreground" data-testid="text-material-cost">
                  ${selectedMaterial.costPerGram.toFixed(3)}/g
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

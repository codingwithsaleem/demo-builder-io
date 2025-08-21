#!/usr/bin/env python3
"""
STP/STEP Volume Extraction Script using FreeCAD
Extracts real volume data from STEP files
"""

import sys
import os

def extract_volume(step_file_path):
    """Extract volume from STEP file using FreeCAD"""
    try:
        # Try to import FreeCAD
        try:
            import FreeCAD
        except ImportError:
            # Try alternative import paths
            try:
                sys.path.append('/usr/lib/freecad-python3/lib')
                sys.path.append('/usr/lib/freecad/lib')
                sys.path.append('/Applications/FreeCAD.app/Contents/lib')
                import FreeCAD
            except ImportError:
                return {"error": "FreeCAD not installed or not in PATH"}

        # Create new document
        doc = FreeCAD.newDocument("VolumeExtraction")
        
        # Import STEP file
        try:
            import Import
            Import.insert(step_file_path, doc.Name)
        except Exception as e:
            FreeCAD.closeDocument(doc.Name)
            return {"error": f"Failed to import STEP file: {str(e)}"}
        
        total_volume = 0.0
        object_count = 0
        
        # Calculate volume for all objects
        for obj in doc.Objects:
            if hasattr(obj, 'Shape') and hasattr(obj.Shape, 'Volume'):
                if obj.Shape.Volume > 0:
                    total_volume += obj.Shape.Volume
                    object_count += 1
        
        # Clean up
        FreeCAD.closeDocument(doc.Name)
        
        if total_volume <= 0:
            return {"error": "No valid solid objects found in STEP file"}
        
        # Convert from mm³ to cm³ (FreeCAD uses mm as default)
        volume_cm3 = total_volume / 1000.0
        
        return {
            "volume": volume_cm3,
            "units": "cm3",
            "object_count": object_count,
            "success": True
        }
        
    except Exception as e:
        return {"error": f"Volume extraction failed: {str(e)}"}

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print('{"error": "Usage: python3 extract_volume.py <step_file_path>"}')
        sys.exit(1)
    
    step_file_path = sys.argv[1]
    
    if not os.path.exists(step_file_path):
        print('{"error": "STEP file not found"}')
        sys.exit(1)
    
    result = extract_volume(step_file_path)
    
    # Output as JSON for easy parsing
    import json
    print(json.dumps(result))

if __name__ == "__main__":
    main()
import os
from PIL import Image

def main():
    print("Starting image cropping...")
    
    # Paths
    # Find the menu image dynamically to avoid encoding issues
    menu_image_path = None
    for file in os.listdir("."):
        if "النصر" in file and "منيو" in file and file.lower().endswith((".jpg", ".jpeg", ".png")):
            menu_image_path = file
            break
            
    if not menu_image_path:
        # Fallback to direct listing search
        for file in os.listdir("."):
            if "page-0001" in file or "منيو" in file:
                menu_image_path = file
                break
                
    assets_dir = "assets"
    products_dir = os.path.join(assets_dir, "products")
    
    # Ensure directories exist
    os.makedirs(products_dir, exist_ok=True)
    
    # Check if menu image exists
    if not menu_image_path or not os.path.exists(menu_image_path):
        print(f"Error: Menu card image not found in current directory. Files present: {os.listdir('.')}")
        return
        
    img = Image.open(menu_image_path)
    print(f"Loaded menu image: {img.size} ({img.format})")
    
    # Coordinates mapping
    # Adjusting logo crop slightly to get a clean text and image without outer borders
    crops = {
        "logo": (280, 30, 960, 345),
        "products/mozzarella": (50, 480, 350, 730),
        "products/cheddar": (50, 765, 350, 1015),
        "products/mix_cheese": (50, 1050, 350, 1300),
        "products/pastirma": (50, 1335, 350, 1585),
        "products/sada": (650, 480, 950, 730),
        "products/waraq_lahma": (650, 765, 950, 1015),
        "products/waraq_sojoq": (650, 1050, 950, 1300),
        "products/waraq_kebda": (650, 1335, 950, 1585)
    }
    
    for name, box in crops.items():
        try:
            cropped = img.crop(box)
            output_path = os.path.join(assets_dir, f"{name}.jpg")
            cropped.save(output_path, "JPEG", quality=95)
            print(f"Successfully saved: {output_path}")
        except Exception as e:
            print(f"Error cropping {name}: {e}")
            
    print("Image preparation finished successfully!")

if __name__ == "__main__":
    main()

from PIL import Image
import sys

def remove_checkerboard(image_path, output_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check for white/gray checkerboard colors
            # Adjust logical range as needed. Checkerboards are usually pure white (255,255,255) and light gray (e.g. 204,204,204)
            if (item[0] > 200 and item[1] > 200 and item[2] > 200):
                # Make it transparent
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {image_path}")
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <input_path> <output_path>")
    else:
        remove_checkerboard(sys.argv[1], sys.argv[2])

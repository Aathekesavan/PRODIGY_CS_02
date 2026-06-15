import io
import time
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

import encryption

app = Flask(__name__)
# Enable CORS for all routes, allowing React app on http://localhost:5173
CORS(app, resources={r"/api/*": {"origins": "*"}})

def parse_base64_image(base64_str):
    """Decodes a base64 image string into a PIL Image."""
    if "," in base64_str:
        # Strip header like data:image/png;base64,
        base64_str = base64_str.split(",")[1]
    
    img_data = base64.b64decode(base64_str)
    img_bytes = io.BytesIO(img_data)
    img = Image.open(img_bytes)
    return img, len(img_data)

def to_base64_image(img: Image.Image) -> str:
    """Encodes a PIL Image to a base64 PNG string."""
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_bytes = buffered.getvalue()
    base64_str = base64.b64encode(img_bytes).decode("utf-8")
    return f"data:image/png;base64,{base64_str}", len(img_bytes)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "engine": "PIXELCRYPT Python Core 1.0"})

@app.route("/api/encrypt", methods=["POST"])
def encrypt():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON request body"}), 400
            
        base64_image = data.get("image")
        key = data.get("key")
        algorithm = data.get("algorithm", "xor").lower()
        
        if not base64_image:
            return jsonify({"error": "Missing 'image' parameter"}), 400
        if not key:
            return jsonify({"error": "Missing 'key' parameter"}), 400
            
        # Parse image
        img, original_size_bytes = parse_base64_image(base64_image)
        width, height = img.size
        
        # Standardize format (convert to RGB/RGBA)
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
            
        img_array = np.array(img)
        
        # Track processing speed
        start_time = time.perf_counter()
        
        if algorithm == "xor":
            processed_array = encryption.encrypt_xor(img_array, key)
        elif algorithm == "shuffle":
            processed_array = encryption.encrypt_shuffle(img_array, key)
        elif algorithm == "hybrid":
            processed_array = encryption.encrypt_hybrid(img_array, key)
        else:
            return jsonify({"error": f"Unknown algorithm: {algorithm}"}), 400
            
        end_time = time.perf_counter()
        processing_time_ms = round((end_time - start_time) * 1000, 2)
        
        # Convert NumPy array back to PIL Image
        processed_img = Image.fromarray(processed_array)
        
        # Save as lossless PNG and encode
        encrypted_base64, encrypted_size_bytes = to_base64_image(processed_img)
        
        return jsonify({
            "image": encrypted_base64,
            "analytics": {
                "originalSize": original_size_bytes,
                "encryptedSize": encrypted_size_bytes,
                "resolution": f"{width}x{height}",
                "width": width,
                "height": height,
                "processingTimeMs": processing_time_ms,
                "keyLength": len(key),
                "algorithm": algorithm.upper()
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/api/decrypt", methods=["POST"])
def decrypt():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON request body"}), 400
            
        base64_image = data.get("image")
        key = data.get("key")
        algorithm = data.get("algorithm", "xor").lower()
        
        if not base64_image:
            return jsonify({"error": "Missing 'image' parameter"}), 400
        if not key:
            return jsonify({"error": "Missing 'key' parameter"}), 400
            
        # Parse image (must be the PNG-lossless format returned by encrypt)
        img, encrypted_size_bytes = parse_base64_image(base64_image)
        width, height = img.size
        
        # Decrypted image needs exact color values. PIL should parse original RGB/RGBA.
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGBA")
        else:
            img = img.convert("RGB")
            
        img_array = np.array(img)
        
        # Track processing speed
        start_time = time.perf_counter()
        
        if algorithm == "xor":
            processed_array = encryption.decrypt_xor(img_array, key)
        elif algorithm == "shuffle":
            processed_array = encryption.decrypt_shuffle(img_array, key)
        elif algorithm == "hybrid":
            processed_array = encryption.decrypt_hybrid(img_array, key)
        else:
            return jsonify({"error": f"Unknown algorithm: {algorithm}"}), 400
            
        end_time = time.perf_counter()
        processing_time_ms = round((end_time - start_time) * 1000, 2)
        
        # Convert NumPy array back to PIL Image
        processed_img = Image.fromarray(processed_array)
        
        # Save as PNG
        decrypted_base64, decrypted_size_bytes = to_base64_image(processed_img)
        
        return jsonify({
            "image": decrypted_base64,
            "analytics": {
                "encryptedSize": encrypted_size_bytes,
                "decryptedSize": decrypted_size_bytes,
                "resolution": f"{width}x{height}",
                "width": width,
                "height": height,
                "processingTimeMs": processing_time_ms,
                "keyLength": len(key),
                "algorithm": algorithm.upper()
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Start the dev server on port 5000
    app.run(host="0.0.0.0", port=5000, debug=True)

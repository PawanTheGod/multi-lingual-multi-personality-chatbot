#!/usr/bin/env python3
"""
Simple BLIP-2 Image Analysis Service
This provides a local HTTP service for BLIP-2 image analysis
"""

import os
import sys
import json
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model
processor = None
model = None
model_loaded = False

def load_blip2_model(model_name="Salesforce/blip2-opt-2.7b"):
    """Load BLIP-2 model and processor"""
    global processor, model, model_loaded
    
    if model_loaded:
        return True
    
    try:
        logger.info(f"Loading BLIP-2 model: {model_name}")
        
        # Try importing required libraries
        from transformers import Blip2Processor, Blip2ForConditionalGeneration
        import torch
        from PIL import Image
        
        # Load model and processor
        processor = Blip2Processor.from_pretrained(model_name)
        model = Blip2ForConditionalGeneration.from_pretrained(model_name)
        
        # Move to GPU if available and optimize for RTX 3060
        device = "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cuda":
            # Enable memory efficient attention for RTX 3060
            try:
                model = model.to(device, torch.float16)  # Use half precision to save VRAM
                logger.info(f"Model loaded on GPU with half precision (RTX 3060 optimized)")
            except:
                model = model.to(device)  # Fallback to full precision
                logger.info(f"Model loaded on GPU with full precision")
        else:
            model = model.to(device)
        
        model_loaded = True
        logger.info(f"Model loaded successfully on {device}")
        return True
        
    except ImportError as e:
        logger.error(f"Missing dependencies: {e}")
        logger.error("Install with: pip install transformers torch pillow flask flask-cors")
        return False
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model_loaded,
        "service": "BLIP-2 Image Analysis"
    })

@app.route('/models', methods=['GET'])
def get_models():
    """Get available BLIP-2 models"""
    models = [
        "Salesforce/blip2-opt-2.7b",
        "Salesforce/blip2-opt-6.7b", 
        "Salesforce/blip2-flan-t5-xl"
    ]
    return jsonify({"models": models})

@app.route('/caption', methods=['POST'])
def generate_caption():
    """Simple image captioning"""
    global processor, model, model_loaded
    
    if not model_loaded:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Process image
        inputs = processor(image, return_tensors="pt")
        
        # Move inputs to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate caption
        with torch.no_grad():
            generated_ids = model.generate(**inputs, max_length=50)
        
        caption = processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        
        return jsonify({
            "caption": caption,
            "model": data.get('model', 'blip2-flan-t5-small')
        })
        
    except Exception as e:
        logger.error(f"Caption generation error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_image():
    """Detailed image analysis with custom prompt"""
    global processor, model, model_loaded
    
    if not model_loaded:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
        
        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Use custom prompt if provided, otherwise use default
        prompt = data.get('prompt', "Describe this image in detail.")
        
        # Process image with prompt
        inputs = processor(image, prompt, return_tensors="pt")
        
        # Move inputs to same device as model
        device = next(model.parameters()).device
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Generate detailed analysis
        max_length = data.get('max_length', 200)
        with torch.no_grad():
            generated_ids = model.generate(**inputs, max_length=max_length, do_sample=True, temperature=0.7)
        
        description = processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        
        return jsonify({
            "description": description,
            "prompt": prompt,
            "model": data.get('model', 'blip2-flan-t5-small')
        })
        
    except Exception as e:
        logger.error(f"Image analysis error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Get model name from environment or use default
    model_name = os.getenv('BLIP2_MODEL', 'Salesforce/blip2-opt-2.7b')
    port = int(os.getenv('PORT', 8080))
    
    print("🤖 Starting BLIP-2 Image Analysis Service...")
    print(f"📋 Model: {model_name}")
    print(f"🔌 Port: {port}")
    
    # Load model
    if not load_blip2_model(model_name):
        print("❌ Failed to load model. Please check dependencies.")
        print("💡 Install with: pip install transformers torch pillow flask flask-cors")
        sys.exit(1)
    
    print("✅ Model loaded successfully!")
    print(f"🌐 Starting server at http://localhost:{port}")
    
    # Start Flask app
    app.run(host='0.0.0.0', port=port, debug=False)

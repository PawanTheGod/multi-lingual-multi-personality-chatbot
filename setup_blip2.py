#!/usr/bin/env python3
"""
BLIP-2 Setup Script
This script checks and installs the required dependencies for BLIP-2
"""

import sys
import subprocess
import importlib
import platform

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        print(f"📍 Current version: {platform.python_version()}")
        return False
    print(f"✅ Python version: {platform.python_version()}")
    return True

def install_package(package_name):
    """Install a package using pip"""
    try:
        print(f"📦 Installing {package_name}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package_name])
        return True
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package_name}")
        return False

def check_and_install_dependencies():
    """Check and install required dependencies"""
    dependencies = [
        ("torch", "torch"),
        ("transformers", "transformers"),
        ("PIL", "Pillow"),
        ("flask", "flask"),
        ("flask_cors", "flask-cors")
    ]
    
    missing_deps = []
    
    # Check which dependencies are missing
    for import_name, package_name in dependencies:
        try:
            importlib.import_module(import_name)
            print(f"✅ {package_name} is already installed")
        except ImportError:
            print(f"❌ {package_name} is not installed")
            missing_deps.append(package_name)
    
    # Install missing dependencies
    if missing_deps:
        print(f"\n📥 Installing {len(missing_deps)} missing packages...")
        for package in missing_deps:
            if not install_package(package):
                return False
        print("✅ All dependencies installed successfully!")
    else:
        print("✅ All dependencies are already installed!")
    
    return True

def check_gpu_support():
    """Check if GPU support is available"""
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            vram = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"✅ GPU Support: {gpu_name} ({vram:.1f}GB VRAM)")
            return True
        else:
            print("⚠️  No GPU detected - will use CPU (slower)")
            return False
    except ImportError:
        print("❓ Cannot check GPU support (torch not installed)")
        return False

def test_blip2_import():
    """Test if BLIP-2 can be imported properly"""
    try:
        print("🧪 Testing BLIP-2 import...")
        from transformers import Blip2Processor, Blip2ForConditionalGeneration
        print("✅ BLIP-2 import successful!")
        return True
    except ImportError as e:
        print(f"❌ BLIP-2 import failed: {e}")
        return False

def estimate_model_size():
    """Estimate download size for different models"""
    models = {
        "blip2-flan-t5-small": "2.7GB",
        "blip2-flan-t5-base": "4.2GB", 
        "blip2-flan-t5-xl": "15GB"
    }
    
    print("📊 Estimated model download sizes:")
    for model, size in models.items():
        print(f"   • {model}: {size}")

def main():
    print("🚀 BLIP-2 Setup Script")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Check and install dependencies  
    if not check_and_install_dependencies():
        return False
    
    # Check GPU support
    check_gpu_support()
    
    # Test BLIP-2 import
    if not test_blip2_import():
        return False
    
    # Show model sizes
    print("\n" + "=" * 50)
    estimate_model_size()
    
    print("\n✅ Setup completed successfully!")
    print("\n🎯 Next steps:")
    print("1. Run the BLIP-2 service:")
    print("   python blip2_service.py")
    print("2. The service will start on http://localhost:8080")
    print("3. In your app, select 'BLIP-2 Vision' mode")
    print("4. Upload an image to test!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n🎉 Ready to analyze images with BLIP-2!")

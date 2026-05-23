import io
import os
import torch
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

app = FastAPI(title="Smart Internship AI Service", version="1.0.0")

# Allow communication from your Laravel gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global memory cache for OCR model
model: Optional[object] = None


@app.on_event("startup")
def load_model():
    """ "Load the model and tokenizer into memory at startup."""
    global model, tokenizer
    print("Loading model and tokenizer...")

    # Using EasyOCR as a more reliable alternative to DeepSeek-OCR-2
    model_name = "easyocr"
    
    try:
        import easyocr
        model = easyocr.Reader(['en'])  # type: ignore
        print("✅ EasyOCR loaded successfully!")
    except ImportError:
        print("⚠️ EasyOCR not installed. Install with: pip install easyocr")
        model = None  # type: ignore
    except Exception as e:
        print(f"❌ Error loading EasyOCR: {e}")
        model = None  # type: ignore


@app.post("/extract-text/")
async def extract_text(file: UploadFile = File(...)):
    """Endpoint to extract text from an uploaded image file."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Invalid file type. Please upload an image."
        )

    try:
        # Ensure model is loaded
        if model is None:
            raise HTTPException(
                status_code=503, detail="OCR model is still loading. Please try again."
            )
        
        # Read the uploaded file into memory
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Save image temporarily for EasyOCR processing
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            image.save(tmp.name)
            temp_path = tmp.name
        
        try:
            # Use EasyOCR to extract text
            results = model.readtext(temp_path)  # type: ignore
            extracted_text = "\n".join([text[1] for text in results])
            
            print(f"Extracted Text: {extracted_text}")
            return {"extracted_text": extracted_text}
        finally:
            # Clean up temporary file
            import os
            if os.path.exists(temp_path):
                os.remove(temp_path)
    
    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail="Error processing image.")
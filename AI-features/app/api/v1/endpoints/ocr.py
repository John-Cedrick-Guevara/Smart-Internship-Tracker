from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.ocr import OCRResponseSchema
from app.pipelines.coordinator import MultumodalPipeline

router = APIRouter()
pipeline = MultumodalPipeline()

@router.post("/extract", response_model=OCRResponseSchema)
async def extract_text_from_image(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG and PNG are allowed.")
    
    try:
        image_bytes = await file.read()
        result = pipeline.process_image(image_bytes)
        return OCRResponseSchema(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
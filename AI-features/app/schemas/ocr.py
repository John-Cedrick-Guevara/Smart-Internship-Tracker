from pydantic import BaseModel
from typing import Optional

class OCRResponseSchema(BaseModel):
    company_name: str
    company_email: Optional[str] = "Unknown"
    position: str
    location: Optional[str] = "Unknown"
    duration: Optional[str] = "Unknown"
    url: Optional[str] = "Unknown"
    is_paid: Optional[str] = "Unknown"
    internship_details: Optional[str] = "Unknown"  # a raw text summary of the internship posting, useful for downstream tasks like interview question generation
    
    # automated prep interview question generation based on the extracted job details
    interview_questions: Optional[list[str]] = []
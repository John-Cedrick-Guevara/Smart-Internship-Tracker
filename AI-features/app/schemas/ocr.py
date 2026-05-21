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
"""
FastAPI Application for Document Information Extraction

This is the main entry point for the Document Intelligence System API.
It exposes a REST endpoint for extracting structured information from PDF and TXT documents.

Example API Request:
    POST /extract
    Content-Type: multipart/form-data
    
    Form data:
    - file: (binary) document.pdf or document.txt

Example API Response:
    {
        "name": ["John Doe", "Jane Smith"],
        "organization": ["Microsoft", "OpenAI"],
        "location": ["New York", "USA"],
        "dates": ["2024-01-15", "March 15, 2024"]
    }
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from contextlib import asynccontextmanager
import uvicorn

from extractor import DocumentExtractor

# Initialize the document extractor (loads model on startup)
extractor: Optional[DocumentExtractor] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    global extractor
    try:
        extractor = DocumentExtractor()
        print("Document extractor initialized successfully")
    except Exception as e:
        print(f"Warning: Failed to initialize document extractor: {str(e)}")
        raise
    yield
    # Shutdown (if needed in the future)
    # Cleanup code can go here


# Initialize FastAPI app
app = FastAPI(
    title="Document Information Extraction API",
    description="Extract structured information (names, organizations, locations, dates) from PDF and TXT documents",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "message": "Document Information Extraction API",
        "version": "1.0.0",
        "endpoints": {
            "POST /extract": "Extract information from PDF or TXT documents",
            "GET /health": "Health check endpoint"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "extractor_ready": extractor is not None
    }


@app.post("/extract")
async def extract_document_info(file: UploadFile = File(...)):
    """
    Extract structured information from a PDF or TXT document.
    
    Args:
        file: Uploaded file (PDF or TXT format)
        
    Returns:
        JSON response with extracted entities:
        {
            "name": [list of names],
            "organization": [list of organizations],
            "location": [list of locations],
            "dates": [list of dates]
        }
        
    Raises:
        HTTPException: If file processing fails
    """
    if extractor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Document extractor is not initialized"
        )
    
    # Validate file type
    if file.filename is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )
    
    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ""
    
    if file_extension not in ['pdf', 'txt']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_extension}. Supported types: pdf, txt"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        if not file_content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty"
            )
        
        # Extract information from document
        result = extractor.extract(file_content, file_extension)
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
    
    except ValueError as e:
        # Handle validation errors (empty files, unsupported formats, etc.)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except RuntimeError as e:
        # Handle runtime errors (model loading, processing failures)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing error: {str(e)}"
        )
    
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )


# Sample request and response examples (for documentation):
"""
Sample Request (using curl):
    curl -X POST "http://localhost:8000/extract" \
         -H "accept: application/json" \
         -H "Content-Type: multipart/form-data" \
         -F "file=@document.pdf"

Sample Request (using Python requests):
    import requests
    
    with open("document.pdf", "rb") as f:
        files = {"file": ("document.pdf", f, "application/pdf")}
        response = requests.post("http://localhost:8000/extract", files=files)
        print(response.json())

Sample Response (Success):
    {
        "name": ["John Doe", "Jane Smith"],
        "organization": ["Microsoft Corporation", "OpenAI"],
        "location": ["New York", "San Francisco", "United States"],
        "dates": ["2024-01-15", "March 15, 2024", "12/31/2023"]
    }

Sample Response (Error - Invalid File Type):
    {
        "detail": "Unsupported file type: docx. Supported types: pdf, txt"
    }

Sample Response (Error - Empty File):
    {
        "detail": "Uploaded file is empty"
    }
"""


if __name__ == "__main__":
    # Run the application using uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
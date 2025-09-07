from datetime import timedelta
import logging
import traceback
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import crud
import models
import schemas
from database import SessionLocal, engine, get_db
import base64
import io
from PIL import Image
import secrets
from auth import (
    create_access_token, 
    get_current_user, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Invoice Generator API",
    description="A complete invoice management system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"] 
)

@app.get("/")
async def root():
    return {"message": "Invoice Generator API is running", "docs": "/docs"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Invoice Generator API is running"}

# Auth endpoints
@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Attempting to register user: {user.email}")
        db_user = crud.create_user(db, user)
        logger.info(f"User registered successfully: {user.email}")
        return db_user
    except ValueError as e:
        logger.warning(f"Registration failed - user exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        logger.info(f"Login attempt for: {form_data.username}")
        
        # FIX: Use crud.authenticate_user instead of just authenticate_user
        user = crud.authenticate_user(db, form_data.username, form_data.password)
        
        if not user:
            logger.warning(f"Login failed for: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logger.info(f"Login successful for: {form_data.username}")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "company_name": user.company_name
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )
    
# Fake auth for demo - in production use proper authentication
def get_current_user(db: Session = Depends(get_db)):
    # For demo purposes, we'll use user 1
    user = crud.get_user(db, 1)
    if not user:
        user = crud.create_user(db, schemas.UserCreate(
            email="demo@example.com",
            password="demo",
            company_name="Demo Company",
            address="123 Demo St, Demo City",
            phone="+1234567890",
            website="demo.com",
            tax_id="123-456-789"
        ))
    return user

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.post("/users/logo", response_model=schemas.LogoResponse)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logger.debug(f"Starting logo upload for user {current_user.id}")
        logger.debug(f"File details: {file.filename}, {file.content_type}, {file.size if hasattr(file, 'size') else 'unknown size'}")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
        if file.content_type not in allowed_types:
            error_msg = f"Invalid file type: {file.content_type}. Allowed: {allowed_types}"
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Read file contents
        contents = await file.read()
        logger.debug(f"File size: {len(contents)} bytes")
        
        # Validate file size (max 5MB)
        if len(contents) > 5 * 1024 * 1024:
            error_msg = f"File too large: {len(contents)} bytes. Maximum size is 5MB."
            logger.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Process image (resize if needed)
        if file.content_type.startswith('image/') and file.content_type != 'image/svg+xml':
            try:
                logger.debug("Attempting image processing")
                image = Image.open(io.BytesIO(contents))
                logger.debug(f"Original image size: {image.size}")
                
                # Resize to maximum 500x500 while maintaining aspect ratio
                image.thumbnail((500, 500))
                logger.debug(f"Resized image size: {image.size}")
                
                # Convert to bytes
                img_byte_arr = io.BytesIO()
                if file.content_type == 'image/jpeg':
                    image.save(img_byte_arr, format='JPEG', quality=85)
                elif file.content_type == 'image/png':
                    image.save(img_byte_arr, format='PNG', optimize=True)
                else:
                    # For other formats, keep original
                    img_byte_arr = io.BytesIO(contents)
                
                contents = img_byte_arr.getvalue()
                logger.debug(f"Processed file size: {len(contents)} bytes")
                
            except Exception as image_error:
                logger.warning(f"Image processing failed, using original file: {str(image_error)}")
                # If image processing fails, use original file
                contents = await file.read()  # Re-read the file
                pass
        
        # Update user logo
        logger.debug("Updating user logo in database")
        user = crud.update_user_logo(
            db, 
            current_user.id, 
            file.filename, 
            file.content_type, 
            contents
        )
        
        if not user:
            error_msg = "User not found after logo update"
            logger.error(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        logger.info(f"Logo uploaded successfully for user {current_user.id}: {file.filename}")
        
        return {
            "message": "Logo uploaded successfully",
            "filename": file.filename,
            "content_type": file.content_type
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are
        raise
    except Exception as e:
        # Log the full error with traceback
        error_details = traceback.format_exc()
        logger.error(f"Error uploading logo: {str(e)}")
        logger.error(f"Full traceback: {error_details}")
        
        # Return detailed error message
        raise HTTPException(
            status_code=500, 
            detail=f"Error uploading logo: {str(e)}. Check server logs for details."
        )
    
# Get logo endpoint
@app.get("/users/logo")
async def get_logo(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logo_data = crud.get_user_logo(db, current_user.id)
        if not logo_data:
            raise HTTPException(status_code=404, detail="Logo not found")
        
        # Return as base64 encoded string
        base64_data = base64.b64encode(logo_data['data']).decode('utf-8')
        
        return {
            "data": f"data:{logo_data['content_type']};base64,{base64_data}",
            "filename": logo_data['filename'],
            "content_type": logo_data['content_type']
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving logo: {str(e)}")

# Delete logo endpoint
@app.delete("/users/logo")
async def delete_logo(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        user = crud.delete_user_logo(db, current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"message": "Logo deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting logo: {str(e)}")

# Get user with logo data
@app.get("/users/me", response_model=schemas.UserWithLogo)
def get_current_user_with_logo(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        logo_data = crud.get_user_logo(db, current_user.id)
        user_data = current_user.__dict__
        
        if logo_data:
            base64_data = base64.b64encode(logo_data['data']).decode('utf-8')
            user_data['logo'] = f"data:{logo_data['content_type']};base64,{base64_data}"
            user_data['logo_filename'] = logo_data['filename']
            user_data['logo_content_type'] = logo_data['content_type']
        else:
            user_data['logo'] = None
            user_data['logo_filename'] = None
            user_data['logo_content_type'] = None
        
        return user_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving user data: {str(e)}")
    
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/clients/", response_model=List[schemas.Client])
def read_clients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)):
    clients = crud.get_clients(db, user_id=current_user.id, skip=skip, limit=limit)
    return clients

@app.post("/clients/", response_model=schemas.Client)
def create_client(
    client: schemas.ClientCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)):
    return crud.create_client(db=db, client=client, user_id=current_user.id)

# Fixed endpoint - use the new get_invoice_summaries function
@app.get("/invoices/", response_model=List[schemas.InvoiceSummary])
def read_invoices(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        invoices = crud.get_invoice_summaries(db, user_id=current_user.id, skip=skip, limit=limit)
        return invoices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching invoices: {str(e)}")

@app.get("/invoices/{invoice_id}", response_model=schemas.Invoice)
def read_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@app.post("/invoices/", response_model=schemas.Invoice)
def create_invoice(
    invoice: schemas.InvoiceCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    return crud.create_invoice(db=db, invoice=invoice, user_id=current_user.id)

@app.patch("/invoices/{invoice_id}/status")
def update_invoice_status(
    invoice_id: int, 
    status: str, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    db_invoice = crud.update_invoice_status(db, invoice_id=invoice_id, user_id=current_user.id, status=status)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Status updated successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
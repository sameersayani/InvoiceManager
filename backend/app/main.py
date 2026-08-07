from datetime import datetime, timedelta
import logging
import traceback
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud
from app import models
from app import schemas
from app.database import SessionLocal, engine, get_db
import base64
import io
from PIL import Image
import secrets
from app.auth import (
    create_access_token, 
    get_current_user, 
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_password_hash
)
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

# Load environment variables from a .env file if present (development convenience)
load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Invoice Generator API",
    description="A complete invoice management system",
    version="1.0.0"
)

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://invoicemanager-1.onrender.com",
    "https://invoicemanager-2-5b57.onrender.com",
    "https://yesitech.com",
    "https://www.yesitech.com",
    "https://invygo.yesitech.com",
]

configured_origins = os.getenv("CORS_ALLOWED_ORIGINS", "")
allowed_origins = [
    origin.strip()
    for origin in configured_origins.split(",")
    if origin.strip()
]
for origin in DEFAULT_ALLOWED_ORIGINS:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://([a-z0-9-]+\.)*(yesitech\.com|invoicemanager[-a-z0-9.]*\.onrender\.com)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

def add_reset_token_columns():
    try:
        with engine.connect() as conn:
            # Check if reset_token column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='reset_token'
            """))
            if not result.fetchone():
                # Add the columns if they don't exist
                conn.execute(text("""
                    ALTER TABLE inv.users 
                    ADD COLUMN reset_token VARCHAR,
                    ADD COLUMN reset_token_expires TIMESTAMP
                """))
                conn.commit()
                print("Added reset token columns to users table")
            else:
                print("Reset token columns already exist")
    except Exception as e:
        print(f"Error adding columns: {e}")

# # Call this function after create_all
# add_reset_token_columns()

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
        logging.info(f"Attempting to register user: {user.email}")
        db_user = crud.create_user(db, user)
        logging.info(f"User registered successfully: {user.email}")
        return db_user
    except ValueError as e:
        logging.warning(f"Registration failed - user exists: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        logging.info(f"Login attempt for: {form_data.username}")
        
        # FIX: Use crud.authenticate_user instead of just authenticate_user
        user = crud.authenticate_user(db, form_data.username, form_data.password)
        
        if not user:
            logging.warning(f"Login failed for: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        logging.info(f"Login successful for: {form_data.username}")
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
        logging.error(f"Login error: {str(e)}")
        logging.error(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )
    
@app.post("/forgot-password")
async def forgot_password(
    request: schemas.ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Send password reset link to user's email
    """
    try:
        # Find user by email
        user = crud.get_user_by_email(db, email=request.email)
        
        # Always return success even if email doesn't exist (for security)
        if not user:
            return {"message": "If the email exists, a password reset link has been sent"}
        
        # Generate reset token (32 character hex string)
        reset_token = secrets.token_urlsafe(32)
        
        # Set token expiration (e.g., 1 hour from now)
        token_expiration = datetime.utcnow() + timedelta(hours=1)
        
        # Store token in database
        user.reset_token = reset_token
        user.reset_token_expires = token_expiration
        db.commit()
        
        # In a real application, you would send an email here
        # For now, we'll log the token (remove this in production)
        logging.info(f"Password reset token for {request.email}: {reset_token}")
        
        return {"message": "If the email exists, a password reset link has been sent"}
        
    except Exception as e:
        logging.error(f"Error in forgot password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error processing password reset request"
        )

@app.post("/reset-password")
async def reset_password(
    request: schemas.ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Reset user's password using the token
    """
    try:
        # Find user by reset token
        user = db.query(models.User).filter(
            models.User.reset_token == request.token,
            models.User.reset_token_expires > datetime.utcnow()
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Hash new password and update user
        user.hashed_password = get_password_hash(request.new_password)
        
        # Clear reset token
        user.reset_token = None
        user.reset_token_expires = None
        
        db.commit()
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error resetting password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resetting password"
        )

@app.post("/users/logo", response_model=schemas.LogoResponse)
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        logging.debug(f"Starting logo upload for user {current_user.id}")
        logging.debug(f"File details: {file.filename}, {file.content_type}, {file.size if hasattr(file, 'size') else 'unknown size'}")
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
        if file.content_type not in allowed_types:
            error_msg = f"Invalid file type: {file.content_type}. Allowed: {allowed_types}"
            logging.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Read file contents
        contents = await file.read()
        logging.debug(f"File size: {len(contents)} bytes")
        
        # Validate file size (max 5MB)
        if len(contents) > 5 * 1024 * 1024:
            error_msg = f"File too large: {len(contents)} bytes. Maximum size is 5MB."
            logging.warning(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Process image (resize if needed)
        if file.content_type.startswith('image/') and file.content_type != 'image/svg+xml':
            try:
                logging.debug("Attempting image processing")
                image = Image.open(io.BytesIO(contents))
                logging.debug(f"Original image size: {image.size}")
                
                # Resize to maximum 500x500 while maintaining aspect ratio
                image.thumbnail((500, 500))
                logging.debug(f"Resized image size: {image.size}")
                
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
                logging.debug(f"Processed file size: {len(contents)} bytes")
                
            except Exception as image_error:
                logging.warning(f"Image processing failed, using original file: {str(image_error)}")
                # If image processing fails, use original file
                contents = await file.read()  # Re-read the file
                pass
        
        # Update user logo
        logging.debug("Updating user logo in database")
        user = crud.update_user_logo(
            db, 
            current_user.id, 
            file.filename, 
            file.content_type, 
            contents
        )
        
        if not user:
            error_msg = "User not found after logo update"
            logging.error(error_msg)
            raise HTTPException(status_code=404, detail=error_msg)
        
        logging.info(f"Logo uploaded successfully for user {current_user.id}: {file.filename}")
        
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
        logging.error(f"Error uploading logo: {str(e)}")
        logging.error(f"Full traceback: {error_details}")
        
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

@app.put("/invoices/{invoice_id}", response_model=schemas.Invoice)
def update_invoice(
    invoice_id: int,
    invoice: schemas.InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return crud.update_invoice(
    db=db, 
    invoice_id=invoice_id,  # You need to get this from somewhere
    invoice=invoice, 
    user_id=current_user.id  # You need to get the current user ID
)

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

@app.delete("/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    crud.delete_invoice(db, invoice_id=invoice_id, user_id=current_user.id)
    return {"message": "Invoice deleted successfully"}  

@app.get("/invoices/{invoice_id}/pdf")
def generate_invoice_pdf(
    invoice_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        pdf_bytes = crud.generate_invoice_pdf(db, invoice_id, current_user.id)
        
        if not pdf_bytes:
            raise HTTPException(status_code=404, detail="Invoice not found or PDF generation failed")
        
        # Return PDF as direct response with proper headers
        from fastapi.responses import Response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice_{invoice_id}.pdf",
                "Content-Length": str(len(pdf_bytes))
            }
        )
        
    except Exception as e:
        logging.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.patch("/invoices/{invoice_id}/mark_paid")
def mark_invoice_as_paid(
    invoice_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_active_user)
):
    try:
        db_invoice = crud.get_invoice(db, invoice_id, current_user.id)
        if db_invoice is None:
            raise HTTPException(status_code=404, detail="Invoice not found")
        
        if db_invoice.status == "paid":
            raise HTTPException(status_code=400, detail="Invoice is already marked as paid")
        
        # Use the correct function to update status
        updated_invoice = crud.update_invoice_status(db, invoice_id, current_user.id, "paid")
        
        if not updated_invoice:
            raise HTTPException(status_code=500, detail="Failed to update invoice status")
        
        return {"message": "Invoice marked as paid successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        # logger.error(f"Error marking invoice as paid: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error marking invoice as paid: {str(e)}")
    

# Serve frontend static files with SPA fallback
# This must be AFTER all API routes - it catches unmatched routes and serves index.html
import os
from pathlib import Path

# Try multiple possible paths for frontend/dist
backend_dir = Path(__file__).parent.parent
possible_paths = [
    backend_dir.parent / "frontend" / "dist",  # ../frontend/dist (relative to backend/)
    Path("/opt/render/project/src/frontend/dist"),  # Render absolute path
    Path("frontend/dist"),  # CWD relative
]

frontend_dist_path = None
for path in possible_paths:
    if path.exists() and path.is_dir():
        frontend_dist_path = str(path)
        break

if frontend_dist_path:
    app.mount("/", StaticFiles(directory=frontend_dist_path, html=True), name="frontend")
else:
    print(f"Warning: Frontend dist not found in any of: {[str(p) for p in possible_paths]}")


if __name__ == "__main__":
    import os
    import uvicorn

    port = int(os.getenv("PORT", 8000))  # Use Render's assigned port, fallback to 8000 locally
    uvicorn.run(app, host="0.0.0.0", port=port)
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional, Union

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ContactEnquiry(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    service: str = Field(min_length=2, max_length=100)
    message: str = Field(min_length=10, max_length=5000)
    
# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    company_name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    tax_id: Optional[str] = None
    logo: Optional[str] = None  # Base64 encoded logo
    logo_filename: Optional[str] = None
    logo_content_type: Optional[str] = None

class LogoUpload(BaseModel):
    filename: str
    content_type: str
    data: str  # Base64 encoded data

class LogoResponse(BaseModel):
    message: str
    filename: str
    content_type: str
    logo: str  # Base64 encoded logo

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    logo: Optional[str] = None
    logo_filename: Optional[str] = None
    logo_content_type: Optional[str] = None
    
    class Config:
        from_attributes = True

class UserWithLogo(User):
    logo: Optional[str] = None  # Base64 encoded logo
    logo_filename: Optional[str] = None
    logo_content_type: Optional[str] = None

    class Config:
        from_attributes = True

class LogoUpload(BaseModel):
    filename: str
    content_type: str
    data: str  # Base64 encoded data

class LogoResponse(BaseModel):
    message: str
    filename: str
    content_type: str

class ClientBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class InvoiceItemBase(BaseModel):
    description: str
    quantity: float
    unit_price: float
    tax_rate: Optional[float] = 0.0

class InvoiceItemCreate(InvoiceItemBase):
    pass

class InvoiceItem(InvoiceItemBase):
    id: int
    invoice_id: int
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    client_id: int
    issue_date: datetime
    due_date: datetime
    tax_rate: Optional[float] = 0.0
    discount: Optional[float] = 0.0
    notes: Optional[str] = None
    terms: Optional[str] = None
    status: Optional[str] = "draft"  # New field for invoice status

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    user_id: int
    status: str
    items: List[InvoiceItem]
    client: Client
    
    class Config:
        from_attributes = True

class InvoiceUpdate(BaseModel):
    client_id: Optional[int] = None
    issue_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    tax_rate: Optional[float] = None
    discount: Optional[float] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    company_logo: Optional[str] = None
    po_number: Optional[str] = None
    payment_terms: Optional[str] = None
    shipping_fee: Optional[float] = None
    items: Optional[List[InvoiceItemCreate]] = None
    
    class Config:
        from_attributes = True
class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    client_name: str
    issue_date: datetime
    due_date: datetime
    total_amount: float
    status: str
    
    class Config:
        from_attributes = True

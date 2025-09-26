from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    company_name = Column(String)
    address = Column(Text)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    tax_id = Column(String)
    logo = Column(LargeBinary)
    logo_filename = Column(String)
    logo_content_type = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    # Relationships - using 'owner' as the back reference
    invoices = relationship("Invoice", back_populates="owner", cascade="all, delete-orphan")
    clients = relationship("Client", back_populates="user", cascade="all, delete-orphan")

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)
    tax_id = Column(String)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="clients")
    invoices = relationship("Invoice", back_populates="client", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    issue_date = Column(DateTime, default=func.now())
    due_date = Column(DateTime)
    status = Column(String, default="draft")  # draft, sent, paid, overdue
    tax_rate = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    notes = Column(Text)
    terms = Column(Text)
    
    # Relationships - using 'owner' instead of 'user'
    owner = relationship("User", back_populates="invoices")  # This is the 'owner' relationship
    client = relationship("Client", back_populates="invoices")
    items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    description = Column(String)
    quantity = Column(Float)
    unit_price = Column(Float)
    tax_rate = Column(Float, default=0.0)
    
    invoice = relationship("Invoice", back_populates="items")
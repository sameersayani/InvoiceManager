import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, select
import models
import schemas
from datetime import datetime
import base64
from typing import List
from auth import get_password_hash, verify_password

logger = logging.getLogger(__name__)

def get_user(db: Session, user_id: int):
    try:
        return db.query(models.User).filter(models.User.id == user_id).first()
    except Exception as e:
        logger.error(f"Error in get_user: {str(e)}")
        raise

def get_user_by_email(db: Session, email: str):
    try:
        return db.query(models.User).filter(models.User.email == email).first()
    except Exception as e:
        logger.error(f"Error in get_user_by_email: {str(e)}")
        raise

def update_user_logo(db: Session, user_id: int, filename: str, content_type: str, data: bytes):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.logo = data
            user.logo_filename = filename
            user.logo_content_type = content_type
            db.commit()
            db.refresh(user)
            logger.debug(f"Logo updated for user {user_id}")
        return user
    except Exception as e:
        logger.error(f"Error in update_user_logo: {str(e)}")
        raise

def get_user_logo(db: Session, user_id: int):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user and user.logo:
            return {
                'data': user.logo,
                'filename': user.logo_filename,
                'content_type': user.logo_content_type
            }
        return None
    except Exception as e:
        logger.error(f"Error in get_user_logo: {str(e)}")
        raise

def delete_user_logo(db: Session, user_id: int):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.logo = None
            user.logo_filename = None
            user.logo_content_type = None
            db.commit()
            db.refresh(user)
        return user
    except Exception as e:
        logger.error(f"Error in delete_user_logo: {str(e)}")
        raise

def create_user(db: Session, user: schemas.UserCreate):
    try:
        # Check if user already exists
        db_user = get_user_by_email(db, email=user.email)
        if db_user:
            raise ValueError("User with this email already exists")
        
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            company_name=user.company_name,
            address=user.address,
            phone=user.phone,
            website=user.website,
            tax_id=user.tax_id
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise e

def authenticate_user(db: Session, email: str, password: str):
    try:
        user = get_user_by_email(db, email)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False
        return user
    except Exception as e:
        print(f"Authentication error: {e}")
        return False

def get_clients(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.Client).filter(models.Client.user_id == user_id).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error fetching clients: {str(e)}")
        raise

def create_client(db: Session, client: schemas.ClientCreate, user_id: int):
    try:
        db_client = models.Client(**client.dict(), user_id=user_id)
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        return db_client
    except Exception as e:
        db.rollback()
        raise e

def generate_invoice_number(db: Session):
    try:
        last_invoice = db.query(models.Invoice).order_by(models.Invoice.id.desc()).first()
        if last_invoice:
            last_number = int(last_invoice.invoice_number.split('-')[-1])
            new_number = last_number + 1
        else:
            new_number = 1
        return f"INV-{datetime.now().year}-{new_number:04d}"
    except Exception as e:
        logger.error(f"Error generating invoice number: {str(e)}")
        raise

def create_invoice(db: Session, invoice: schemas.InvoiceCreate, user_id: int):
    try:
        invoice_number = generate_invoice_number(db)
        db_invoice = models.Invoice(
            **invoice.dict(exclude={'items'}),
            user_id=user_id,
            invoice_number=invoice_number,
            status="draft"
        )
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        
        for item in invoice.items:
            db_item = models.InvoiceItem(**item.dict(), invoice_id=db_invoice.id)
            db.add(db_item)
        
        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except Exception as e:
        db.rollback()
        raise e

def update_invoice(db: Session, invoice_id: int, invoice: schemas.InvoiceUpdate, user_id: int):
    try:
        db_invoice = get_invoice(db, invoice_id, user_id)
        if not db_invoice:
            return None
        
        # Update only provided fields
        update_data = invoice.dict(exclude_unset=True, exclude={'items'})
        for key, value in update_data.items():
            setattr(db_invoice, key, value)
        
        # Update items only if provided
        if invoice.items is not None:
            # Clear existing items
            db.query(models.InvoiceItem).filter(models.InvoiceItem.invoice_id == invoice_id).delete()
            
            # Add new items
            for item in invoice.items:
                db_item = models.InvoiceItem(**item.dict(), invoice_id=invoice_id)
                db.add(db_item)
        
        db.commit()
        db.refresh(db_invoice)
        return db_invoice
    except Exception as e:
        db.rollback()
        raise e

def get_invoices(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    try:
        return db.query(models.Invoice).filter(models.Invoice.user_id == user_id).offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error fetching invoices: {str(e)}")
        raise

def get_invoice(db: Session, invoice_id: int, user_id: int):
    try:
        return db.query(models.Invoice).filter(
            models.Invoice.id == invoice_id,
            models.Invoice.user_id == user_id
        ).first()
    except Exception as e:
        logger.error(f"Error fetching invoice {invoice_id}: {str(e)}")
        raise

def update_invoice_status(db: Session, invoice_id: int, user_id: int, status: str):
    try:
        invoice = get_invoice(db, invoice_id, user_id)
        if invoice:
            invoice.status = status
            db.commit()
            db.refresh(invoice)
        return invoice
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating invoice status: {str(e)}")
        raise

# Fixed function to calculate invoice totals
def calculate_invoice_total(invoice: models.Invoice) -> float:
    try:
        subtotal = sum(item.quantity * item.unit_price for item in invoice.items)
        discount = invoice.discount or 0
        tax_rate = invoice.tax_rate or 0
        tax_amount = (subtotal - discount) * (tax_rate / 100)
        total = subtotal - discount + tax_amount
        return round(total, 2)
    except Exception as e:
        logger.error(f"Error calculating invoice total: {str(e)}")
        return 0.0

# Fixed function to get invoice summaries
def get_invoice_summaries(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[schemas.InvoiceSummary]:
    try:
        invoices = db.query(models.Invoice).filter(
            models.Invoice.user_id == user_id
        ).offset(skip).limit(limit).all()
        
        summaries = []
        for invoice in invoices:
            total_amount = calculate_invoice_total(invoice)
            summary = schemas.InvoiceSummary(
                id=invoice.id,
                invoice_number=invoice.invoice_number,
                client_name=invoice.client.name,
                issue_date=invoice.issue_date,
                due_date=invoice.due_date,
                total_amount=total_amount,
                status=invoice.status
            )
            summaries.append(summary)
        
        return summaries
    except Exception as e:
        logger.error(f"Error fetching invoice summaries: {str(e)}")
        raise

def delete_invoice(db: Session, invoice_id: int, user_id: int):
    try:
        invoice = get_invoice(db, invoice_id, user_id)
        if invoice:
            db.delete(invoice)
            db.commit()
            return True
        return False
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting invoice: {str(e)}")
        raise

def generate_invoice_pdf(db: Session, invoice_id: int, user_id: int) -> bytes:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from io import BytesIO
        import base64

        invoice = get_invoice(db, invoice_id, user_id)
        if not invoice:
            return None

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        styles = getSampleStyleSheet()
        
        # Create custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        normal_style = styles['Normal']
        bold_style = ParagraphStyle(
            'Bold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold'
        )
        
        right_align_style = ParagraphStyle(
            'RightAlign',
            parent=styles['Normal'],
            alignment=TA_RIGHT
        )
        
        bold_right_align_style = ParagraphStyle(
            'BoldRightAlign',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            alignment=TA_RIGHT
        )

        # Title
        elements.append(Paragraph(f"INVOICE #{invoice.invoice_number}", title_style))
        elements.append(Spacer(1, 20))

        # Company and Client Info
        company_info = f"""
        <b>From:</b><br/>
        {invoice.client.name if invoice.client else 'N/A'}<br/>
        {invoice.client.address if invoice.client else 'N/A'}<br/>
        {invoice.client.email if invoice.client else 'N/A'}<br/>
        {invoice.client.phone if invoice.client else 'N/A'}
        """
        
        client_info = f"""
        <b>To:</b><br/>
        {invoice.client.name if invoice.client else 'N/A'}<br/>
        {invoice.client.address if invoice.client else 'N/A'}<br/>
        {invoice.client.email if invoice.client else 'N/A'}<br/>
        {invoice.client.phone if invoice.client else 'N/A'}
        """

        elements.append(Paragraph(company_info, normal_style))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(client_info, normal_style))
        elements.append(Spacer(1, 20))

        # Invoice Details
        details_data = [
            ['Invoice Date:', invoice.issue_date.strftime('%Y-%m-%d')],
            ['Due Date:', invoice.due_date.strftime('%Y-%m-%d')],
            ['Status:', invoice.status.upper()],
        ]
        
        details_table = Table(details_data, colWidths=[100, 200])
        details_table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica'),
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
        ]))
        
        elements.append(details_table)
        elements.append(Spacer(1, 20))

        # Items Table
        items_data = [['Description', 'Qty', 'Unit Price', 'Amount']]
        
        subtotal = 0
        for item in invoice.items:
            amount = item.quantity * item.unit_price
            subtotal += amount
            items_data.append([
                item.description,
                str(item.quantity),
                f"${item.unit_price:.2f}",
                f"${amount:.2f}"
            ])
        
        discount = invoice.discount or 0
        tax_rate = invoice.tax_rate or 0
        tax_amount = (subtotal - discount) * (tax_rate / 100)
        total = subtotal - discount + tax_amount

        # Add totals - use proper styling instead of HTML tags
        items_data.append(['', '', 'Subtotal:', f"${subtotal:.2f}"])
        if discount > 0:
            items_data.append(['', '', 'Discount:', f"-${discount:.2f}"])
        if tax_rate > 0:
            items_data.append(['', '', f'Tax ({tax_rate}%):', f"${tax_amount:.2f}"])
        items_data.append(['', '', 'Total:', f"${total:.2f}"])  # REMOVE HTML TAGS

        items_table = Table(items_data, colWidths=[200, 60, 80, 80])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4B5563')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONT', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('FONT', (0, 1), (-1, -2), 'Helvetica'),  # Regular font for most rows
            ('FONT', (0, -1), (-1, -1), 'Helvetica-Bold'),  # Bold for total row
            ('FONTSIZE', (0, -1), (-1, -1), 12),  # Larger font for total
            ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),  # Line above total
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
        ]))

        elements.append(items_table)
        elements.append(Spacer(1, 20))

        # Notes
        if invoice.notes:
            elements.append(Paragraph("Notes:", bold_style))
            elements.append(Paragraph(invoice.notes, normal_style))
            elements.append(Spacer(1, 12))

        # Footer
        footer_text =  "Thank you for your business!"
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER
        )
        elements.append(Paragraph(footer_text, footer_style))

        # Build PDF
        doc.build(elements)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content
        
    except Exception as e:
        logger.error(f"Error generating invoice PDF: {str(e)}")
        logger.error(traceback.format_exc())
        raise
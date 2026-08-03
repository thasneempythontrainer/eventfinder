from io import BytesIO

from django.utils import timezone
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

BRAND_ORANGE = HexColor("#E8622C")
BRAND_ORANGE_DARK = HexColor("#C94E1F")
BRAND_DARK = HexColor("#1A1A1A")
BRAND_MUTED = HexColor("#8C7E72")


def generate_certificate_pdf(event, user, template_path=None):
    """Generate a personalized participation certificate.

    If ``template_path`` points to an image (PNG/JPG) it is used as a
    full-page background and the attendee details are overlaid on top.
    """
    buffer = BytesIO()
    page_w, page_h = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    # ── background template (image) ──
    if template_path:
        try:
            img = ImageReader(template_path)
            c.drawImage(img, 0, 0, width=page_w, height=page_h, preserveAspectRatio=False, mask="auto")
        except Exception:
            template_path = None

    if not template_path:
        c.setFillColor(HexColor("#FDF8F4"))
        c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
        c.setStrokeColor(HexColor("#E8622C"))
        c.setLineWidth(2)
        c.rect(10 * mm, 10 * mm, page_w - 20 * mm, page_h - 20 * mm, fill=0, stroke=1)
        c.setStrokeColor(HexColor("#E0D5CB"))
        c.setLineWidth(0.5)
        c.rect(12 * mm, 12 * mm, page_w - 24 * mm, page_h - 24 * mm, fill=0, stroke=1)

    cx = page_w / 2
    attendee = user.get_full_name() or user.username

    # ── heading ──
    c.setFillColor(BRAND_ORANGE)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(cx, page_h - 34 * mm, "CERTIFICATE OF PARTICIPATION")

    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica", 11)
    c.drawCentredString(cx, page_h - 42 * mm, "This certifies that")

    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(cx, page_h - 52 * mm, attendee[:40])

    c.setFillColor(BRAND_DARK)
    c.setFont("Helvetica", 11)
    c.drawCentredString(cx, page_h - 58 * mm, "has participated in")

    c.setFillColor(BRAND_ORANGE_DARK)
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(cx, page_h - 66 * mm, event.title[:60])

    # ── details ──
    c.setFillColor(BRAND_MUTED)
    c.setFont("Helvetica", 10)
    c.drawCentredString(cx, page_h - 74 * mm, f"held on {event.start_date} in {event.city}")

    # ── signature line ──
    c.setStrokeColor(HexColor("#CDBDAD"))
    c.setLineWidth(0.6)
    sig_y = 34 * mm
    c.line(cx - 42 * mm, sig_y, cx - 8 * mm, sig_y)
    c.line(cx + 8 * mm, sig_y, cx + 42 * mm, sig_y)

    c.setFillColor(BRAND_MUTED)
    c.setFont("Helvetica", 9)
    c.drawCentredString(cx - 25 * mm, sig_y - 5 * mm, "Event Organizer")
    c.drawCentredString(cx + 25 * mm, sig_y - 5 * mm, "EventFinder")

    # ── footer ──
    c.setFont("Helvetica", 8)
    c.setFillColor(BRAND_MUTED)
    c.drawCentredString(cx, 18 * mm, f"Certificate issued by EventFinder - {timezone.now().strftime('%B %d, %Y')}")

    c.save()
    buffer.seek(0)
    return buffer

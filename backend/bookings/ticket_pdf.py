from io import BytesIO
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# ── Brand colors ──
BRAND_ORANGE = HexColor("#E8622C")
BRAND_ORANGE_DARK = HexColor("#C94E1F")
BRAND_DARK = HexColor("#1A1A1A")
BRAND_LIGHT_BG = HexColor("#F8F4F0")
BRAND_CREAM = HexColor("#FDF8F4")
BRAND_BORDER = HexColor("#E0D5CB")
BRAND_MUTED = HexColor("#8C7E72")
BRAND_WHITE = HexColor("#FFFFFF")
BRAND_ACCENT_LIGHT = HexColor("#FFF3EC")
BRAND_GREEN = HexColor("#2D8B4E")


def _rounded_rect(c, x, y, w, h, r, fill, stroke=None, stroke_width=0.5):
    """Draw a filled rounded rectangle with optional stroke."""
    p = c.beginPath()
    p.roundRect(x, y, w, h, r)
    c.setFillColor(fill)
    if stroke:
        c.setStrokeColor(stroke)
        c.setLineWidth(stroke_width)
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.drawPath(p, fill=1, stroke=0)


def _draw_circle_cutouts(c, x, y_top, y_bottom, radius, bg_color):
    """Draw semicircle cutouts on a vertical line to mimic ticket perforation."""
    c.setFillColor(bg_color)
    c.circle(x, y_top, radius, fill=1, stroke=0)
    c.circle(x, y_bottom, radius, fill=1, stroke=0)


def _draw_text_block(c, x, y, label, value, label_color, value_color, label_size=7.5, value_size=11, max_value_len=32):
    """Draw a label + value pair vertically."""
    c.setFont("Helvetica-Bold", label_size)
    c.setFillColor(label_color)
    c.drawString(x, y, label)
    c.setFont("Helvetica", value_size)
    c.setFillColor(value_color)
    display = str(value)
    if len(display) > max_value_len:
        display = display[: max_value_len - 2] + ".."
    c.drawString(x, y - 4.5 * mm, display)


def _draw_centered_text(c, cx, y, text, font, size, color):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(cx, y, text)


def _format_date(d):
    try:
        return d.strftime("%a, %b %d %Y")
    except Exception:
        return str(d)


def _format_time(t):
    try:
        return t.strftime("%I:%M %p")
    except Exception:
        return str(t)


def generate_ticket_pdf(booking):
    """Generate a premium event ticket PDF.

    Layout per page (landscape A4):
    ┌──────────────────────────────────────────────────────────────────┐
    │  BRAND HEADER  (orange gradient bar with logo + event title)    │
    ├──────────────────────────────────────┬─ ─ ─ ───────────────────┤
    │                                      │   QR CODE SECTION       │
    │   EVENT DETAILS GRID                 │                          │
    │   Date · Time · Venue · City         │   ┌────────────────┐   │
    │   Ticket · Booking Ref               │   │                │   │
    │   Attendee · Price                   │   │    QR  CODE    │   │
    │                                      │   │                │   │
    │   ───────────────────────────        │   └────────────────┘   │
    │   Terms & footer                     │   Ticket # + SCAN      │
    │                                      │   Amount                │
    └──────────────────────────────────────┴─ ─ ─ ───────────────────┘
    """
    buffer = BytesIO()
    page_w, page_h = landscape(A4)
    c = canvas.Canvas(buffer, pagesize=landscape(A4))

    event = booking.event
    user = booking.user
    tickets = list(booking.tickets.all())

    for idx, ticket in enumerate(tickets):
        if idx > 0:
            c.showPage()

        margin = 14 * mm
        card_w = page_w - 2 * margin
        card_h = page_h - 2 * margin
        card_x = margin
        card_y = margin

        # ────────────────────── outer card ──────────────────────
        _rounded_rect(c, card_x, card_y, card_w, card_h, 10, BRAND_WHITE, BRAND_BORDER, 0.8)

        # ────────────────────── split proportions ──────────────────────
        split_ratio = 0.72
        split_x = card_x + card_w * split_ratio
        perforation_y_top = card_y + card_h - 12 * mm
        perforation_y_bot = card_y + 12 * mm
        cutout_r = 5 * mm

        # ────────────────────── semicircle cutouts on perforation ──────────────────────
        _draw_circle_cutouts(c, split_x, perforation_y_top, perforation_y_bot, cutout_r, BRAND_LIGHT_BG)
        # Draw dashed line between cutouts
        c.setStrokeColor(HexColor("#CDBDAD"))
        c.setLineWidth(0.8)
        c.setDash(5, 4)
        c.line(split_x, perforation_y_top - cutout_r - 1, split_x, perforation_y_bot + cutout_r + 1)
        c.setDash()

        # ═══════════════════════ LEFT SECTION ═══════════════════════
        left_pad = 18
        left_inner_w = card_w * split_ratio - left_pad * 2

        # ── brand header bar ──
        header_h = 32 * mm
        header_x = card_x
        header_y = card_y + card_h - header_h
        header_w = card_w * split_ratio

        # Gradient-like effect: two overlapping rects
        _rounded_rect(c, header_x, header_y, header_w, header_h, 10, BRAND_ORANGE)
        c.setFillColor(BRAND_ORANGE)
        c.rect(header_x, header_y, header_w, 14, fill=1, stroke=0)

        # Brand name
        c.setFillColor(BRAND_WHITE)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(header_x + left_pad, header_y + header_h - 12, "EVENT")
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(HexColor("#FFD4BB"))
        c.drawString(header_x + left_pad + 38, header_y + header_h - 12, "FINDER")

        # Thin white separator line
        c.setStrokeColor(HexColor("#FFFFFF50"))
        c.setLineWidth(0.5)
        c.line(header_x + left_pad, header_y + header_h - 16, header_x + header_w - left_pad, header_y + header_h - 16)

        # Event title
        c.setFont("Helvetica-Bold", 20)
        c.setFillColor(BRAND_WHITE)
        title = event.title
        if len(title) > 38:
            title = title[:36] + ".."
        c.drawString(header_x + left_pad, header_y + header_h - 30, title)

        # Category / type line
        c.setFont("Helvetica", 9)
        c.setFillColor(HexColor("#FFD4BB"))
        category = getattr(event.category, "name", None) or "Event"
        c.drawString(header_x + left_pad, header_y + header_h - 40, f"{category.upper()}  \u00b7  STANDARD ADMISSION")

        # ── details grid ──
        grid_top = header_y - 8 * mm
        col1 = card_x + left_pad
        col2 = card_x + header_w / 2 + 5
        row1 = grid_top
        row2 = grid_top - 22 * mm
        row3 = grid_top - 44 * mm

        _draw_text_block(c, col1, row1, "DATE", _format_date(event.start_date), BRAND_MUTED, BRAND_DARK)
        _draw_text_block(c, col2, row1, "TIME", _format_time(event.start_time), BRAND_MUTED, BRAND_DARK)

        venue_text = event.venue
        if len(venue_text) > 34:
            venue_text = venue_text[:32] + ".."
        _draw_text_block(c, col1, row2, "VENUE", venue_text, BRAND_MUTED, BRAND_DARK)
        _draw_text_block(c, col2, row2, "CITY", event.city, BRAND_MUTED, BRAND_DARK)

        _draw_text_block(c, col1, row3, "TICKET NO.", ticket.ticket_number, BRAND_MUTED, BRAND_DARK)
        _draw_text_block(c, col2, row3, "BOOKING REFERENCE", booking.booking_reference, BRAND_MUTED, BRAND_DARK)

        # ── attendee & price strip ──
        strip_y = card_y + 32
        strip_h = 18
        _rounded_rect(c, card_x + left_pad, strip_y, left_inner_w, strip_h, 4, BRAND_ACCENT_LIGHT)

        attendee = user.get_full_name() or user.username
        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(BRAND_MUTED)
        c.drawString(card_x + left_pad + 8, strip_y + 6, "ATTENDEE")
        c.setFont("Helvetica", 9)
        c.setFillColor(BRAND_DARK)
        c.drawString(card_x + left_pad + 58, strip_y + 6, attendee[:36])

        c.setFont("Helvetica-Bold", 7.5)
        c.setFillColor(BRAND_MUTED)
        c.drawString(card_x + left_pad + 250, strip_y + 6, "AMOUNT")
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(BRAND_ORANGE_DARK)
        c.drawString(card_x + left_pad + 300, strip_y + 5, f"Rs. {booking.total_price}")

        # ── footer terms ──
        c.setFont("Helvetica", 6.5)
        c.setFillColor(BRAND_MUTED)
        c.drawString(card_x + left_pad, card_y + 14,
                      "This ticket is valid only for the event, date and time listed above. "
                      "Present a valid photo ID at entry. Duplicate or altered tickets will be rejected.")

        # ═══════════════════════ RIGHT SECTION (QR stub) ═══════════════════════
        right_x = split_x + cutout_r + 2
        right_w = card_x + card_w - right_x - 8
        right_cx = right_x + right_w / 2

        # Subtle background
        _rounded_rect(c, right_x, card_y, right_w, card_h, 10, BRAND_LIGHT_BG)
        # Cover left rounded corners (they're hidden behind cutouts)
        c.setFillColor(BRAND_LIGHT_BG)
        c.rect(right_x, card_y, 12, card_h, fill=1, stroke=0)

        # QR code box
        qr_box_size = 46 * mm
        qr_box_x = right_cx - qr_box_size / 2
        qr_box_y = card_y + card_h / 2 - qr_box_size / 2 + 10 * mm

        _rounded_rect(c, qr_box_x - 4, qr_box_y - 4, qr_box_size + 8, qr_box_size + 8, 6, BRAND_WHITE, BRAND_BORDER, 0.6)

        if ticket.qr_code:
            try:
                qr_img = ImageReader(ticket.qr_code.path)
                c.drawImage(qr_img, qr_box_x, qr_box_y, qr_box_size, qr_box_size, preserveAspectRatio=True, mask='auto')
            except Exception:
                _draw_centered_text(c, right_cx, qr_box_y + qr_box_size / 2,
                                    ticket.ticket_number, "Courier", 10, BRAND_DARK)
        else:
            _draw_centered_text(c, right_cx, qr_box_y + qr_box_size / 2,
                                ticket.ticket_number, "Courier", 10, BRAND_DARK)

        # "SCAN AT ENTRY" label
        scan_y = qr_box_y - 10 * mm
        _rounded_rect(c, right_cx - 30 * mm, scan_y - 2, 60 * mm, 8, 3, BRAND_ORANGE)
        _draw_centered_text(c, right_cx, scan_y, "SCAN AT ENTRY", "Helvetica-Bold", 7.5, BRAND_WHITE)

        # Ticket number below
        tn_y = scan_y - 12 * mm
        _draw_centered_text(c, right_cx, tn_y, ticket.ticket_number, "Courier-Bold", 9, BRAND_DARK)

        # Price
        price_y = card_y + 28
        _draw_centered_text(c, right_cx, price_y + 12, f"Rs. {booking.total_price}", "Helvetica-Bold", 16, BRAND_ORANGE_DARK)
        _draw_centered_text(c, right_cx, price_y, f"{booking.number_of_tickets} ticket{'s' if booking.number_of_tickets != 1 else ''}", "Helvetica", 8, BRAND_MUTED)

        # Small brand mark at bottom
        _draw_centered_text(c, right_cx, card_y + 12, "eventfinder", "Helvetica", 6.5, BRAND_MUTED)

    c.save()
    buffer.seek(0)
    return buffer

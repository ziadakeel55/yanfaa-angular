import asyncio
import re
import os
import uuid
import math
import fitz
import qrcode
import arabic_reshaper
from bidi.algorithm import get_display
from pyrogram import Client
from aiohttp import web

# Paths relative to this script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)  # yanfaa-angular
TEMPLATE_PATH = os.path.join(BASE_DIR, 'templete.pdf')
CERT_DIR = os.path.join(PROJECT_DIR, 'public', 'certificates')
SESSION_DIR = BASE_DIR  # Telegram session file lives here

API_ID = 26652708
API_HASH = '2300480334a5285559a49cc0f908de9d'
app = Client(
    os.path.join(SESSION_DIR, 'my_yanfaa_account'),
    api_id=API_ID,
    api_hash=API_HASH
)

# ─── Video Streaming ────────────────────────────────────────────────

async def stream_video(request):
    chat_id = int(request.match_info['chat_id'])
    msg_id = int(request.match_info['msg_id'])

    if msg_id <= 0:
        return web.Response(status=404, text="Invalid message ID")

    try:
        msg = await app.get_messages(chat_id=chat_id, message_ids=msg_id)
        if not msg:
            return web.Response(status=404, text="Message not found")

        video = msg.video or msg.document
        if not video:
            return web.Response(status=404, text="No video/document found in this message")
    except Exception as e:
        return web.Response(status=500, text=f"Error fetching message: {str(e)}")

    file_size = video.file_size
    range_header = request.headers.get('Range')

    if range_header:
        byte1, byte2 = 0, None
        match = re.search(r'bytes=(\d+)-(\d*)', range_header)
        if match:
            byte1 = int(match.group(1))
            if match.group(2):
                byte2 = int(match.group(2))

        if byte1 >= file_size:
            headers = {
                'Content-Range': f'bytes */{file_size}',
                'Access-Control-Allow-Origin': '*'
            }
            return web.Response(status=416, headers=headers)

        if byte2 is None or byte2 >= file_size:
            byte2 = file_size - 1

        chunk_size = byte2 - byte1 + 1

        headers = {
            'Content-Range': f'bytes {byte1}-{byte2}/{file_size}',
            'Accept-Ranges': 'bytes',
            'Content-Length': str(chunk_size),
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
        }

        response = web.StreamResponse(status=206, headers=headers)

        try:
            await response.prepare(request)
        except (ConnectionResetError, Exception) as e:
            if "Cannot write to" in str(e) or "ConnectionReset" in str(type(e)):
                return response
            raise

        try:
            chunk_size_1mb = 1024 * 1024
            first_chunk_index = byte1 // chunk_size_1mb
            offset_in_first_chunk = byte1 % chunk_size_1mb

            last_chunk_index = byte2 // chunk_size_1mb
            limit_chunks = last_chunk_index - first_chunk_index + 1

            bytes_sent = 0

            async for chunk in app.stream_media(msg, offset=first_chunk_index, limit=limit_chunks):
                chunk_data = chunk
                if bytes_sent == 0 and offset_in_first_chunk > 0:
                    chunk_data = chunk_data[offset_in_first_chunk:]

                if bytes_sent + len(chunk_data) > chunk_size:
                    chunk_data = chunk_data[:chunk_size - bytes_sent]

                if chunk_data:
                    await response.write(chunk_data)
                    bytes_sent += len(chunk_data)

                if bytes_sent >= chunk_size:
                    break
        except (asyncio.CancelledError, ConnectionResetError):
            pass
        except Exception as e:
            if "Cannot write to closing transport" not in str(e):
                print(f"Streaming error on range {byte1}-{byte2}/{file_size}: {e}")
                import traceback
                traceback.print_exc()

        return response
    else:
        headers = {
            'Accept-Ranges': 'bytes',
            'Content-Length': str(file_size),
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
        }
        response = web.StreamResponse(status=200, headers=headers)

        try:
            await response.prepare(request)
        except (ConnectionResetError, Exception) as e:
            if "Cannot write to" in str(e) or "ConnectionReset" in str(type(e)):
                return response
            raise

        try:
            async for chunk in app.stream_media(msg):
                await response.write(chunk)
        except (asyncio.CancelledError, ConnectionResetError):
            pass
        except Exception as e:
            if "Cannot write to closing transport" not in str(e):
                print(f"Streaming error: {e}")

        return response


# ─── Certificate Generation ─────────────────────────────────────────

def prepare_arabic(text):
    if not text:
        return ""
    reshaped_text = arabic_reshaper.reshape(str(text))
    bidi_text = get_display(reshaped_text)
    return bidi_text


def generate_certificate(username, coursename, dateofissue, classlength, founder_ceo, output_path, domain):
    if not os.path.exists(TEMPLATE_PATH):
        raise Exception(f"Template PDF not found at {TEMPLATE_PATH}")

    doc = fitz.open(TEMPLATE_PATH)
    page = doc[0]

    font_file = "C:/Windows/Fonts/arial.ttf"
    font_name = "arial"
    page.insert_font(fontname=font_name, fontfile=font_file)

    # Text coordinates based on exact layout
    username_rect = fitz.Rect(50, 230, 690, 290)
    coursename_rect = fitz.Rect(50, 315, 690, 385)
    date_rect = fitz.Rect(50, 435, 250, 465)
    length_rect = fitz.Rect(270, 435, 470, 465)
    founder_rect = fitz.Rect(490, 435, 690, 465)

    page.insert_textbox(username_rect, prepare_arabic(username), fontname=font_name, fontsize=32, color=(0, 0, 0), align=1)
    page.insert_textbox(coursename_rect, prepare_arabic(coursename), fontname=font_name, fontsize=28, color=(0, 0, 0), align=1)
    page.insert_textbox(date_rect, str(dateofissue), fontname=font_name, fontsize=14, color=(0, 0, 0), align=1)
    page.insert_textbox(length_rect, prepare_arabic(classlength), fontname=font_name, fontsize=14, color=(0, 0, 0), align=1)
    page.insert_textbox(founder_rect, prepare_arabic(founder_ceo), fontname=font_name, fontsize=14, color=(0, 0, 0), align=1)

    # Generate QR
    qr_data = f"{domain}/certificates/{os.path.basename(output_path)}"
    qr = qrcode.QRCode(version=1, box_size=10, border=1)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_path = output_path.replace('.pdf', '_qr.png')
    qr_img.save(qr_path)

    qr_rect = fitz.Rect(50, 480, 130, 560)
    page.insert_image(qr_rect, filename=qr_path)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc.save(output_path)
    doc.close()

    if os.path.exists(qr_path):
        os.remove(qr_path)


async def handle_generate_certificate(request):
    try:
        data = await request.json()
        username = data.get('username', '')
        coursename = data.get('coursename', '')
        dateofissue = data.get('dateofissue', '')
        classlength = data.get('classlength', '')
        founder_ceo = data.get('founder_ceo', 'محمد المفتي')
        domain = data.get('domain', 'https://yanfaa.ddns.net')
        cert_id = data.get('cert_id') or str(uuid.uuid4())

        output_path = os.path.join(CERT_DIR, f"{cert_id}.pdf")
        generate_certificate(username, coursename, dateofissue, classlength, founder_ceo, output_path, domain)

        headers = {'Access-Control-Allow-Origin': '*'}
        cert_url = (
            f"http://localhost:8080/certificates/{cert_id}.pdf"
            if "localhost" in domain
            else f"{domain}/certificates/{cert_id}.pdf"
        )
        return web.json_response({"success": True, "url": cert_url, "cert_id": cert_id}, headers=headers)
    except Exception as e:
        import traceback
        traceback.print_exc()
        headers = {'Access-Control-Allow-Origin': '*'}
        return web.json_response({"success": False, "error": str(e)}, status=500, headers=headers)


# ─── CORS & Lifecycle ───────────────────────────────────────────────

async def handle_cors_preflight(request):
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Range, Content-Type',
    }
    return web.Response(status=200, headers=headers)


async def on_startup(app_web):
    print("Starting Telegram Client...")
    await app.start()
    print("Telegram Client Started! Server running on http://localhost:8080")


async def on_cleanup(app_web):
    print("Stopping Telegram Client...")
    await app.stop()


# ─── Main ───────────────────────────────────────────────────────────

def main():
    os.makedirs(CERT_DIR, exist_ok=True)

    server = web.Application()

    # CORS preflight
    server.router.add_options('/stream/{chat_id}/{msg_id}', handle_cors_preflight)
    server.router.add_options('/api/generate_certificate', handle_cors_preflight)

    # Routes
    server.router.add_get('/stream/{chat_id}/{msg_id}', stream_video)
    server.router.add_post('/api/generate_certificate', handle_generate_certificate)

    # Serve certificates statically
    server.router.add_static('/certificates/', path=CERT_DIR, name='certificates')

    server.on_startup.append(on_startup)
    server.on_cleanup.append(on_cleanup)

    port = int(os.environ.get('PORT', 8080))
    web.run_app(server, host='0.0.0.0', port=port)


if __name__ == '__main__':
    main()

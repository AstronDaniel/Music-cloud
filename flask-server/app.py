# Monkey patch first, before any other imports
import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify, send_file, Response, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import yt_dlp
import os
import logging
import requests
from rich.console import Console

console = Console()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS - update to allow all origins
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins
        "allow_headers": ["Content-Type"],
        "methods": ["GET", "POST", "OPTIONS"],
        "supports_credentials": True
    }
})

# Add route to serve frontend files
@app.route('/')
def serve_frontend():
    return send_from_directory('../', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../', path)

# Initialize SocketIO
socketio = SocketIO(
    app,
    cors_allowed_origins="*",  # Allow all origins for WebSocket
    async_mode='eventlet',
    ping_timeout=60,
    ping_interval=25,
    path='/socket.io'
)

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'status': 'Connected successfully'})

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

# Initialize WebSocket error handler
@socketio.on_error()
def error_handler(e):
    logger.error(f'SocketIO error: {str(e)}')

class DownloadProgress:
    def __init__(self, socket_id):
        self.socket_id = socket_id

    def callback(self, d):
        try:
            if d['status'] == 'downloading':
                socketio.emit('download_progress', {
                    'socket_id': self.socket_id,
                    'progress': d.get('_percent_str', '0%'),
                    'speed': d.get('_speed_str', '0 KB/s'),
                    'eta': d.get('_eta_str', 'N/A')
                })
            elif d['status'] == 'finished':
                socketio.emit('download_complete', {
                    'socket_id': self.socket_id,
                    'filename': d['filename']
                })
        except Exception as e:
            logger.error(f"Error in progress callback: {str(e)}")

@app.route('/download', methods=['GET'])
def download_audio():
    try:
        video_url = request.args.get('videoUrl')
        socket_id = request.args.get('socketId')
        downloads_path = os.path.join(os.path.expanduser('~'), 'Downloads')

        def progress_hook(d):
            if d['status'] == 'downloading':
                console.print(f"[cyan]Downloading: {d.get('filename', 'unknown file')}")
                console.print(f"[green]Progress: {d.get('_percent_str', '0%')} • "
                      f"Speed: {d.get('_speed_str', 'N/A')} • "
                      f"ETA: {d.get('_eta_str', 'N/A')}")

                progress = {
                    'socket_id': socket_id,
                    'status': 'downloading',
                    'progress': d.get('_percent_str', '0%'),
                    'speed': d.get('_speed_str', 'N/A'),
                    'eta': d.get('_eta_str', 'N/A'),
                    'filename': d.get('filename', 'unknown'),
                    'total_bytes': d.get('total_bytes_str', 'N/A'),
                    'message': f"Downloading {d.get('filename', 'file')}..."
                }
                socketio.emit('download_progress', progress)
            
            elif d['status'] == 'finished':
                console.print(f"[green]Download complete! Converting to MP3...")
                socketio.emit('download_progress', {
                    'socket_id': socket_id,
                    'status': 'converting',
                    'progress': '100%',
                    'message': 'Converting to MP3 format...'
                })

        ydl_opts = {
            'format': 'bestaudio/best',
            'progress_hooks': [progress_hook],
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(downloads_path, '%(title)s.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
            'extract_audio': True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            import time
            info = ydl.extract_info(video_url, download=True)
            title = info['title']
            
            # Keep hyphens and spaces in sanitized filename
            safe_title = "".join([c for c in title if c.isalnum() or c.isspace() or c == '-']).strip()
            file_path = os.path.join(downloads_path, f"{safe_title}.mp3")

            # Small delay to ensure file is ready
            time.sleep(2)
            
            # Log both paths to debug
            console.print(f"[cyan]Looking for file at: {file_path}")
            
            if os.path.exists(file_path):
                try:
                    os.startfile(file_path)
                    console.print(f"[green]Opening file: {file_path}")
                    status_message = 'Download complete - Opening file...'
                except Exception as e:
                    console.print(f"[yellow]Could not open file: {str(e)}")
                    status_message = 'Download complete - File saved in Downloads folder'
            else:
                # Try finding the file with original title if sanitized version not found
                original_path = os.path.join(downloads_path, f"{title}.mp3")
                console.print(f"[cyan]Trying original path: {original_path}")
                
                if os.path.exists(original_path):
                    try:
                        os.startfile(original_path)
                        console.print(f"[green]Opening file: {original_path}")
                        status_message = 'Download complete - Opening file...'
                        file_path = original_path  # Update file_path to actual path
                    except Exception as e:
                        console.print(f"[yellow]Could not open file: {str(e)}")
                        status_message = 'Download complete - File saved in Downloads folder'
                else:
                    console.print(f"[yellow]File not found at either path")
                    status_message = 'Download complete - File saved in Downloads folder'

            socketio.emit('download_progress', {
                'socket_id': socket_id,
                'status': 'completed',
                'progress': '100%',
                'message': status_message,
                'filepath': file_path
            })

            return jsonify({
                'success': True,
                'message': status_message,
                'filepath': file_path
            })

    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        socketio.emit('download_progress', {
            'socket_id': socket_id,
            'status': 'error',
            'message': f'Download failed: {str(e)}'
        })
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    if not os.path.exists('downloads'):
        os.makedirs('downloads')
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
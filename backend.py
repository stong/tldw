from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import time
import dotenv
from typing import Optional, Dict, Any
import os
from youtube import VideoExtractor, Summarizer, validate_youtube_url
import traceback

app = Flask(__name__)
app.config['PROXY_URL'] = None  # Default value

cors = CORS(app)  # Enable CORS for all routes

# Load environment variables
dotenv.load_dotenv()

# Rate limiting decorator
def rate_limit(limit=60):  # 60 requests per minute by default
    def decorator(f):
        requests = {}
        
        @wraps(f)
        def wrapped(*args, **kwargs):
            now = time.time()
            ip = request.remote_addr
            
            # Clean old entries
            requests[ip] = [t for t in requests.get(ip, []) if now - t < 60]
            
            if len(requests.get(ip, [])) >= limit:
                return jsonify({
                    "error": "Rate limit exceeded. Please try again later."
                }), 429
            
            requests.setdefault(ip, []).append(now)
            return f(*args, **kwargs)
        return wrapped
    return decorator

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/api/summarize', methods=['POST'])
@rate_limit()
def summarize_video():
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({
            "error": "Missing URL in request body"
        }), 400
    
    url = data['url']
    
    if not validate_youtube_url(url):
        return jsonify({
            "error": "Invalid YouTube URL"
        }), 400
    
    try:
        extractor = VideoExtractor(proxy=app.config['PROXY_URL'])
        summarizer = Summarizer()

        # Download metadata
        video_info = extractor.extract_video_info(url)
        if not video_info:
            return jsonify({
                "error": "Failed to download video info"
            }), 500

        video_id = video_info['id']

        # Get captions
        caption_track = extractor.get_captions_by_priority(video_info)
        if not caption_track:
            return jsonify({
                'error': 'Captions are not available',
                'video_id': video_id
            }), 500
        ext = caption_track['ext']
        
        app.logger.info(f'Using captions track: {caption_track["name"]} ({ext})')
        
        # Download captions
        downloaded_content = extractor.download_captions(video_id, caption_track)
        
        # Parse captions
        caption_text = extractor.parse_captions(ext, downloaded_content)
        
        # Generate summaries
        summaries = summarizer.summarize(caption_text, video_info)
        
        # Get the thumbnail with highest preference
        thumbnails = video_info.get('thumbnails', [])
        thumbnail_url = None
        if thumbnails:
            best_thumbnail = max(thumbnails, key=lambda x: x.get('preference', 0))
            thumbnail_url = best_thumbnail.get('url')

        return jsonify({
            "success": True,
            "video_id": video_id,
            "title": video_info.get('title', ''),
            "thumbnail_url": thumbnail_url,
            "summary": summaries
        }), 200
        
    except Exception as e:
        app.logger.error(f"Error processing video: {str(e)}")
        app.logger.error(traceback.format_exc())
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500

if __name__ == '__main__':
    from waitress import serve
    import argparse
    parser = argparse.ArgumentParser(description='Server configuration')
    parser.add_argument('--port', type=int, default=5000, help='Port number (default: 5000)')
    parser.add_argument('--proxy', default=os.getenv('PROXY_URL'), help='Proxy URL (default: PROXY_URL environment variable or None)')
    args = parser.parse_args()
    app.config['PROXY_URL'] = args.proxy
    print(f'Serving on port {args.port}')
    serve(app, host="0.0.0.0", port=args.port)

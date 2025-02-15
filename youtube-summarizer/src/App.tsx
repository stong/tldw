import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  useSearchParams,
} from 'react-router-dom';

interface Summary {
  word: string;
  sentence: string;
  paragraph: string;
  wikipedia: string;
}

interface ResponseData {
  success: boolean;
  error: string;
  video_id: string;
  title: string;
  thumbnail_url: string;
  webpage_url: string;
  aspect_ratio: number;
  summary: Summary;
}

interface VideoInfo {
  video_id: string;
  title: string;
  thumbnail_url: string;
  aspect_ratio: number;
  webpage_url: string;
}

const getApiBaseUrl = () => {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.tldw.tube';
};

function VideoSummary() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL changes (including back/forward navigation)
  useEffect(() => {
    const videoId = searchParams.get('v');
    const currentVideoId = (videoInfo && videoInfo.video_id) || ''
    if (videoId) {
      if (videoId != currentVideoId) {
        const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
        if (!videoInfo || !summary || fullUrl != url) {
          setUrl(fullUrl);
          handleSummarize(fullUrl);
        }
      }
    } else {
      // Clear state when no video ID is present
      setSummary(null);
      setVideoInfo(null);
    }
  }, [searchParams]);

  const handleSummarize = async (videoUrl: string) => {
    setLoading(true);
    setError('');
    setSummary(null);
    setVideoInfo(null);
    
    try {

      const response = await fetch(`${getApiBaseUrl()}/api/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data: ResponseData = await response.json();

      // Update url with id
      if (data && data.video_id) {
        const currentSearchParam = searchParams.get('v');
        if (currentSearchParam != data.video_id) {
          setSearchParams({ v: data.video_id });
        }
      }

      if (!response.ok) {
        throw new Error((data && data.error) || 'Failed to get summary');
      }

      setSummary(data.summary);

      const videoInfo: VideoInfo = {
        video_id: data.video_id,
        title: data.title,
        thumbnail_url: data.thumbnail_url,
        aspect_ratio: data.aspect_ratio,
        webpage_url: data.webpage_url
      };
      setUrl(data.webpage_url);
      setVideoInfo(videoInfo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoInfo || videoInfo.webpage_url != url) {
      await handleSummarize(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="pb-12">
          <h1 className="text-4xl font-bold text-center mb-12"><a href="/">TL;DW</a></h1>
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex justify-center gap-2 mb-8">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 max-w-xl px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center text-gray-500">
              Analyzing video...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-center text-red-500 mb-8">
              {error}
            </div>
          )}

          {/* Results */}
          {summary && !loading && videoInfo && (
            <div className="space-y-8">
              {/* Video title and thumbnail */}
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{videoInfo.title}</h2>
                <div style={{ position: 'relative', width: '100%', paddingBottom: `${(1 / videoInfo.aspect_ratio) * 100}%` }}>
                  <iframe
                    src={"https://www.youtube.com/embed/" + videoInfo.video_id}
                    style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
                    title={videoInfo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Word and Sentence Summary */}
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">{summary.word} <a href={summary.wikipedia}><img className="inline-block h-8 w-8" src="/wikipedia.svg" alt="Wikipedia Logo"/></a></h2>
                <p className="text-lg text-justify hyphens-auto">{summary.sentence}</p>
              </div>

              {/* Paragraph Summary */}
              <div>
                <h2 className="text-2xl font-bold mb-2">Full summary</h2>
                <p className="text-gray-600 text-justify hyphens-auto">{summary.paragraph}</p>
              </div>
            </div>
          )}
        </div>
        <div className="bottom-2 w-full text-center">
          <a
            href="https://github.com/stong/tldw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors mx-2"
          >
            GitHub
          </a>
          <a
            href="https://zellic.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors mx-2"
          >
            Zellic
          </a>
          <a
            href="https://pwn.cat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors mx-2"
          >
            About
          </a>
        </div>
      </div>
    </div>
  );
}

// Wrapper component for React Router
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoSummary />} />
      </Routes>
    </Router>
  );
}
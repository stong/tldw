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
}

function VideoSummary() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL changes (including back/forward navigation)
  useEffect(() => {
    const videoId = searchParams.get('v');
    if (videoId) {
      const fullUrl = `https://www.youtube.com/watch?v=${videoId}`;
      setUrl(fullUrl);
      handleSummarize(fullUrl);
    } else {
      // Clear state when no video ID is present
      setSummary(null);
      setThumbnailUrl(null);
      setVideoTitle(null);
    }
  }, [searchParams]);

  const handleSummarize = async (videoUrl: string) => {
    setLoading(true);
    setError('');
    setThumbnailUrl(null);
    setVideoTitle(null);
    
    try {
      const response = await fetch('https://api.tldw.tube/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await response.json();

      // Update url with id
      if (data && data.video_id) {
        setSearchParams({ v: data.video_id });
      }

      if (!response.ok) {
        throw new Error((data && data.error) || 'Failed to get summary');
      }

      setSummary(data.summary);
      setThumbnailUrl(data.thumbnail_url);
      setVideoTitle(data.title);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSummarize(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">TL;DW</h1>
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex justify-center gap-2 mb-12">
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
        {summary && !loading && (
          <div className="space-y-8">
            {/* Video title and thumbnail */}
            {videoTitle && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">{videoTitle}</h2>
                {thumbnailUrl && (
                  <img 
                    src={thumbnailUrl} 
                    alt={videoTitle}
                    className="w-full rounded-lg shadow-lg"
                  />
                )}
              </div>
            )}
            
            {/* Word and Sentence Summary */}
            <div>
              <h2 className="text-2xl font-bold mb-2">{summary.word}</h2>
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
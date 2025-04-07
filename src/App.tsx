import { useState, useEffect } from 'react';
import { Brain, MessageSquare, Loader2, Moon, Sun, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI, GenerateContentRequest } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Initialize Gemini
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  console.error('Google API key is not set. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface PageContent {
  title: string;
  content: string;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
];

function App() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'qa'>('summary');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    const getPageContent = async () => {
      try {
        // Check if running in extension context
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const tab = tabs[0];

          if (!tab.url || tab.url.startsWith('chrome://')) {
            setError('Cannot access this page. Try opening a regular webpage.');
            return;
          }

          if (tab.id) {
            const content = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => {
                return {
                  title: document.title,
                  content: document.body.innerText
                };
              }
            });

            if (content[0]?.result) {
              setPageContent(content[0].result);
              setError(null);
              // Reset regeneration count when page changes
              setRegenerationCount(0);
            }
          }
        } else {
          // Set some default content when not running as extension
          setPageContent({
            title: 'Sample Page',
            content: 'This is sample content for testing outside of the extension context.'
          });
        }
      } catch (err) {
        console.error('Error getting page content:', err);
        setError('Cannot access this page. Try opening a regular webpage.');
      }
    };

    getPageContent();
  }, []);

  const handleSummarize = async () => {
    if (!pageContent) return;
    setLoading(true);
    try {
      const prompt = `Please summarize the following text in ${language}:\n\n${pageContent.content}`;
      const request: GenerateContentRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      };
      const result = await model.generateContent(request);
      const response = await result.response;
      if (!response) {
        throw new Error('No response received from Gemini API');
      }
      setSummary(response.text());
      setError(null);
    } catch (error) {
      console.error('Error in handleSummarize:', error);
      setError('Failed to generate summary. Please check your API key and try again.');
    }
    setLoading(false);
  };

  const handleRegenerate = async () => {
    if (regenerationCount >= 3) return;
    setLoading(true);
    try {
      const prompt = `Please summarize the following text in ${language}:\n\n${pageContent?.content}`;
      const request: GenerateContentRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      };
      const result = await model.generateContent(request);
      const response = await result.response;
      setSummary(response.text());
      setRegenerationCount(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to regenerate summary. Please try again.');
    }
    setLoading(false);
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!pageContent || !question) return;
    setLoading(true);
    try {
      const prompt = `Given this context:\n${pageContent.content}\n\nAnswer this question in ${language}:\n${question}`;
      const request: GenerateContentRequest = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      };
      const result = await model.generateContent(request);
      const response = await result.response;
      if (!response) {
        throw new Error('No response received from Gemini API');
      }
      setAnswer(response.text());
      setError(null);
    } catch (error) {
      console.error('Error in handleAskQuestion:', error);
      setError('Failed to get answer. Please check your API key and try again.');
    }
    setLoading(false);
  };

  const handleClearQuestion = () => {
    setQuestion('');
    setAnswer('');
  };

  return (
    <div className={`w-[400px] p-6 ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Brain className="w-7 h-7 text-blue-600" />
          Brief Me
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-200" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 border dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300"
        >
          {error}
        </motion.div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
            <motion.button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Summarize
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('qa')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'qa'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Ask Question
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'summary' ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <motion.button
                  onClick={handleSummarize}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Summarize Page
                    </>
                  )}
                </motion.button>
                <AnimatePresence>
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="font-medium dark:text-white">Summary:</h2>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCopySummary}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Copy summary"
                          >
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={handleRegenerate}
                            disabled={loading || regenerationCount >= 3}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                            title={regenerationCount >= 3 ? "Maximum regenerations reached" : "Regenerate summary"}
                          >
                            <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                      {showCopySuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Copied!
                        </motion.div>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
                      {regenerationCount > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Regenerated {regenerationCount}/3 times
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="qa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask a question about this page..."
                      className="w-full p-4 border dark:border-gray-600 rounded-xl resize-none h-32 bg-white dark:bg-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {question && (
                      <motion.button
                        onClick={handleClearQuestion}
                        className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        New Chat
                      </motion.button>
                    )}
                    <motion.button
                      onClick={handleAskQuestion}
                      disabled={loading || !question}
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5" />
                          Ask Question
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {answer && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
                    >
                      <h2 className="font-medium mb-2 dark:text-white">Answer:</h2>
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{answer}</ReactMarkdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;
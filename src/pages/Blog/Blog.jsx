import React, { useEffect, useState } from 'react';
import './Blog.css';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptoNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // CryptoCompare News API - Free, no API key required
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        
        if (data.Data && Array.isArray(data.Data)) {
          // Transform API response to match our article format
          const formattedArticles = data.Data.slice(0, 12).map((article, index) => ({
            id: article.id || index,
            title: article.title,
            source: article.source_info?.name || article.source || 'Crypto News',
            preview: article.body?.substring(0, 150) + '...' || 'Click to read more about this crypto development...',
            link: article.url || article.guid,
            publishedAt: new Date(article.published_on * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            imageUrl: article.imageurl
          }));
          
          setArticles(formattedArticles);
        } else {
          throw new Error('Invalid data format');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching crypto news:', err);
        setError('Failed to load news. Please try again later.');
        setLoading(false);
        
        // Fallback to placeholder articles on error
        setArticles([
          {
            id: 1,
            title: 'Bitcoin Reaches New All-Time High',
            source: 'CoinDesk',
            preview: 'Bitcoin has surged to unprecedented levels as institutional adoption continues to grow...',
            link: 'https://www.coindesk.com',
            publishedAt: new Date().toLocaleDateString()
          },
          {
            id: 2,
            title: 'Ethereum 2.0 Upgrade Completed Successfully',
            source: 'CoinTelegraph',
            preview: 'The highly anticipated Ethereum network upgrade has been successfully implemented...',
            link: 'https://www.cointelegraph.com',
            publishedAt: new Date().toLocaleDateString()
          }
        ]);
      }
    };

    fetchCryptoNews();
    
    // Refresh news every 5 minutes
    const interval = setInterval(fetchCryptoNews, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="blog">
      <div className="blog-header">
        <h1>Crypto News & Insights</h1>
        <p>Stay updated with the latest developments in cryptocurrency</p>
        {loading && <div className="loading-indicator">Loading latest news...</div>}
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="articles-grid">
        {articles.map(article => (
          <div key={article.id} className="article-card">
            {article.imageUrl && (
              <div className="article-image">
                <img src={article.imageUrl} alt={article.title} />
              </div>
            )}
            <div className="article-content">
              <div className="article-source">{article.source}</div>
              <h2 className="article-title">{article.title}</h2>
              <p className="article-preview">{article.preview}</p>
              <div className="article-footer">
                <span className="article-date">{article.publishedAt}</span>
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="article-link">
                  Read Full Article →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;

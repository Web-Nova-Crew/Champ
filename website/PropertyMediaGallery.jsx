import React, { useState } from 'react';
import './PropertyMediaGallery.css';

const PropertyMediaGallery = ({ property }) => {
  const [activeTab, setActiveTab] = useState('images');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasImages = property.images && property.images.length > 0;
  const hasVideos = property.videos && property.videos.length > 0;
  const hasDocuments = property.documents && property.documents.length > 0;

  const openLightbox = (index) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="property-media-gallery">
      {/* Tab Navigation */}
      <div className="media-tabs">
        {hasImages && (
          <button
            className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            Photos ({property.images.length})
          </button>
        )}
        
        {hasVideos && (
          <button
            className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Videos ({property.videos.length})
          </button>
        )}
        
        {hasDocuments && (
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Documents ({property.documents.length})
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="media-content">
        {/* Images Tab */}
        {activeTab === 'images' && hasImages && (
          <div className="images-section">
            <div className="main-image-container">
              <img
                src={property.images[selectedImageIndex]}
                alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                className="main-image"
                onClick={() => openLightbox(selectedImageIndex)}
              />
              <div className="image-counter">
                {selectedImageIndex + 1} / {property.images.length}
              </div>
            </div>
            
            <div className="thumbnail-grid">
              {property.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && hasVideos && (
          <div className="videos-section">
            <div className="videos-grid">
              {property.videos.map((video, index) => (
                <div key={index} className="video-container">
                  <video controls className="property-video">
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="video-label">Video {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && hasDocuments && (
          <div className="documents-section">
            <div className="documents-list">
              {property.documents.map((doc, index) => (
                <a
                  key={index}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="document-item"
                >
                  <div className="document-icon">
                    {doc.type === 'pdf' ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    )}
                  </div>
                  <div className="document-info">
                    <div className="document-title">{doc.title}</div>
                    <div className="document-type">{doc.type?.toUpperCase() || 'DOCUMENT'}</div>
                  </div>
                  <div className="download-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for Images */}
      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          
          <img
            src={property.images[selectedImageIndex]}
            alt={`${property.title} - Full size`}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          
          <div className="lightbox-counter">
            {selectedImageIndex + 1} / {property.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMediaGallery;

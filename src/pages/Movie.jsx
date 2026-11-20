import MovieDetailCard from "../components/MovieDetailCard.jsx"
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Movie() {
  const baseUrl = 'http://localhost:8000/api/movies/';
  const backendUrl = "http://127.0.0.1:8000/storage/";
  const { slug } = useParams();
  const location = useLocation();

  const hasStateLocation = location.state;

  const [movie, setMovie] = useState(hasStateLocation ? location.state : null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(!hasStateLocation);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

  useEffect(() => {
    // Controlliamo se abbiamo già i dati completi (es. actors e director)
    const hasFullData = hasStateLocation && hasStateLocation.actors && hasStateLocation.director;

    if (!hasFullData) {
      fetch(`${baseUrl}${slug}`)
        .then(resp => resp.json())
        .then(data => {
          setMovie(data.results || data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error(error);
          setFetchFailed(true);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [slug, hasStateLocation]);

  // Pre-caricamento invisibile per tracciare quando il backdrop è pronto
  useEffect(() => {
    if (movie && movie.backdrop_path) {
      const img = new Image();
      img.src = `${backendUrl}${movie.backdrop_path}`;
      img.onload = () => setBackdropLoaded(true);
    } else if (movie || fetchFailed) {
      setBackdropLoaded(true);
    }
  }, [movie, fetchFailed]);

  return (
    <div 
      className={`backdrop-wrapper d-flex align-items-center ${backdropLoaded ? 'loaded' : ''}`} 
      style={{ 
        '--bg-image': `url(${movie && movie.backdrop_path ? `${backendUrl}${movie.backdrop_path}` : ''})`
      }}
    > 
      {/* Shimmer visibile sullo sfondo finché il backdrop non è caricato */}
      {!backdropLoaded && (
        <div className="skeleton-loader position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}></div>
      )}

      <div className="backdrop-content container py-4 d-flex align-items-center justify-content-center">
        {fetchFailed ? (
          <span className="text-white">Movie not found or error while loading.</span>
        ) : isLoading || !movie ? (
          /* SKELETON LOADER DELLA CARD (Mantiene la struttura visiva con effetto shimmer) */
          <div className="detail-card-wrapper w-100 d-flex flex-column flex-lg-row align-items-stretch text-white" style={{ maxWidth: '1300px' }}>
            {/* Finto Poster */}
            <div className="skeleton-loader flex-shrink-0 mb-3 mb-lg-0" style={{ width: '300px', aspectRatio: '2/3', borderRadius: '15px' }}></div>
            
            {/* Finti Contenuti a destra */}
            <div className="ms-0 ms-lg-4 flex-grow-1 d-flex flex-column justify-content-between py-1 w-100">
              <div className="d-flex flex-column gap-3">
                <div className="skeleton-loader" style={{ height: '35px', width: '50%', borderRadius: '6px' }}></div>
                <div className="skeleton-loader" style={{ height: '90px', width: '100%', borderRadius: '6px' }}></div>
                <div className="d-flex gap-2">
                  <div className="skeleton-loader" style={{ height: '24px', width: '70px', borderRadius: '4px' }}></div>
                  <div className="skeleton-loader" style={{ height: '24px', width: '70px', borderRadius: '4px' }}></div>
                </div>
                <div className="skeleton-loader mt-3" style={{ height: '80px', width: '100%', borderRadius: '8px' }}></div>
              </div>
              <div className="skeleton-loader mt-4" style={{ height: '25px', width: '100%', borderRadius: '4px' }}></div>
            </div>
          </div>
        ) : (
          <MovieDetailCard movie={movie} />
        )}
      </div>
    </div>
  );
}

export default Movie;
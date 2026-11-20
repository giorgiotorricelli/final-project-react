import DirectorDetailCard from "../components/DirectorDetailCard.jsx";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Director() {
  const baseUrl = 'http://localhost:8000/api/directors/';
  const backendUrl = "http://127.0.0.1:8000/storage/";
  const { id } = useParams();
  const location = useLocation();

  const initialDirector = location.state || null;

  const [director, setDirector] = useState(initialDirector);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialDirector);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

  useEffect(() => {
    // Se abbiamo già il regista COMPLETO di movies, non rifacciamo la fetch
    if (director?.movies && String(director.id) === String(id)) {
      setIsLoading(false);
      return;
    }

    // Altrimenti scarichiamo il dettaglio completo
    fetch(`${baseUrl}${id}`)
      .then(resp => {
        if (!resp.ok) throw new Error("Errore nel recupero del regista");
        return resp.json();
      })
      .then(data => {
        setDirector(data.results || data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        if (!director) setFetchFailed(true);
        setIsLoading(false);
      });
  }, [id]);

  // Pre-caricamento invisibile per tracciare quando il backdrop è pronto
  useEffect(() => {
    const backdropPath = director?.movies?.[0]?.backdrop_path;

    if (backdropPath) {
      const img = new Image();
      img.src = `${backendUrl}${director.movies[0].backdrop_path}`;
      img.onload = () => setBackdropLoaded(true);
    } else if (director || fetchFailed) {
      setBackdropLoaded(true);
    }
  }, [director, fetchFailed]);

  return (
    <div 
      className={`backdrop-wrapper d-flex align-items-center ${backdropLoaded ? 'loaded' : ''}`} 
      style={{ 
        '--bg-image': `url(${director?.movies?.[0]?.backdrop_path ? `${backendUrl}${director.movies[0].backdrop_path}` : ''})`
      }}
    > 
      {/* Shimmer visibile sullo sfondo finché il backdrop non è caricato */}
      {!backdropLoaded && (
        <div className="skeleton-loader position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}></div>
      )}
      <div className="backdrop-content container d-flex align-items-center justify-content-center">
        {fetchFailed ? (
          <span className="text-white">Director not found or error while loading.</span>
        ) : isLoading || !director ? (
          <div className="detail-card-wrapper w-100 d-flex flex-column flex-lg-row align-items-stretch text-white">
            <div className="skeleton-loader flex-shrink-0 mb-3 mb-lg-0" style={{ width: '300px', aspectRatio: '2/3', borderRadius: '15px' }}></div>
            <div className="ms-0 ms-lg-4 flex-grow-1 d-flex flex-column justify-content-between py-1 w-100">
              <div className="d-flex flex-column gap-3">
                <div className="skeleton-loader" style={{ height: '35px', width: '50%', borderRadius: '6px' }}></div>
                <div className="skeleton-loader" style={{ height: '90px', width: '100%', borderRadius: '6px' }}></div>
              </div>
            </div>
          </div>
        ) : (
          <DirectorDetailCard director={director} />
        )}
      </div>
    </div>
  );
}

export default Director;
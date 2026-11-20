import ActorDetailCard from "../components/ActorDetailCard.jsx";
import { useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

function Actor() {
  const baseUrl = 'http://localhost:8000/api/actors/';
  const backendUrl = "http://127.0.0.1:8000/storage/";
  const { id } = useParams();
  const location = useLocation();

  const initialActor = location.state || null;

  const [actor, setActor] = useState(initialActor);
  const [fetchFailed, setFetchFailed] = useState(false);
  // Mostriamo lo skeleton SOLO se non abbiamo nemmeno i dati base da location.state
  const [isLoading, setIsLoading] = useState(!initialActor);
  const [backdropLoaded, setBackdropLoaded] = useState(false);

  useEffect(() => {
    // Se abbiamo già l'attore COMPLETO di movies (es. navigando da una lista che li includeva), non rifacciamo la fetch
    if (actor?.movies && String(actor.id) === String(id)) {
      setIsLoading(false);
      return;
    }

    // Altrimenti (nessuno state, oppure state parziale arrivato da MovieDetailCard), scarichiamo il dettaglio completo
    fetch(`${baseUrl}${id}`)
      .then(resp => {
        if (!resp.ok) throw new Error("Errore nel recupero dell'attore");
        return resp.json();
      })
      .then(data => {
        setActor(data.results || data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error(error);
        // Segnaliamo errore critico solo se non avevamo nemmeno i dati base in cache
        if (!actor) setFetchFailed(true);
        setIsLoading(false);
      });
  }, [id]);

  // Pre-caricamento invisibile per tracciare quando il backdrop è pronto
  useEffect(() => {
    const backdropPath = actor?.movies?.[0]?.backdrop_path;

    if (backdropPath) {
      const img = new Image();
      img.src = `${backendUrl}${actor.movies[0].backdrop_path}`;
      img.onload = () => setBackdropLoaded(true);
    } else if (actor || fetchFailed) {
      setBackdropLoaded(true);
    }
  }, [actor, fetchFailed]);

  return (
    <div 
      className={`backdrop-wrapper d-flex align-items-center ${backdropLoaded ? 'loaded' : ''}`} 
      style={{ 
        '--bg-image': `url(${actor?.movies?.[0]?.backdrop_path ? `${backendUrl}${actor.movies[0].backdrop_path}` : ''})`
      }}
    > 
      {/* Shimmer visibile sullo sfondo finché il backdrop non è caricato */}
      {!backdropLoaded && (
        <div className="skeleton-loader position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}></div>
      )}
      <div className="backdrop-content container d-flex align-items-center justify-content-center">
        {fetchFailed ? (
          <span className="text-white">Actor not found or error while loading.</span>
        ) : isLoading || !actor ? (
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
          <ActorDetailCard actor={actor} />
        )}
      </div>
    </div>
  );
}

export default Actor;
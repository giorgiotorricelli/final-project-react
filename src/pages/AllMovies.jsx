import { useEffect, useState } from "react";
import { fetchMovies, handlePageSwap, preloadPages, handleGenreCheck } from "../utils/functions.js";
import MovieBasicCard from "../components/MovieBasicCard.jsx";
import { ArrowBarLeft, ArrowBarRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const pagesToPreload = 4; //impostare le pagine che si ha intenzione di preloadare
//in questo caso movies ha solo 9 pagine, imposto a 4 così le carica tutte ed è molto fluido

/* per carosello */ 
  

function AllMovies() {
  const [movieList, setMovieList] = useState([]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPage, setLastPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [preloadedPages, setPreloadedPages] = useState({
  });
  const [genres, setGenres] = useState(null);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [applyGenres, setApplyGenres] = useState([]);
  const [titleValue, setTitleValue] = useState('');
  const [titleSearch, setTitleSearch] = useState('');

  useEffect(() => {
    const tId = setTimeout(() => {
      setTitleSearch(titleValue);
    }, 800);

    return () => clearTimeout(tId);
  }, [titleValue]);

  useEffect(() => {
    setCurrentPage(1);
    setPreloadedPages({});
    setLastPage(null);
  }, [applyGenres, titleSearch]);

  useEffect(() => { // riguarda il debounce della selezione generi
    
    const t = setTimeout(() => {
      setApplyGenres(selectedGenres);
    }, 1000)

    return () => clearTimeout(t);
  }, [selectedGenres])

  useEffect(() => {
    const prom = fetch('http://localhost:8000/api/genres')
      .then(resp => {
        return resp.json();
      }).then(data => {
        return data;

      }).catch(error => {
        console.error(error)
      });

    prom.then(results => {
      setGenres(results.results);
    })
  }, [])

  useEffect(() => { // questo riguarda la fetch per filtri o della prima pagina
    
    // Se abbiamo già questa pagina in memoria (precaricata), usiamo quella senza rifare la fetch
    if (preloadedPages[currentPage]) {
      setMovieList(preloadedPages[currentPage]);
      setFetchFailed(false);
      setIsLoading(false);
      return;
    }

    // Creiamo un controller 
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      setIsLoading(true);

      fetchMovies(currentPage, applyGenres, titleSearch, signal)
        .then(results => {
          setMovieList(results.results.data);
          setIsLoading(false);
          setLastPage(results.results.last_page);

          setPreloadedPages(prev => ({
            ...prev,
            [currentPage]: results.results.data
          }));
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            setIsLoading(false);
            setFetchFailed(true);
          }
        });
    }, 200); // 200 millisecondi di "respiro"

    // 3. Cleanup: se cambi pagina velocemente, puliamo sia il timer che l'AbortController
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentPage, applyGenres, titleSearch, preloadedPages]);


  /* useEffect(() => { // questa riguarda le fetch senza filtri
    // Se non sappiamo l'ultima pagina, OPPURE se ci sono filtri attivi (titolo o generi), niente preload
    console.log('UseEffect with preloadPages activated');
    const hasActiveFilters = titleSearch.trim() !== '' || (selectedGenres && selectedGenres.length > 0);

    if (lastPage === null || hasActiveFilters) return;

    const timer = setTimeout(() => { // il set timeout serve a dare priorità al rendering della pagina attuale
      // chiamata al preload
      preloadPages(pagesToPreload, currentPage, lastPage, preloadedPages, setPreloadedPages);
    }, 800);

    // Pulizia del timer se l'utente cambia pagina troppo velocemente
    return () => clearTimeout(timer);

  }, [currentPage, lastPage, titleSearch, selectedGenres]); */

  return (
    <>
      <div className="pt-2 px-2 d-flex justify-content-center text-warning position-relative" >
        <div className="search-input-container d-flex flex-column position-absolute" style={{ left: 5 }}>
          <input type="text" name="searchByTitle" id="searchByTitle" placeholder="search title"
            onChange={(event) => setTitleValue(event.target.value)} value={titleValue} />
        </div>

        <span style={lastPage === null || fetchFailed || movieList?.length === 0 ? {opacity: 0} : {}}>{`${currentPage} of ${lastPage}`}</span>
        <div className="dropdown position-absolute" style={{ right: 5 }}>
          <button className="btn btn-outline-warning dropdown-toggle" type="button"
            data-bs-auto-close="outside" data-bs-toggle="dropdown" aria-expanded="false">
            Genres
          </button>
          <div className="dropdown-menu" id="myDropdownStyle">
            {Array.isArray(genres) && genres.map(genre => {
              return <div className="form-check form-switch" key={genre.id}>
                <input className="form-check-input" type="checkbox" role="switch" id={`switch${genre.name}`}
                 value={genre.name} onChange={(event) => handleGenreCheck(event, selectedGenres, setSelectedGenres)}/>
                <label className="form-check-label" htmlFor={`switch${genre.name}`}>{genre.name}</label>
              </div>
            })}
          </div>

        </div>
      </div>
      <div className={fetchFailed || movieList?.length === 0 ? "d-none" : "  d-flex justify-content-center mb-3 pt-1 gap-2"}>
        <button id="btnPrevious" className="btn btn-outline-warning previous-movie-page-btn"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarLeft /></button>
        <button id="btnNext" className="btn btn-outline-warning nect-movie-page-btn"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarRight /></button>
      </div>
      <div style={isLoading || fetchFailed || movieList?.length === 0 ?
        { minHeight: "calc(80vh - var(--header-min-height))" } : null}
        className={`container ${isLoading || fetchFailed || movieList?.length === 0 ? `d-flex flex-column justify-content-center align-items-center` : ''}`}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div>
            {fetchFailed || movieList?.length === 0 ?
              (<div className=" h-100 w-100 align-self-center">
                <h3 className="text-center">Opss.. something went wrong during movies collection, try refreshing</h3>
              </div>) :
              (<div className="row row-gap-2">
                {movieList.map((movie) => {
                  return <div className=" col-6 col-lg-4 col-xl-2 d-flex" key={movie.id}>
                    <Link to={`/movies/${movie.slug}`} state={movie}><MovieBasicCard movie={movie} isLoading={isLoading} key={movie.slug} /></Link>
                    
                  </div>
                })}
              </div>)}

          </div>

        )}
      </div>
    </>

  )

}

export default AllMovies
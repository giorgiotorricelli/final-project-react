import { useEffect, useState } from "react";
import { handlePageSwap } from "../utils/functions.js";
import ActorBasicCard from "../components/ActorBasicCard.jsx";
import { ArrowBarLeft, ArrowBarRight, StarFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function AllActors() {
  const [actorList, setActorList] = useState([]);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastPage, setLastPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [preloadedPages, setPreloadedPages] = useState({});
  

  const [nameValue, setNameValue] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [isPopular, setIsPopular] = useState(false);


  useEffect(() => {
    const tId = setTimeout(() => {
      setNameSearch(nameValue);
    }, 800);
    return () => clearTimeout(tId);
  }, [nameValue]);


  useEffect(() => {
    setCurrentPage(1);
    setPreloadedPages({});
  }, [nameSearch, isPopular]);

  useEffect(() => {
    if (preloadedPages[currentPage]) {
            setActorList(preloadedPages[currentPage]);
            setFetchFailed(false);
            setIsLoading(false);
            return;
        }
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      setIsLoading(true);

      
      let url = `http://localhost:8000/api/actors?page=${currentPage}`;
      if (nameSearch) url += `&name=${encodeURIComponent(nameSearch)}`;
      if (isPopular) url += `&popular=true`;

      fetch(url, { signal })
        .then(resp => resp.json())
        .then(data => {
          
          setActorList(data.results.data);
          setLastPage(data.results.last_page);
          setIsLoading(false);
          setFetchFailed(false);
          setPreloadedPages(prev => ({
            ...prev,
            [currentPage]: data.results.data
          }));
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            setIsLoading(false);
            setFetchFailed(true);
          }
        });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [currentPage, nameSearch, isPopular, preloadedPages]);

  return (
    <>
      <div className="pt-2 px-2 d-flex justify-content-center text-warning position-relative">

        <div className="search-input-container d-flex flex-column position-absolute" style={{ left: 5 }}>
          <input 
            type="text" 
            id="searchByName" 
            placeholder="search name"
            onChange={(event) => setNameValue(event.target.value)} 
            value={nameValue} 
          />
        </div>

        <span style={lastPage === null || fetchFailed || actorList?.length === 0 ? {opacity: 0} : {}}>{`${currentPage} of ${lastPage}`}</span>

        <div className="position-absolute" style={{ right: 5 }}>
          <button 
            className={`btn ${isPopular ? 'btn-warning' : 'btn-outline-warning'} d-flex align-items-center gap-1`}
            type="button"
            onClick={() => setIsPopular(!isPopular)}
          >
            <StarFill /> Popular
          </button>
        </div>
      </div>

      <div className={fetchFailed || actorList?.length === 0 ? "d-none" : "d-flex justify-content-center mb-3 pt-1 gap-2"}>
        <button id="btnPrevious" className="btn btn-outline-warning"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarLeft /></button>
        <button id="btnNext" className="btn btn-outline-warning"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarRight /></button>
      </div>

      <div style={isLoading || fetchFailed || actorList?.length === 0 ? { minHeight: "calc(80vh - var(--header-min-height))" } : null}
        className={`container ${isLoading || fetchFailed || actorList?.length === 0 ? `d-flex flex-column justify-content-center align-items-center` : ''}`}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div>
            {fetchFailed || actorList?.length === 0 ?
              (<div className="h-100 w-100 align-self-center">
                <h3 className="text-center">Opss.. something went wrong during actors collection, try refreshing</h3>
              </div>) :
              (<div className="row row-gap-2">
                {actorList.map((actor) => {
                  return (
                    <div className="  col-6 col-lg-4 col-xl-2 d-flex" key={actor.id}>
                      <Link to={`/actors/${actor.id}`} state={actor} className=" text-decoration-none text-white">
                        <ActorBasicCard actor={actor} isLoading={isLoading} />
                      </Link>
                    </div>
                  );
                })}
              </div>)}
          </div>
        )}
      </div>
    </>
  );
}

export default AllActors;
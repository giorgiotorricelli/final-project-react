import { useEffect, useState } from "react";
import { handlePageSwap } from "../utils/functions.js";
import DirectorBasicCard from "../components/DirectorBasicCard.jsx";
import { ArrowBarLeft, ArrowBarRight, StarFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

function AllDirectors() {
  const [directorList, setDirectorList] = useState([]);
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
            setDirectorList(preloadedPages[currentPage]);
            setFetchFailed(false);
            setIsLoading(false);
            return;
        }
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => {
      setIsLoading(true);

  
      let url = `http://localhost:8000/api/directors?page=${currentPage}`;
      if (nameSearch) url += `&name=${encodeURIComponent(nameSearch)}`;
      if (isPopular) url += `&popular=true`;

      fetch(url, { signal })
        .then(resp => resp.json())
        .then(data => {
   
          setDirectorList(data.results.data);
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

        <span style={lastPage === null || fetchFailed || directorList?.length === 0 ? {opacity: 0} : {}}>{`${currentPage} of ${lastPage}`}</span>


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

      <div className={fetchFailed || directorList?.length === 0 ? "d-none" : "d-flex justify-content-center mb-3 pt-1 gap-2"}>
        <button id="btnPrevious" className="btn btn-outline-warning"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarLeft /></button>
        <button id="btnNext" className="btn btn-outline-warning"
          onClick={(event) => handlePageSwap(event, setCurrentPage, currentPage, lastPage)}><ArrowBarRight /></button>
      </div>

      <div style={isLoading || fetchFailed || directorList?.length === 0 ? { minHeight: "calc(80vh - var(--header-min-height))" } : null}
        className={`container ${isLoading || fetchFailed || directorList?.length === 0 ? `d-flex flex-column justify-content-center align-items-center` : ''}`}>
        {isLoading ? (
          <span>Loading...</span>
        ) : (
          <div>
            { fetchFailed || directorList?.length === 0 ?
              (<div className="h-100 w-100 align-self-center">
                <h3 className="text-center">Opss.. something went wrong during directors collection, try refreshing</h3>
              </div>) :
              (<div className="row row-gap-2">
                {directorList.map((director) => {
                  return (
                    <div className="  col-6 col-lg-4 col-xl-2 d-flex" key={director.id}>
                      <Link to={`/directors/${director.id}`} state={director} className=" text-decoration-none text-white">
                        <DirectorBasicCard director={director} isLoading={isLoading} />
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

export default AllDirectors;
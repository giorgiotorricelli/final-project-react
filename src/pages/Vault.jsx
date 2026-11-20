import React from 'react'
import { useEffect } from 'react';
import { vaultFetch } from '../utils/functions.js';
import { useState } from 'react';
import MovieBasicCard from '../components/MovieBasicCard.jsx';
import ActorBasicCard from '../components/ActorBasicCard.jsx';
import DirectorBasicCard from '../components/DirectorBasicCard.jsx';
import { Link } from 'react-router-dom';
import { Trash } from 'react-bootstrap-icons';

function Vault() {

    const [isLoading, setIsLoading] = useState(true);
    const [fetchFailed, setFetchFailed] = useState(false);
    const [mode, setMode] = useState('movies');
    const [movieList, setMovieList] = useState([]);
    const [actorList, setActorList] = useState([]);
    const [directorList, setDirectorList] = useState([]);
    const [editing, setEditing] = useState(false);

    function handleDeletion(event) {
        const btn = event.target;
        const deleteMovie = btn.classList.contains('delete-movie');
        const deleteActor = btn.classList.contains('delete-actor');
        const deleteDirector = btn.classList.contains('delete-director');
        const toDelete = btn.value;
        

        if (deleteMovie) {
            const updated = movieList.filter(movie => {
                return movie.slug !== toDelete;
            });
            setMovieList(updated);
            
            const toLocal = updated.map(movie => {
                return movie.slug;
            });
            const stringified = JSON.stringify(toLocal);
            try {
                localStorage.setItem('favouriteMovies', stringified);
            } catch {
                console.error('Error while deleting movie');
            }
            
        }

        if (deleteActor) {
            const updated = actorList.filter(actor => {
                return actor.id !== Number(toDelete);
            });
            setActorList(updated);
            
            const toLocal = updated.map(actor => {
                return actor.id;
            });
            const stringified = JSON.stringify(toLocal);
            try {
                localStorage.setItem('favouriteActors', stringified);
            } catch {
                console.error('Error while deleting actor');
            }
            
        }

        if (deleteDirector) {
            const updated = directorList.filter(director => {
                return director.id !== Number(toDelete);
            });
            setDirectorList(updated);
            
            const toLocal = updated.map(director => {
                return director.id;
            });
            const stringified = JSON.stringify(toLocal);
            try {
                localStorage.setItem('favouriteDirectors', stringified);
            } catch {
                console.error('Error while deleting actor');
            }
            
        }

    
        
    }

    function getFavourites() {
        try {
            const favourites = {};

            favourites.favouriteMovies = localStorage.getItem('favouriteMovies');
            favourites.favouriteActors = localStorage.getItem('favouriteActors');
            favourites.favouriteDirectors = localStorage.getItem('favouriteDirectors');

            return favourites;

        } catch {
            console.error('Error in collecting vault');
            return {};
        }
    }



    useEffect(() => {

        const favourites = getFavourites();

        try {
            vaultFetch(favourites)
                .then(results => {
                    setMovieList(results.movies);
                    setActorList(results.actors);
                    setDirectorList(results.directors);
                    setIsLoading(false);
                })
        } catch (error) {
            console.error('Server Error:', error);
            setFetchFailed(true);
        }


    }, [])
    return (
        <>
        <button onClick={() => setEditing(!editing)} className={`d-md-none vault-btn position-absolute  btn ${editing ? 'btn-warning' : 'btn-outline-warning'} `}
                style={{bottom: 5, right: 5, zIndex: 20}}>Edit</button>
            <div className=' mt-3 d-flex justify-content-center gap-4 mb-3'>
                <button onClick={() => setMode('movies')}
                    className={`vault-btn btn ${mode === 'movies' ? 'btn-warning' : 'btn-outline-warning'} `}>Favourite Movies</button>
                <button onClick={() => setMode('actors')}
                    className={`vault-btn btn ${mode === 'actors' ? 'btn-warning' : 'btn-outline-warning'} `}>Favourite Actors</button>
                <button onClick={() => setMode('directors')}
                    className={`vault-btn btn ${mode === 'directors' ? 'btn-warning' : 'btn-outline-warning'} `}>Favourite Directors</button>
                <button onClick={() => setEditing(!editing)} className={`d-none d-md-inline vault-btn position-absolute  btn ${editing ? 'btn-warning' : 'btn-outline-warning'} `}
                style={{right: 5}}>Edit</button>
            </div>
            {mode === 'movies' && <div className={` container ${isLoading || fetchFailed || movieList.length === 0 ? 
                'h-75 d-flex justify-content-center align-items-center' : ''}`}>
                {isLoading && <span>Loading...</span>}
                {fetchFailed && <h3>Oops... something went wrong collecting your vault</h3>}
                {movieList.length === 0 && !isLoading && !fetchFailed && <h3>No favourite movies? Add some...</h3>}
                {!isLoading && !fetchFailed && movieList.length > 0 && mode === 'movies' &&
                <div className="row row-gap-2">
                {movieList.map((movie) => {
                  return <div className=" col-6 col-lg-4 col-xl-2 d-flex position-relative" key={movie.slug}>
                    {editing && <button onClick={(event) => handleDeletion(event)} value={movie.slug} className='delete-movie vault-trash-btn btn btn-outline-danger position-absolute' style={{right: 25, top: 15}}><Trash style={{ fontSize: "1.5rem"}}/></button> }
                    {editing ? <MovieBasicCard movie={movie} isLoading={isLoading} key={`edit-${movie.slug}`} fromVault={true}/> :
                    <Link to={`/movies/${movie.slug}`} state={movie}><MovieBasicCard movie={movie} isLoading={isLoading} key={movie.slug} fromVault={true}/></Link>
                    }
                    
                  </div>
                })}
              </div>}
            </div>}
            {mode === 'actors' && <div className={` container ${isLoading || fetchFailed || actorList.length === 0 ? 
                'h-75 d-flex justify-content-center align-items-center' : ''}`}>
                {isLoading && <span>Loading...</span>}
                {fetchFailed && <h3>Oops... something went wrong collecting your vault</h3>}
                {actorList.length === 0 && !isLoading && !fetchFailed && <h3>No favourite actors? Add some...</h3>}
                {!isLoading && !fetchFailed && actorList.length > 0 && mode === 'actors' &&
                <div className="row row-gap-2">
                {actorList.map((actor) => {
                  return <div className=" col-6 col-lg-4 col-xl-2 d-flex position-relative" key={`${crypto.randomUUID()}actor.id`}>
                    {editing && <button onClick={(event) => handleDeletion(event)} value={actor.id} className='delete-actor vault-trash-btn btn btn-outline-danger position-absolute' style={{right: 25, top: 15}}><Trash style={{ fontSize: "1.5rem"}}/></button> }
                    {editing ? 
                    <ActorBasicCard actor={actor} isLoading={isLoading} fromVault={true}/> :
                    <Link to={`/actors/${actor.id}`} state={actor}><ActorBasicCard actor={actor} isLoading={isLoading}/></Link>
                    }
                  </div>
                })}
              </div>}
            </div>}
            {mode === 'directors' && <div className={` container ${isLoading || fetchFailed || directorList.length === 0 ? 
                'h-75 d-flex justify-content-center align-items-center' : ''}`}>
                {isLoading && <span>Loading...</span>}
                {fetchFailed && <h3>Oops... something went wrong collecting your vault</h3>}
                {directorList.length === 0 && !isLoading && !fetchFailed && <h3>No favourite directors? Add some...</h3>}
                {!isLoading && !fetchFailed && directorList.length > 0 && mode === 'directors' &&
                <div className="row row-gap-2">
                {directorList.map((director) => {
                  return <div className="  col-6col-lg-4 col-xl-2 d-flex position-relative" key={`${'dir-'}director.id`}>
                    {editing && <button onClick={(event) => handleDeletion(event)} value={director.id} className='delete-director vault-trash-btn btn btn-outline-danger position-absolute' style={{right: 25, top: 15}}><Trash style={{ fontSize: "1.5rem"}}/></button> }
                    {editing ? 
                    <DirectorBasicCard director={director} isLoading={isLoading}/> :
                    <Link to={`/directors/${director.id}`} state={director}><DirectorBasicCard director={director} isLoading={isLoading}/></Link>
                    }
                    
                  </div>
                })}
              </div>}
            </div>}
        </>


    )
}

export default Vault;
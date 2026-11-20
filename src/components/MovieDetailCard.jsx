import ActorBasicCard from "./ActorBasicCard";
import DirectorBasicCard from "./DirectorBasicCard";
import { StarFill, Star, StarHalf, Heart, HeartFill } from "react-bootstrap-icons";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MovieDetailCard({ movie }) {

    const backendUrl = "http://127.0.0.1:8000";
    const [posterLoaded, setPosterLoaded] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);

    if (!movie) return null;

    // funzione che interroga localStorage
    function getFavouriteSlugs() {
        try {
            const rawSlugs = localStorage.getItem('favouriteMovies');
            const slugs = rawSlugs ? JSON.parse(rawSlugs) : [];
            return slugs;
        } catch {
            return [];
        }
    }
    //hook solo per definire lo stato di inizio di isFavourite
    useEffect(() => {
        const favouriteSlugs = getFavouriteSlugs();
        const isPresent = favouriteSlugs.includes(movie.slug);
        if (isPresent) {
            setIsFavourite(true);
        }

    }, [])

    useEffect(() => {
        const favouriteSlugs = getFavouriteSlugs();
        const isPresent = favouriteSlugs.includes(movie.slug);

        if (isPresent && !isFavourite) {
            const toDelete = favouriteSlugs.indexOf(movie.slug);
            favouriteSlugs.splice(toDelete, 1);
            try {
                localStorage.setItem('favouriteMovies', JSON.stringify(favouriteSlugs));
            } catch (error) {
                console.error("Error in elimination fase:", error);
            }
        }

        if (!isPresent && isFavourite) {
            favouriteSlugs.push(movie.slug);
            try {
                localStorage.setItem('favouriteMovies', JSON.stringify(favouriteSlugs));
            } catch (error) {
                console.error("Error in saving fase:", error);
            }
        }

        console.log(localStorage.getItem('favouriteMovies'))
        
    }, [movie, isFavourite]);

    let displayStars = [];
    for (let i = 0; i < 10; i++) {
        if (movie.rating - i < 1 && movie.rating - i > 0.25 && movie.rating - i < 0.75) {
            displayStars.push('half');
            continue;
        }

        if (i < movie.rating) {
            displayStars.push('fill');
        } else {
            displayStars.push('star');
        }
    }

    // funzione di supporto per i generi
    const renderGenres = () => (
        <div className="d-flex gap-2 mb-3 flex-wrap justify-content-center justify-content-md-start position-relative">
            {/* stella preferiti */}
                        {isFavourite ?
                            <HeartFill onClick={() => setIsFavourite(!isFavourite)} className="add-to-favourite text-warning position-absolute" style={{ right: "0", fontSize: "1.6rem" }} /> :
                            <Heart onClick={() => setIsFavourite(!isFavourite)} className="add-to-favourite text-warning position-absolute" style={{ right: "0", fontSize: "1.6rem" }} />
                        }
            {movie.genres && movie.genres.map(genre => (
                <span
                    key={genre.id}
                    className="badge py-1"
                    style={{ backgroundColor: genre.color || '#ffc107' }}
                >
                    {genre.name}
                </span>
            ))}
        </div>
    );

    // funzione di supporto per Actors, director e footer
    const renderCastAndFooter = () => (
        <div className="mt-4 pt-3 border-top border-secondary w-100">
            <div className="row g-3">
                {/* actors */}
                <div className="col-12 col-md-8">
                    <h6 className="text-white fw-bold mb-2">Actors</h6>
                    <div className="d-flex gap-2 overflow-auto no-scrollbar pb-2 flex-nowrap flex-md-wrap">
                        {movie.actors && movie.actors.length > 0 ? (
                            movie.actors.map(actor => (
                                <div key={actor.id} style={{ width: '90px', flexShrink: 0 }}>
                                    <Link to={`/actors/${actor.id}`} state={actor} >
                                        <ActorBasicCard actor={actor} isLoading={!actor.profile_path} /></Link>
                                </div>
                            ))
                        ) : (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="skeleton-loader" style={{ width: '90px', aspectRatio: '2/3', borderRadius: '10px' }}></div>
                            ))
                        )}
                    </div>
                </div>

                {/* director */}
                <div className="col-12 col-md-4">
                    <h6 className="text-white fw-bold mb-2">Director</h6>
                    <div>
                        {movie.director ? (
                            <div style={{ width: '90px' }}>
                                <Link to={`/directors/${movie.director.id}`} state={movie.director} >
                                    <DirectorBasicCard director={movie.director} isLoading={!movie.director.profile_path} /></Link>

                            </div>
                        ) : (

                            <div key={crypto.randomUUID()} className="skeleton-loader" style={{ width: '90px', aspectRatio: '2/3', borderRadius: '10px' }}></div>

                        )}
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top border-secondary text-white">
                <div className="small d-flex align-items-center gap-2">
                    <span>Rating: </span>
                    {displayStars.map((el) => {
                        if (el === 'fill') {
                            return <StarFill className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                        } else if (el === 'star') {
                            return <Star className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                        } else {
                            return <StarHalf className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                        }
                    })}
                    <span className="text-warning fw-bold"> {movie.rating}</span>
                </div>
                <div className="small text-light">
                    {movie.release_date}
                </div>
            </div>
        </div>
    );

    return (
        <div className="detail-card-wrapper text-white">


            {/* LAYOUT DESKTOP (992px in su) */}

            <div className="d-none d-lg-flex flex-column flex-lg-row align-items-stretch">
                <div className="detail-card-img-wrapper flex-shrink-0 position-relative overflow-hidden" style={{ borderRadius: '15px' }}>
                    {/* Shimmer visibile finché l'immagine non carica */}
                    {!posterLoaded && (
                        <div className="skeleton-loader position-absolute top-0 start-0 w-100 h-100"></div>
                    )}
                    <img
                        className={`detail-card-img shadow ${!posterLoaded ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transition: 'opacity 0.3s ease' }}
                        src={`${backendUrl}/storage/${movie.poster_path}`}
                        alt={`${movie.title} poster`}
                        onLoad={() => setPosterLoaded(true)}
                    />
                </div>
                <div className="ms-4 flex-grow-1 d-flex flex-column justify-content-between py-1">
                    <div className=" position-relative">
                        <h1 className="title-font fs-2 mb-2 text-white">{movie.title}</h1>
                        <div className="movie-description-scroll text-light small mb-3">
                            {movie.description || movie.overview}
                        </div>
                        {movie.genres ? renderGenres() : <div style={{ minHeight: "20px" }}></div>}

                        <div className="row mt-3 g-3">
                            <div className="col-8">
                                <h6 className="text-white fw-bold mb-2">Actors</h6>
                                <div className="d-flex gap-2 overflow-auto no-scrollbar pb-2 flex-wrap">
                                    {movie.actors && movie.actors.length > 0 ? (
                                        movie.actors.map(actor => (
                                            <div key={actor.id} style={{ width: '90px', flexShrink: 0 }}>
                                                <Link to={`/actors/${actor.id}`} state={actor} >
                                                    <ActorBasicCard actor={actor} isLoading={!actor.profile_path} />
                                                </Link>

                                            </div>
                                        ))
                                    ) : (
                                        [...Array(5)].map((_, i) => (
                                            <div key={i} className="skeleton-loader" style={{ width: '90px', aspectRatio: '2/3', borderRadius: '10px' }}></div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="col-4">
                                <h6 className="text-white fw-bold mb-2">Director</h6>
                                <div>
                                    {movie.director ? (
                                        <div style={{ width: '90px' }}>
                                            <Link to={`/directors/${movie.director.id}`} state={movie.director} >
                                                <DirectorBasicCard director={movie.director} isLoading={!movie.director.profile_path} />
                                            </Link>

                                        </div>
                                    ) : (

                                        <div key={crypto.randomUUID()} className="skeleton-loader" style={{ width: '90px', aspectRatio: '2/3', borderRadius: '10px' }}></div>

                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary text-white">
                        <div className="small d-flex align-items-center gap-2">
                            <span>Rating: </span>
                            {displayStars.map((el) => {
                                if (el === 'fill') {
                                    return <StarFill className="text-warning" key={crypto.randomUUID()} />
                                } else if (el === 'star') {
                                    return <Star className="text-warning" key={crypto.randomUUID()} />
                                } else {
                                    return <StarHalf className="text-warning" key={crypto.randomUUID()} />
                                }
                            })}

                            <span className="text-warning fw-bold"> {movie.rating}</span>
                        </div>
                        <div className="small text-light">
                            {movie.release_date}
                        </div>
                    </div>
                </div>
            </div>


            {/* LAYOUT MOBILE E TABLET (sotto i 992px) */}

            <div className="d-flex d-lg-none flex-column">
                {/* Top: Poster + Testo (In colonna su mobile <768px, affiancati tra 768px e 992px) */}
                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start">
                    <div className="detail-card-img-wrapper flex-shrink-0 mb-3 mb-md-0">
                        <img
                            className="detail-card-img shadow"
                            src={`${backendUrl}/storage/${movie.poster_path}`}
                            alt={`${movie.title} poster`}
                        />
                    </div>
                    <div className="ms-0 ms-md-4 flex-grow-1 w-100 position-relative">
                        <h1 className="title-font fs-3 fs-md-2 mb-2 text-white text-center text-md-start">
                            {movie.title}
                        </h1>
                        <div className="description-scroll text-light small mb-3">
                            {movie.description || movie.overview}
                        </div>
                        {renderGenres()}
                    </div>
                </div>

                {/* funzione di supporto */}
                {renderCastAndFooter()}
            </div>

        </div>
    );
}

export default MovieDetailCard;
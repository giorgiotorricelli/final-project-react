import { useState } from "react";
import { StarFill, Star, StarHalf, Heart, HeartFill } from "react-bootstrap-icons";
import { useEffect } from "react";
import MovieBasicCard from "./MovieBasicCard.jsx";
import { Link } from "react-router-dom";

function DirectorDetailCard({ director }) {

    const backendUrl = "http://127.0.0.1:8000";
    const [imageLoaded, setImageLoaded] = useState(false);
    const [moviesLoadedImages, setMoviesLoadedImages] = useState({});
    const [isFavourite, setIsFavourite] = useState(false);



    // funzione che interroga localStorage
    function getFavouriteIds() {
        try {
            const rawIds = localStorage.getItem('favouriteDirectors');
            const ids = rawIds ? JSON.parse(rawIds) : [];
            return ids;
        } catch {
            return [];
        }
    }
    //hook solo per definire lo stato di inizio di isFavourite
    useEffect(() => {
        const favouriteIds = getFavouriteIds();
        const isPresent = favouriteIds.includes(director.id);
        if (isPresent) {
            setIsFavourite(true);
        }

    }, [])

    useEffect(() => {
        const favouriteIds = getFavouriteIds();
        const isPresent = favouriteIds.includes(director.id);

        if (isPresent && !isFavourite) {
            const toDelete = favouriteIds.indexOf(director.id);
            favouriteIds.splice(toDelete, 1);
            try {
                localStorage.setItem('favouriteDirectors', JSON.stringify(favouriteIds));
            } catch (error) {
                console.error("Error in elimination fase:", error);
            }
        }

        if (!isPresent && isFavourite) {
            favouriteIds.push(director.id);
            try {
                localStorage.setItem('favouriteDirectors', JSON.stringify(favouriteIds));
            } catch (error) {
                console.error("Error in saving fase:", error);
            }
        }


    }, [director, isFavourite]);

    useEffect(() => {
        if (!director || !director.movies) return;

        director.movies.forEach(movie => {

            const img = new Image();
            img.src = `${backendUrl}/storage/${movie.poster_path}`;
            img.onload = () => setMoviesLoadedImages(prev => ({
                ...prev,
                [movie.poster_path]: true
            }));

        });


    }, [director, backendUrl]);


    let displayStars = [];
    for (let i = 0; i < 10; i++) {
        if (director.popularity - i < 1 && director.popularity - i > 0.25 && director.popularity - i < 0.75) {
            displayStars.push('half');
            continue;
        }
        if (i < director.popularity) {
            displayStars.push('fill');
        } else {
            displayStars.push('star');
        }
    }

    return (
        <div className="detail-card-wrapper text-white">
            <div className="d-flex flex-column flex-lg-row align-items-stretch">
                {/* Poster / Profile Image */}
                <div className="detail-card-img-wrapper flex-shrink-0 position-relative overflow-hidden" style={{ borderRadius: '15px' }}>
                    {!imageLoaded && (
                        <div className="skeleton-loader position-absolute top-0 start-0 w-100 h-100"></div>
                    )}
                    <img
                        className={`detail-card-img shadow ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transition: 'opacity 0.3s ease' }}
                        src={`${backendUrl}/storage/${director.profile_path}`}
                        alt={`${director.name} profile`}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>


                <div className="ms-0 ms-lg-4 flex-grow-1 d-flex flex-column justify-content-between py-1 mt-3 mt-lg-0">
                    <div className=" position-relative">
                        {/* stella preferiti */}
                        {isFavourite ?
                            <HeartFill onClick={() => setIsFavourite(!isFavourite)} className="add-to-favourite text-warning position-absolute" style={{ right: "-15", top: "-15", fontSize: "1.6rem" }} /> :
                            <Heart onClick={() => setIsFavourite(!isFavourite)} className="add-to-favourite text-warning position-absolute" style={{ right: "-15", top: "-15", fontSize: "1.6rem" }} />
                        }
                        <h1 className="title-font fs-2 mb-2 text-white">{director.name}</h1>
                        <div className="text-warning small mb-3">
                            Born: {director.birthday} {director.place_of_birth ? `in ${director.place_of_birth}` : ''}
                            {director.deathday && <span className="text-danger ms-2">| Died: {director.deathday}</span>}
                        </div>
                        <div className="description-scroll text-light small mb-3">
                            {director.biography || "No biography available."}
                        </div>
                    </div>
                    <div className="row g-3">
                        {/* movies */}
                        <div className="col-12 col-md-8">
                            <h6 className="text-white fw-bold mb-2">Movies</h6>
                            <div className="d-flex gap-2 overflow-auto no-scrollbar pb-2 flex-nowrap flex-md-wrap">
                                {director.movies && director.movies.length > 0 ? (
                                    director.movies.map(movie => (
                                        <div key={movie.slug} style={{ width: '90px', flexShrink: 0 }}>
                                            <Link to={`/movies/${movie.slug}`}
                                                state={movie}><MovieBasicCard movie={movie} isLoading={!movie.poster_path} /></Link>
                                        </div>
                                    ))
                                ) : (
                                    [...Array(5)].map((_, i) => (
                                        <div key={i} className="skeleton-loader" style={{ width: '90px', aspectRatio: '2/3', borderRadius: '10px' }}></div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>


                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary text-white">
                        <div className="small d-flex align-items-center gap-2">
                            <span>Popularity: </span>
                            {displayStars.map((el) => {
                                if (el === 'fill') return <StarFill className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                                if (el === 'star') return <Star className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                                return <StarHalf className="text-warning d-none d-sm-inline" key={crypto.randomUUID()} />
                            })}
                            <span className="text-warning fw-bold"> {parseFloat(director.popularity > 10 ? 10 : director.popularity).toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DirectorDetailCard;
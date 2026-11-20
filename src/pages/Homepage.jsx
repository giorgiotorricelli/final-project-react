import { Link } from "react-router-dom";
import { mottoGeneration } from "../utils/functions.js";
import { useState, useEffect, useRef, useMemo } from "react";
import MovieBasicCard from "../components/MovieBasicCard.jsx";
import ActorBasicCard from "../components/ActorBasicCard.jsx";

const timePerSentence = 11000;

function determineLetterActiveness(sentence) {
    const cleanSentence = sentence.replace(" ", "");
    const count = cleanSentence.length;
    const orderOfActiveness = [];
    const y = timePerSentence / count;
    const fraction = Number(y.toFixed(2));

    while (orderOfActiveness.length < count - 1) {
        const x = Math.ceil(Math.random() * count);
        if (!orderOfActiveness.includes(x) && x < count) {
            orderOfActiveness.push(x);
        }
    }

    return orderOfActiveness.map(number => number * fraction);
}

const preloadAndDecodeImage = (src) => {
    return new Promise((resolve) => {
        if (!src) {
            resolve();
            return;
        }
        const img = new Image();
        img.src = src;
        img.onload = () => {
            if (img.decode) {
                img.decode().then(resolve).catch(resolve);
            } else {
                resolve();
            }
        };
        img.onerror = resolve;
    });
};

function Homepage() {
    const sentences = useMemo(() => ["means ur vision", "make ur vault"], []);
    const collection = useMemo(() => mottoGeneration(sentences), [sentences]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const intervals = useMemo(
        () => determineLetterActiveness(sentences[currentIndex]),
        [sentences, currentIndex]
    );

    const [popularMovies, setPopularMovies] = useState(() =>
        Array.from({ length: 12 }, (_, i) => ({ id: "ph-mov-" + i, title: "Loading...", poster_path: "" }))
    );
    const [popularActors, setPopularActors] = useState(() =>
        Array.from({ length: 12 }, (_, i) => ({ id: "ph-act-" + i, name: "Loading...", profile_path: "" }))
    );

    const [isLoadingMovies, setIsLoadingMovies] = useState(true);
    const [isLoadingActors, setIsLoadingActors] = useState(true);

    const [isGlitchingMovies, setIsGlitchingMovies] = useState(false);
    const [isGlitchingActors, setIsGlitchingActors] = useState(false);
    const [isInteractiveMovies, setIsInteractiveMovies] = useState(false);
    const [isInteractiveActors, setIsInteractiveActors] = useState(false);

    const movieSpeedRef = useRef(0.02);
    const actorSpeedRef = useRef(0.02);
    const movieTargetSpeedRef = useRef(0.02);
    const actorTargetSpeedRef = useRef(0.02);

    const moviePosRef = useRef(0);
    const actorPosRef = useRef(0);

    // 12 card * (300px height + 16px mb-3) = 3792px
    const FIXED_HALF_HEIGHT = 12 * 316;

    const movieTrackRef = useRef(null);
    const actorTrackRef = useRef(null);

    // Sequenza temporale dei 6 step di accelerazione iniziale
    useEffect(() => {
        const steps = [
            { time: 300, speed: 0.15 },
            { time: 700, speed: 0.6 },
            { time: 1200, speed: 2.0 },
            { time: 1800, speed: 6.0 },
            { time: 2500, speed: 14.0 },
            { time: 3200, speed: 30.0 },
        ];

        const timers = steps.map(step =>
            setTimeout(() => {
                movieTargetSpeedRef.current = step.speed;
                actorTargetSpeedRef.current = step.speed;
            }, step.time)
        );

        return () => timers.forEach(clearTimeout);
    }, []);

    // 1. Fetch Movies Popolari
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch("http://localhost:8000/api/movies?popular")
                .then(res => res.json())
                .then(async (data) => {
                    const moviesArray = (data && data.results && data.results.data) ? data.results.data : [];
                    movieTargetSpeedRef.current = 30.0;

                    await Promise.all(
                        moviesArray.map(m =>
                            preloadAndDecodeImage(m.poster_path ? "http://127.0.0.1:8000/storage/" + m.poster_path : null)
                        )
                    );

                    setIsGlitchingMovies(true);

                    setTimeout(() => {
                        setPopularMovies(moviesArray);
                        setIsLoadingMovies(false);
                        setIsGlitchingMovies(false);

                        movieTargetSpeedRef.current = 10.0;
                        setTimeout(() => {
                            movieTargetSpeedRef.current = 4.0;
                            setTimeout(() => {
                                movieTargetSpeedRef.current = 2.5;
                                setIsInteractiveMovies(true);
                            }, 600);
                        }, 600);
                    }, 400);
                })
                .catch(err => {
                    console.error("Errore fetch movies popolari:", err);
                    setIsLoadingMovies(false);
                    movieTargetSpeedRef.current = 2.5;
                    setIsInteractiveMovies(true);
                });
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    // 2. Fetch Actors Popolari
    useEffect(() => {
        const timer = setTimeout(() => {
            fetch("http://localhost:8000/api/actors?popular")
                .then(res => res.json())
                .then(async (data) => {
                    const actorsArray = (data && data.results && data.results.data) ? data.results.data : [];
                    actorTargetSpeedRef.current = 30.0;

                    await Promise.all(
                        actorsArray.map(a =>
                            preloadAndDecodeImage(a.profile_path ? "http://127.0.0.1:8000/storage/" + a.profile_path : null)
                        )
                    );

                    setIsGlitchingActors(true);

                    setTimeout(() => {
                        setPopularActors(actorsArray);
                        setIsLoadingActors(false);
                        setIsGlitchingActors(false);

                        actorTargetSpeedRef.current = 10.0;
                        setTimeout(() => {
                            actorTargetSpeedRef.current = 4.0;
                            setTimeout(() => {
                                actorTargetSpeedRef.current = 2.5;
                                setIsInteractiveActors(true);
                            }, 600);
                        }, 600);
                    }, 400);
                })
                .catch(err => {
                    console.error("Errore fetch actors popolari:", err);
                    setIsLoadingActors(false);
                    actorTargetSpeedRef.current = 2.5;
                    setIsInteractiveActors(true);
                });
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    // Loop di animazione JS con translate3d (accelerazione GPU)
    useEffect(() => {
        let animationFrameId;

        const animate = () => {
            if (movieTrackRef.current) {
                movieSpeedRef.current += (movieTargetSpeedRef.current - movieSpeedRef.current) * 0.05;
                moviePosRef.current -= movieSpeedRef.current;

                if (Math.abs(moviePosRef.current) >= FIXED_HALF_HEIGHT) {
                    moviePosRef.current += FIXED_HALF_HEIGHT;
                }
                movieTrackRef.current.style.transform = "translate3d(0, " + moviePosRef.current + "px, 0)";
            }

            if (actorTrackRef.current) {
                actorSpeedRef.current += (actorTargetSpeedRef.current - actorSpeedRef.current) * 0.05;
                actorPosRef.current -= actorSpeedRef.current;

                if (Math.abs(actorPosRef.current) >= FIXED_HALF_HEIGHT) {
                    actorPosRef.current += FIXED_HALF_HEIGHT;
                }
                actorTrackRef.current.style.transform = "translate3d(0, " + actorPosRef.current + "px, 0)";
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [FIXED_HALF_HEIGHT]);

    // Logica animazione lettere motto
    useEffect(() => {
        const letters = document.getElementsByClassName("motto-letter-" + currentIndex);
        const lettersArray = Array.from(letters);

        const letterTimers = lettersArray.map((letter, index) =>
            setTimeout(() => {
                letter.classList.remove("hidden-letter");
            }, intervals[index])
        );

        const sentenceTimer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % sentences.length);
        }, timePerSentence + 1000);

        return () => {
            clearTimeout(sentenceTimer);
            letterTimers.forEach(clearTimeout);
            lettersArray.forEach(letter => letter.classList.add("hidden-letter"));
        };
    }, [sentences.length, intervals, currentIndex]);

    const movieContainerClass = "vertical-marquee-container d-none d-lg-block " + (isGlitchingMovies ? "glitch-active" : "");
    const actorContainerClass = "vertical-marquee-container d-none d-lg-block " + (isGlitchingActors ? "glitch-active" : "");

    return (
        <div className="home-container">
            {/* 1. HERO SECTION CON CAROSELLI VERTICALI E MOTTO */}
            <section
                className="hero-section text-center py-4 d-flex flex-column justify-content-center align-items-center"
                style={{ minHeight: "calc(75vh - var(--header-min-height))" }}
            >
                <div className="container mb-4">
                    <h1 className="display-4 fw-bold mb-2">Welcome to M.U.V.</h1>
                    <p className="lead text-warning mb-4">
                        <em>Make Ur Vault.</em> Discover, collect, and explore your ultimate digital cinema experience.
                    </p>
                    <Link to="/movies" className="btn btn-outline-warning btn-lg px-4">
                        Explore Movies
                    </Link>
                </div>

                {/* Layout a 3 Colonne */}
                <div
                    className="container-fluid d-flex justify-content-between align-items-center px-4 my-3"
                    style={{ overflow: "hidden", width: "100%" }}
                >
                    {/* COLONNA SINISTRA: Carosello Movies Verticale */}
                    <div
                        className={movieContainerClass}
                        onMouseEnter={() => {
                            if (isInteractiveMovies) movieTargetSpeedRef.current = 0;
                        }}
                        onMouseLeave={() => {
                            if (isInteractiveMovies) movieTargetSpeedRef.current = 2.5;
                        }}
                    >
                        <div className="vertical-marquee-track" ref={movieTrackRef}>
                            {popularMovies.map((movie, idx) => (
                                <div className="vertical-item mb-3" key={movie.id || "mov-" + idx} style={{ height: "300px" }}>
                                    {isLoadingMovies ? 
                                    (<MovieBasicCard movie={movie} isLoading={isLoadingMovies} />) : 
                                    (<Link to={`/movies/${movie.slug}`} state={movie}><MovieBasicCard movie={movie} isLoading={isLoadingMovies} /></Link>)}
                                    
                                </div>
                            ))}
                            {popularMovies.map((movie, idx) => (
                                <div className="vertical-item mb-3" aria-hidden="true" key={"dup-mov-" + (movie.id || idx)} style={{ height: "300px" }}>
                                    {/* qua passo tramite la prop state i dati del film */}
                                    {isLoadingMovies ? 
                                    (<MovieBasicCard movie={movie} isLoading={isLoadingMovies} />) : 
                                    (<Link to={`/movies/${movie.slug}`} state={movie}><MovieBasicCard movie={movie} isLoading={isLoadingMovies} /></Link>)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COLONNA CENTRALE: Motto Animato */}
                    <div className="motto-container flex-grow-1 px-3 text-center">
                        {collection.map((sentence, sentenceIndex) => {
                            const isSentenceActive = sentenceIndex === currentIndex;
                            const sentenceClass = "motto-sentence title-font d-flex flex-column gap-3 mt-5 " + (isSentenceActive ? "animating" : "d-none");
                            return (
                                <div
                                    id={"motto-sentence-" + sentenceIndex}
                                    className={sentenceClass}
                                    key={"sentence-" + sentenceIndex}
                                >
                                    {sentence.map((word, wordIdx) => (
                                        <div className="motto-word" key={"word-" + sentenceIndex + "-" + wordIdx}>
                                            {word.map((letter, letterIdx) => {
                                                const letterClass = "motto-letter motto-letter-" + sentenceIndex + " hidden-letter " + (letterIdx === 0 ? "first-letter" : "");
                                                return (
                                                    <h4
                                                        className={letterClass}
                                                        key={"letter-" + sentenceIndex + "-" + wordIdx + "-" + letterIdx}
                                                    >
                                                        {letter}
                                                    </h4>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>

                    {/* COLONNA DESTRA: Carosello Actors Verticale */}
                    <div
                        className={actorContainerClass}
                        onMouseEnter={() => {
                            if (isInteractiveActors) actorTargetSpeedRef.current = 0;
                        }}
                        onMouseLeave={() => {
                            if (isInteractiveActors) actorTargetSpeedRef.current = 2.5;
                        }}
                    >
                        <div className="vertical-marquee-track" ref={actorTrackRef}>
                            {popularActors.map((actor, idx) => (
                                <div className="vertical-item mb-3" key={actor.id || "act-" + idx} style={{ height: "300px" }}>
                                    <Link to={`/actors/${actor.id}`} state={actor}><ActorBasicCard actor={actor} isLoading={isLoadingActors} /></Link>
                                    
                                </div>
                            ))}
                            {popularActors.map((actor, idx) => (
                                <div className="vertical-item mb-3" aria-hidden="true" key={"dup-act-" + (actor.id || idx)} style={{ height: "300px" }}>
                                    <Link to={`/actors/${actor.id}`} state={actor}><ActorBasicCard actor={actor} isLoading={isLoadingActors} /></Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. ABOUT / BRAND MEANING SECTION */}
            <section className="about-section py-5 bg-black bg-opacity-25 text-center">
                <div className="container" style={{ maxWidth: "700px" }}>
                    <h2 className="h3 mb-3">What is M.U.V.?</h2>
                    <p className="text-danger fs-5">
                        Born from a true passion for cinema,
                        it's your personal space to curate, organize, and dive into an amazing
                        collection of movies, legendary actors, and visionary directors. Sleek,
                        fast, and built for true film lovers.
                    </p>
                </div>
            </section>
        </div>
    );
}

export default Homepage;

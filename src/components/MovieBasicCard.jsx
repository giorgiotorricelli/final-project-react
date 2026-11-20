import { useState } from "react";

function MovieBasicCard({ movie, isLoading }) {
    
    const backendUrl = "http://127.0.0.1:8000";
    return (
        <div className="basic-card-container d-flex flex-column">
            
            <div className="basic-card-img-wrapper">
                <img className="basic-card-img"
                src={isLoading ? '../src/assets/hero.png' : ` ${backendUrl}/storage/${movie.poster_path}`} 
                alt={isLoading ? '' : `${movie.title} poster`} />
            </div>
            {/* <div className="basic-card-bottom ">
                <h5 className=" ms-2" style={{textShadow: "rgb(218, 160, 0) 0px 1px 6px", color: "rgb(255, 255, 255)"}}>{isImageLoaded ? movie.title : 'waaaaaait :)'}</h5>
            </div> */}
            
        </div>

    )
}

export default MovieBasicCard;
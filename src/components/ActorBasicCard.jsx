import { useEffect } from "react";
import { useState } from "react";
import { Heart, HeartFill, X, Trash } from "react-bootstrap-icons";

function ActorBasicCard({ actor, isLoading}) {
    const nameSurname = actor.name.split(' ');

    const backendUrl = "http://127.0.0.1:8000";
    return (
        <div className={`basic-card-container d-flex flex-column`}>
            <div className="basic-card-img-wrapper">
                {!isLoading && !actor.profile_path ?
                    (<img className="basic-card-img" src={`https://placehold.co/400x600/451240/FFC107?text=${nameSurname[0]}+${nameSurname[1]}`} />) :
                    (<img className="basic-card-img"
                        src={isLoading ? '../src/assets/hero.png' : `${backendUrl}/storage/${actor.profile_path}`}
                        alt={isLoading ? '' : `${actor.name} profile photo`} />)}

            </div>
            {/* Scommenta se vuoi mostrare il nome sotto l'immagine */}
            {/* <div className="basic-card-bottom">
                <h5 className="ms-2" style={{textShadow: "rgb(218, 160, 0) 0px 1px 6px", color: "rgb(255, 255, 255)"}}>{isImageLoaded ? actor.name : 'waaaaaait :)'}</h5>
            </div> */}
        </div>
    );
}

export default ActorBasicCard;
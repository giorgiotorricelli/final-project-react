function DirectorBasicCard({ director, isLoading }) {
    const backendUrl = "http://127.0.0.1:8000";
    const nameSurname = director.name.split(' ');
    
    return (
        <div className="basic-card-container d-flex flex-column">
            <div className="basic-card-img-wrapper">
                {!isLoading && !director.profile_path ?
                    (<img className="basic-card-img" src={`https://placehold.co/400x600/451240/FFC107?text=${nameSurname[0]}+${nameSurname[1]}`} />) :
                    (<img className="basic-card-img"
                        src={isLoading ? '../src/assets/hero.png' : `${backendUrl}/storage/${director.profile_path}`}
                        alt={isLoading ? '' : `${director.name} profile photo`} />)}
            </div>
        </div>
    );
}

export default DirectorBasicCard;
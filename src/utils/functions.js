import { data } from "react-router-dom";

const baseUrl = 'http://localhost:8000/api/';

export async function vaultFetch(favourites) {
    console.log(favourites);
    
    let query = `${baseUrl}vault?`;
    // stringa['slug']
    const moviesArr = favourites.favouriteMovies ? JSON.parse(favourites.favouriteMovies) : [];

    moviesArr.forEach(el => {
        query += `&movies[]=${el}`
    });

    // stringa[id, id]
    const actorsArr = favourites.favouriteActors ? JSON.parse(favourites.favouriteActors) : [];

    actorsArr.forEach(el => {
        query += `&actors[]=${String(el)}`
    });

    // stringa[id, id]
    const directorsArr = favourites.favouriteDirectors ? JSON.parse(favourites.favouriteDirectors) : [];

    directorsArr.forEach(el => {
        query += `&directors[]=${String(el)}`
    });

    console.log(query);
    

    try {
        const response = await fetch(query);

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error in collecting vault:', error);
        throw error;
    }
    
}

export async function fetchMovies(page, genres, title, signal) {
    
    const pagination = page ? `?page=${String(page)}` : '';


    let withGenres = '';
    if (genres !== null && genres !== undefined && genres.length > 0) {
        genres.forEach(g => {
            withGenres += `&genres[]=${String(g)}`;
        });
    }
    const withTitle = title ? `&title=${title}` : '';
    try {
        const response = await fetch(`${baseUrl}movies${pagination}${withGenres}${withTitle}`);


        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const positionss = await response.json();

        positionss.results.data.forEach(movie => {
            if (movie.poster_path) {
                const imgPoster = new Image();
                imgPoster.src = movie.image_url;
            }
        });
        return positionss;

    } catch (error) {
        // Se la fetch è stata interrotta intenzionalmente, non stampiamo l'errore in console
        if (error.name === 'AbortError') {
            console.log('Fetch precedente interrotta con successo.');
            return;
        }
        console.error("Si è verificato un problema nella chiamata:", error.message);
        throw error;
    }
}

export function handlePageSwap(event, setCurrentPage, currentPage, lastPage) {
    const id = event.target.id;

    if (currentPage == lastPage && id === 'btnNext') {
        setCurrentPage(1);
        return;
    }

    if (currentPage == 1 && id === 'btnPrevious') {
        setCurrentPage(lastPage);
        return;
    }

    if (id === 'btnNext') {
        setCurrentPage(prev => prev + 1);
        return;
    } else if (id === 'btnPrevious') {
        setCurrentPage(prev => prev - 1);
        return;
    }

}

export function handleGenreCheck(event, selectedGenres, setSelectedGenres) {
    const input = event.target;
    const inputValue = input.value;
    console.log(inputValue);
    
    if (input.checked) {
        if (!selectedGenres.includes(inputValue)) {

            setSelectedGenres(prev => {
                return [...prev, inputValue];
            });
        }
    } else {
        if (selectedGenres.includes(inputValue)) {
            setSelectedGenres(prev => {
                const toDelete = selectedGenres.indexOf(inputValue);
                const toApply = prev.toSpliced(toDelete, 1);
                return toApply;
            });
        }
    } 

}



/*collection = [
    [// frasi
        [//parole
            [//lettere
                'M', 'A', 'K', 'E'
            ]
        ],
        [
        
        ]
    ],
    [
    
    ]
]
*/
export function mottoGeneration(sentencesArray) {
    let collection = [];
    sentencesArray.forEach((sentence) => {
        const words = sentence.split(' ');
        const wordsToAppend = [];
        collection.push(wordsToAppend);

        words.forEach((word) => {

            const clean = word.trim().toUpperCase();
            const letters = clean.split('');
            wordsToAppend.push(letters);
        })
    });

    return collection;

}

// nToFetch indica quante pagine prima e dopo sono da fetchare, deve essere quindi moltiplicato per 2
export async function preloadPages(nToFetch, currentPage, lastPage, fetchesObj, setter) {
    if (lastPage === null) {
        return;
    }
    console.log('preloadPages activated');

    //concentriamoci sul generalizzare la funzione a prescindere dai numeri

    /* esempio: lastPage = 10
                currentPage = 8
                nToFetch = 3
        deve fetchare page 5, 6, 7, 8, 9, 10, 1

    */


    const positions = [];
    let startingPoint;

    startingPoint = currentPage - nToFetch;

    for (let i = startingPoint; i < currentPage + nToFetch + 1; i++) {
        if (positions.includes(i)) {
            break;
        }


        if (i < 1) { //condizione magica, se i parte da sotto l'1 si pusha da last page + i in su
            positions.push(lastPage + i);
        } else if (i > lastPage) { // se i supera last page si fa l'opposto
            positions.push(i - lastPage);
        } else { // altrimenti condizione normale
            positions.push(i);
        }


    }

    /* arrivati a questo punto ho generalizzato i numeri, sto pensando di salvare i dati finali in un oggetto js con chiave
    numero pagina salvata in stringa e valore la pagina salvata in json.
    Inserire in una variabile di stato il valore reale, passarlo come argomento della funzione, confrontare con array positions
    le chiavi e i valori, se manca una delle due cose, quindi o non esiste una chiave o il valore associato è null, va fatta la fetch*/

    /* allo stato iniziale c'è bisogno di fare una fetch singola esterna per settare immediatamente i risultati, altrimenti non
    ho neanche il valore di lastpage*/
    const hasMissingPages = positions.some(
        position => fetchesObj[position] === null || fetchesObj[position] === undefined
    );

    // Se sono TUTTE già presenti in memoria, usciamo subito! Zero calcoli, zero setter.
    if (!hasMissingPages) {
        console.log("Tutte le pagine sono già in cache, salto il preload.");
        return;
    }

    
    const newFetchesObj = {};
    const toFetch = []; //qua salviamo gli url per la promise all

    positions.forEach((position) => {
        if (fetchesObj[position] === null || fetchesObj[position] === undefined) {
            newFetchesObj[position] = true;
            toFetch.push(`${baseUrl}movies?page=${String(position)}`);
        } else {
            newFetchesObj[position] = fetchesObj[position]; // se c'è la mantiene
        }

    });

    console.log(toFetch);
    
    //promise all

    if (toFetch.length > 0) {
        try {
            const responses = await Promise.all(toFetch.map(url => fetch(url)));

            const data = await Promise.all(responses.map(res => res.json()));
            
            data.forEach(d => {
                newFetchesObj[d.results.current_page] = d.results.data;
            });


            setter(prev => ({
                ...newFetchesObj,
                ...prev
            }));
            
        } catch (error) {
            console.error(error);
        }
    } 

}
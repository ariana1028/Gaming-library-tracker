const API_KEY = import.meta.env.VITE_RAWG_API_KEY;
const BASE_URL = 'https://api.rawg.io/api';

export const fetchGames = (page = 1, pageSize = 20) => {
    return fetch(`${BASE_URL}/games?key=${API_KEY}&page=${page}&page_size=${pageSize}`)
    .then(res => res.json())
    .then(json => json)
    .catch(err => {
        console.error(err);
        throw err;
    });
}

export const searchGames = async (query) => {

}

export const getGameDetails = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/games/${id}?key=${API_KEY}`);
        if (!res.ok) {
            throw new Error(`Failed to fetch game details (status: ${res.status})`);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Error fetching game details:", err);
        throw err;
    }
}

export const filterByPlatform = async (platform) => {

}

export const filterByGenre = async (genre) => {

}

export const getGenre = async () => {

}

export const getPlatforms = async () => {

}
// tools/tmdbMovieTool.js
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Helper function to make TMDB API calls
async function tmdbRequest(endpoint, params = {}) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
            params: {
                api_key: TMDB_API_KEY,
                ...params
            }
        });
        return response.data;
    } catch (error) {
        console.error('TMDB API Error:', error.response?.data || error.message);
        throw error;
    }
}

// Helper function to format movie data
function formatMovie(movie) {
    return {
        id: movie.id,
        title: movie.title || movie.name,
        overview: movie.overview,
        releaseDate: movie.release_date || movie.first_air_date,
        rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
        voteCount: movie.vote_count,
        popularity: movie.popularity?.toFixed(1),
        posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `${TMDB_IMAGE_BASE}${movie.backdrop_path}` : null,
        genreIds: movie.genre_ids || [],
        language: movie.original_language
    };
}

// Movie Search Tool
export const movieSearchTool = new DynamicStructuredTool({
    name: "search_movies",
    description: "Search for movies by title. Use this when users ask about specific movies, want to find movies by name, or need movie information. Returns top 5 matching movies with details.",
    schema: z.object({
        query: z.string().describe("Movie title to search for (e.g., 'Inception', 'The Matrix', 'Avatar')")
    }),
    func: async ({ query }) => {
        try {
            console.log(`Searching movies for: ${query}`);
            
            const data = await tmdbRequest('/search/movie', {
                query: query,
                include_adult: false,
                language: 'en-US',
                page: 1
            });

            if (!data.results || data.results.length === 0) {
                return JSON.stringify({
                    success: false,
                    message: `No movies found for "${query}"`
                });
            }

            const movies = data.results.slice(0, 5).map(formatMovie);

            return JSON.stringify({
                success: true,
                searchTerm: query,
                totalResults: data.total_results,
                movies: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to search movies. Please try again.'
            });
        }
    }
});

// Movie Details Tool
export const movieDetailsTool = new DynamicStructuredTool({
    name: "get_movie_details",
    description: "Get detailed information about a specific movie including cast, crew, runtime, budget, and revenue. Use this when users want in-depth information about a particular movie. Requires TMDB movie ID.",
    schema: z.object({
        movieId: z.number().describe("TMDB movie ID (obtained from search results)")
    }),
    func: async ({ movieId }) => {
        try {
            console.log(`Getting details for movie ID: ${movieId}`);
            
            const [movieData, creditsData] = await Promise.all([
                tmdbRequest(`/movie/${movieId}`, {
                    append_to_response: 'videos,reviews'
                }),
                tmdbRequest(`/movie/${movieId}/credits`)
            ]);

            const topCast = creditsData.cast.slice(0, 10).map(person => ({
                name: person.name,
                character: person.character,
                profileUrl: person.profile_path ? `${TMDB_IMAGE_BASE}${person.profile_path}` : null
            }));

            const director = creditsData.crew.find(person => person.job === 'Director');

            const trailer = movieData.videos?.results.find(
                video => video.type === 'Trailer' && video.site === 'YouTube'
            );

            return JSON.stringify({
                success: true,
                movie: {
                    id: movieData.id,
                    title: movieData.title,
                    tagline: movieData.tagline,
                    overview: movieData.overview,
                    releaseDate: movieData.release_date,
                    runtime: `${movieData.runtime} minutes`,
                    rating: movieData.vote_average.toFixed(1),
                    voteCount: movieData.vote_count,
                    budget: movieData.budget ? `$${(movieData.budget / 1000000).toFixed(1)}M` : 'N/A',
                    revenue: movieData.revenue ? `$${(movieData.revenue / 1000000).toFixed(1)}M` : 'N/A',
                    genres: movieData.genres.map(g => g.name),
                    director: director ? director.name : 'N/A',
                    cast: topCast,
                    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
                    posterUrl: movieData.poster_path ? `${TMDB_IMAGE_BASE}${movieData.poster_path}` : null,
                    backdropUrl: movieData.backdrop_path ? `${TMDB_IMAGE_BASE}${movieData.backdrop_path}` : null,
                    homepage: movieData.homepage,
                    status: movieData.status,
                    originalLanguage: movieData.original_language
                }
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to get movie details. Please check the movie ID.'
            });
        }
    }
});

// Popular Movies Tool
export const popularMoviesTool = new DynamicStructuredTool({
    name: "get_popular_movies",
    description: "Get currently popular movies. Use this when users ask about trending movies, what's popular now, or what movies are hot right now.",
    schema: z.object({
        page: z.number().optional().default(1).describe("Page number (default: 1)")
    }),
    func: async ({ page }) => {
        try {
            console.log(`Getting popular movies (page ${page})`);
            
            const data = await tmdbRequest('/movie/popular', {
                language: 'en-US',
                page: page
            });

            const movies = data.results.slice(0, 10).map(formatMovie);

            return JSON.stringify({
                success: true,
                category: 'Popular Movies',
                page: data.page,
                totalPages: data.total_pages,
                movies: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to get popular movies.'
            });
        }
    }
});

// Top Rated Movies Tool
export const topRatedMoviesTool = new DynamicStructuredTool({
    name: "get_top_rated_movies",
    description: "Get top rated movies of all time. Use this when users ask about best movies, highest rated movies, or all-time classics.",
    schema: z.object({
        page: z.number().optional().default(1).describe("Page number (default: 1)")
    }),
    func: async ({ page }) => {
        try {
            console.log(`Getting top rated movies (page ${page})`);
            
            const data = await tmdbRequest('/movie/top_rated', {
                language: 'en-US',
                page: page
            });

            const movies = data.results.slice(0, 10).map(formatMovie);

            return JSON.stringify({
                success: true,
                category: 'Top Rated Movies',
                page: data.page,
                totalPages: data.total_pages,
                movies: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to get top rated movies.'
            });
        }
    }
});

// Trending Movies Tool
export const trendingMoviesTool = new DynamicStructuredTool({
    name: "get_trending_movies",
    description: "Get trending movies today or this week. Use this when users ask about what's trending, hot movies this week, or current movie trends.",
    schema: z.object({
        timeWindow: z.enum(['day', 'week']).default('week').describe("Time window: 'day' or 'week'")
    }),
    func: async ({ timeWindow }) => {
        try {
            console.log(`Getting trending movies (${timeWindow})`);
            
            const data = await tmdbRequest(`/trending/movie/${timeWindow}`, {
                language: 'en-US'
            });

            const movies = data.results.slice(0, 10).map(formatMovie);

            return JSON.stringify({
                success: true,
                category: `Trending Movies (${timeWindow})`,
                movies: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to get trending movies.'
            });
        }
    }
});

// Movie Recommendations Tool
export const movieRecommendationsTool = new DynamicStructuredTool({
    name: "get_movie_recommendations",
    description: "Get movie recommendations based on a specific movie. Use this when users ask for similar movies or movies like a particular film. Requires TMDB movie ID.",
    schema: z.object({
        movieId: z.number().describe("TMDB movie ID to get recommendations from")
    }),
    func: async ({ movieId }) => {
        try {
            console.log(`Getting recommendations for movie ID: ${movieId}`);
            
            const data = await tmdbRequest(`/movie/${movieId}/recommendations`, {
                language: 'en-US',
                page: 1
            });

            if (!data.results || data.results.length === 0) {
                return JSON.stringify({
                    success: false,
                    message: 'No recommendations found for this movie.'
                });
            }

            const movies = data.results.slice(0, 10).map(formatMovie);

            return JSON.stringify({
                success: true,
                basedOn: `Movie ID ${movieId}`,
                recommendations: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to get movie recommendations.'
            });
        }
    }
});

// Search Movies by Genre Tool
export const moviesByGenreTool = new DynamicStructuredTool({
    name: "discover_movies_by_genre",
    description: "Discover movies by genre. Use this when users ask for movies of a specific genre like action, comedy, horror, etc. Genre IDs: Action=28, Comedy=35, Drama=18, Horror=27, Romance=10749, Sci-Fi=878, Thriller=53, Animation=16.",
    schema: z.object({
        genreId: z.number().describe("Genre ID (Action=28, Comedy=35, Drama=18, Horror=27, Romance=10749, Sci-Fi=878, Thriller=53, Animation=16)"),
        sortBy: z.enum(['popularity.desc', 'vote_average.desc', 'release_date.desc']).default('popularity.desc').describe("Sort by popularity, rating, or release date")
    }),
    func: async ({ genreId, sortBy }) => {
        try {
            console.log(`Discovering movies for genre ID: ${genreId}`);
            
            const genreNames = {
                28: 'Action', 35: 'Comedy', 18: 'Drama', 27: 'Horror',
                10749: 'Romance', 878: 'Science Fiction', 53: 'Thriller', 16: 'Animation'
            };

            const data = await tmdbRequest('/discover/movie', {
                with_genres: genreId,
                sort_by: sortBy,
                include_adult: false,
                language: 'en-US',
                page: 1
            });

            const movies = data.results.slice(0, 10).map(formatMovie);

            return JSON.stringify({
                success: true,
                genre: genreNames[genreId] || `Genre ${genreId}`,
                sortedBy: sortBy,
                movies: movies
            }, null, 2);
        } catch (error) {
            return JSON.stringify({
                success: false,
                error: 'Failed to discover movies by genre.'
            });
        }
    }
});

// Export all TMDB tools
export const tmdbTools = [
    movieSearchTool,
    movieDetailsTool,
    popularMoviesTool,
    topRatedMoviesTool,
    trendingMoviesTool,
    movieRecommendationsTool,
    moviesByGenreTool
];
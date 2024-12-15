import "./scss/style.scss";
import { MovieListType, globalConfig, apiConfig, MovieListLayout } from "./config/config";
import { getMovieListUrl } from "./utils/api.utils";
import { fetchMoviesData } from "./utils/api.utils";

// Contenedor principal donde irá la barra de navegación
const navBarContainer = document.createElement('div');
navBarContainer.classList.add('navbar');

// Crea el botón para alternar entre vistas
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Cambiar a Lista';
toggleButton.classList.add('navbar-toggle-btn');

// Crea el select para filtros
const filterSelect = document.createElement('select');
filterSelect.classList.add('navbar-select');

// Opciones del select
const filterOptions = [
  { value: 'top_rated', text: 'Valoración' },
  { value: 'now_playing', text: 'En cartelera' },
  { value: 'popular', text: 'Popular' },
  { value: 'upcoming', text: 'Próximamente' }
];

// Agrega las opciones al select
filterOptions.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.text;
    filterSelect.appendChild(opt);
});

// Agrega un evento para capturar el cambio en el filtro
filterSelect.addEventListener('change', (event) => {
    const selectedFilter = event.target.value;
    console.log(`Filtro seleccionado: ${selectedFilter}`);
    getMoviesByFilter(selectedFilter);
});

// Agrega los elementos al contenedor de la barra de navegación
navBarContainer.appendChild(toggleButton); 
navBarContainer.appendChild(filterSelect); 
document.body.prepend(navBarContainer);

// Función para obtener las películas según el filtro seleccionado
function getMoviesByFilter(filter) {
  const filters = ['popular', 'top_rated', 'now_playing', 'upcoming'];

  if (!filters.includes(filter)) {
    console.error('Filtro no reconocido');
    return;
  }

  const url = `${apiConfig.baseUrl}movie/${filter}?api_key=${apiConfig.apiKey}&language=${apiConfig.langIso}`;

  fetchMoviesData(url)
    .then(data => {
      addMovieListElement(data.results);
    })
    .catch(error => {
      console.error('Error al obtener las películas:', error);
    });
}

// Función para alternar entre vistas
toggleButton.addEventListener('click', () => {
  const movieListContainer = document.getElementById('app'); 
  if (movieListContainer.classList.contains('grid-view')) {
      movieListContainer.classList.remove('grid-view');
      movieListContainer.classList.add('list-view');
      toggleButton.textContent = 'Cambiar a Cuadrícula'; 
  } else {
      movieListContainer.classList.remove('list-view');
      movieListContainer.classList.add('grid-view');
      toggleButton.textContent = 'Cambiar a Lista'; 
  }
});

// Función que crea los elementos para mostrar las películas
function addMovieListElement(movies) {
  const movieListContainer = document.getElementById('app');
  movieListContainer.innerHTML = ''; 

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const title = document.createElement('h2');
    title.textContent = movie.title;

    const description = document.createElement('p');
    description.textContent = movie.overview;

    const img = document.createElement('img');
    img.classList.add('cuadrado');
    img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const rating = document.createElement('p');
    rating.classList.add('category-rating');
    rating.textContent = `Rating: ${movie.vote_average}`;

    const releaseYear = document.createElement('p');
    releaseYear.textContent = `Año: ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}`;

    movieCard.appendChild(img);
    movieCard.appendChild(title);
    movieCard.appendChild(description);
    movieCard.appendChild(rating);
    movieCard.appendChild(releaseYear);

    movieCard.addEventListener('click', () => {
      showMovieDetails(movie.id);
    });

    movieListContainer.appendChild(movieCard);
  });
}

// Función para obtener detalles de una película
async function showMovieDetails(movieId) {
  const url = `${apiConfig.baseUrl}movie/${movieId}?api_key=${apiConfig.apiKey}&language=${apiConfig.langIso}`;
  
  try {
    const movie = await fetchMoviesData(url);
    renderMovieDetails(movie);
  } catch (error) {
    console.error('Error al obtener detalles de la película:', error);
  }
}

// Función para renderizar la vista de detalles
function renderMovieDetails(movie) {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = ''; 

  toggleButton.style.display = 'none';

  const detailContainer = document.createElement('div');
  detailContainer.classList.add('movie-details');

  const backButtonContainer = document.createElement('div');
  backButtonContainer.classList.add('back-button-container');
  
  const backButton = document.createElement('button');
  backButton.textContent = 'Volver atrás';
  backButton.classList.add('back-button');
  backButton.addEventListener('click', () => {
    getMoviesByFilter('popular'); 

    toggleButton.style.display = 'block';

    backButtonContainer.remove();
  });

  backButtonContainer.appendChild(backButton);
  navBarContainer.prepend(backButtonContainer);

  const poster = document.createElement('img');
  poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
  poster.alt = movie.title;
  poster.classList.add('movie-poster');

  const title = document.createElement('h1');
  title.textContent = movie.title;

  const rating = document.createElement('p');
  rating.textContent = `Valoración: ${movie.vote_average}`;

  const releaseYear = document.createElement('p');
  releaseYear.textContent = `Año: ${new Date(movie.release_date).getFullYear()}`;

  const synopsisHeader = document.createElement('h3');
  synopsisHeader.textContent = 'Sinopsis:';

  const synopsis = document.createElement('p');
  synopsis.textContent = movie.overview;

  detailContainer.appendChild(poster);
  detailContainer.appendChild(title);
  detailContainer.appendChild(rating);
  detailContainer.appendChild(releaseYear);
  detailContainer.appendChild(synopsisHeader);
  detailContainer.appendChild(synopsis);

  appContainer.appendChild(detailContainer);
}

// Llama a la función inicial para cargar películas populares
getMoviesByFilter('popular');

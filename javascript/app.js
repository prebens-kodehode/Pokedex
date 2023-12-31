import { getData } from "./data/api.js";
import {
  cardWrapper,
  searchInput,
  pageIndex,
  previousPage,
  nextPage,
  pageButtons,
} from "./htmlElements.js";
import { renderPokemonList } from "./pages/pokemonList.js";
import {
  cardsFadeOut,
  loadingAnimation,
  updateClasses,
} from "./utils/functions.js";

// API constants:
const pokemonsUrl = "https://pokeapi.co/api/v2/pokemon/?offset=0&limit=649";
const itemsPerPage = 20;
let pokemonDetailsData = []; // array to store details of all pokemon
let currentPage = 1;
let totalPages = "";

// fetches all pokemon details and stores them in an array
async function fetchAllPokemonDetails() {
  try {
    const data = await getData(pokemonsUrl);
    const detailsPromises = data.results.map((pokemon) => getData(pokemon.url));
    pokemonDetailsData = await Promise.all(detailsPromises);
    totalPages = Math.ceil(pokemonDetailsData.length / itemsPerPage);
  } catch (error) {
    console.error("Error fetching all Pokémon details:", error);
  }
}

// renders the list of pokemon cards based on the current page
async function renderPokemonCards(startIndex, endIndex) {
  await cardsFadeOut();
  cardWrapper.innerHTML = "";

  for (let i = startIndex; i < endIndex && i < pokemonDetailsData.length; i++) {
    renderPokemonList(pokemonDetailsData[i]);
  }
}

// handles page navigation
function handlePage(page) {
  currentPage = Math.min(Math.max(1, page), totalPages);
  pageIndex.textContent = `${currentPage}/${totalPages}`;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  previousPage.classList.remove("disabled");
  nextPage.classList.remove("disabled");
  currentPage === 1
    ? previousPage.classList.add("disabled")
    : currentPage === totalPages && nextPage.classList.add("disabled");
  renderPokemonCards(startIndex, endIndex);
}

// renders search results or a message if none found
async function renderSearchResults(results) {
  await cardsFadeOut();
  cardWrapper.innerHTML = "";

  if (results && results.length > 0) {
    results.forEach((details) => {
      renderPokemonList(details);
    });
  } else {
    cardWrapper.innerHTML = "<h2>No Pokémon matches your search...</h2>";
  }
}

// toggles visibility of page buttons if a search term is entered or not
function updateIndexVisibility(searchTerm) {
  if (searchTerm.length > 0) {
    pageButtons.classList.add("hidden");
  } else {
    pageButtons.classList.remove("hidden");
  }
}

let searchTimeout;

// handle search input and filter results
function handleSearch() {
  //debouncing to avoid constantly rendering new cards as you type
  clearTimeout(searchTimeout);
  const searchTerm = searchInput.value.toLowerCase();

  updateIndexVisibility(searchTerm);

  if (searchTerm.length > 0) {
    searchTimeout = setTimeout(() => {
      const searchResults = pokemonDetailsData.filter((details) =>
        details.name.includes(searchTerm)
      );
      renderSearchResults(searchResults);
    }, 350);
  } else {
    handlePage(currentPage);
  }
}

//page navigation
previousPage.addEventListener("click", () => {
  if (currentPage > 1) {
    handlePage(currentPage - 1);
  }
});
nextPage.addEventListener("click", () => {
  if (currentPage < totalPages) {
    handlePage(currentPage + 1);
  }
});

searchInput.addEventListener("input", handleSearch);

// fetch initial data and render first page
async function initializeApp() {
  await fetchAllPokemonDetails();
  handlePage(1);
}

loadingAnimation();

initializeApp();

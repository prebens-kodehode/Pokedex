import { modal, modalContainer } from "../htmlElements.js";
import {
  fetchAbilityDetails,
  makeElement,
  updateClasses,
  delay,
} from "../utils/functions.js";
import { typeGradients } from "../data/data.js";
import { tiltEventListeners } from "../utils/cardTilt.js";

// adds event listener to a card to show pokemon details on click
export function detailsEventListeners(card, pokemon) {
  card.addEventListener("click", () => {
    renderPokemonDetails(pokemon);
    updateClasses(modalContainer, ["fade-in"], ["fade-out"]);
    updateClasses(modal, ["modal-visible"], ["modal-fade-out", "modal-hidden"]);
  });
}

// handle modal click to close and hide pokemon details
modal.addEventListener("click", async () => {
  updateClasses(modalContainer, ["fade-out"], ["fade-in"]);
  modal.classList.add("modal-fade-out");

  await delay(1000);
  updateClasses(modal, ["modal-hidden"], ["modal-visible"]);
});

tiltEventListeners(modalContainer);

// render the detailed information of a pokemon in a modal
export async function renderPokemonDetails(pokemon) {
  modalContainer.style.background =
    typeGradients[pokemon.types[0].type.name].card;

  // create title element for pokemon
  const pokemonTitleContainer = makeElement("div", {
    className: "modal-title-container",
  });
  const pokemonTitle = makeElement("h1", {
    textContent: pokemon.name,
    className: "modal-title",
  });
  pokemonTitleContainer.append(pokemonTitle);

  // create and style image container for pokemon sprite
  const imageContainer = makeElement("div", {
    className: "modal-image-container",
  });
  imageContainer.style.background =
    typeGradients[pokemon.types[0].type.name].image;

  const image = makeElement("img", {
    src: pokemon.sprites.other.dream_world.front_default,
    className: "modal-image",
    alt: `${pokemon.name}`,
  });

  imageContainer.append(image);

  // create container for size details (height and weight)
  const sizeContainer = makeElement("div", {
    className: "modal-size-container",
  });
  const height = makeElement("p", { textContent: `Height: ${pokemon.height}` });
  const weight = makeElement("p", { textContent: `Weight: ${pokemon.weight}` });
  const pokemonNumber = makeElement("p", {
    className: "pokemon-number",
    textContent: `# ${pokemon.id}`,
  });
  sizeContainer.append(height, pokemonNumber, weight);

  // create container for type details
  const typeContainer = makeElement("div", { className: "type-container" });
  const typeTitle = makeElement("h2", { textContent: "Type" });

  const pokemonTypes = pokemon.types.map(({ type }) => {
    const container = makeElement();
    const typeName = makeElement("h3", {
      textContent: type.name,
      className: "type",
    });
    typeName.style.background = typeGradients[type.name].solidColor;
    container.append(typeName);

    return container;
  });

  typeContainer.append(typeTitle, ...pokemonTypes);

  // create container for pokemon base stats
  const statsContainer = makeElement("div", {
    className: "modal-stats-container",
  });
  const statsTitle = makeElement("h3", { textContent: "Base Stats" });

  const pokemonDetails = pokemon.stats.map(({ base_stat, stat }) => {
    const container = makeElement();
    const statName = makeElement("p", {
      textContent: stat.name,
      className: "stat-name",
    });
    const statValue = makeElement("p", {
      textContent: base_stat,
      className: "base-stat",
    });
    container.append(statName, statValue);

    return container;
  });

  statsContainer.append(statsTitle, ...pokemonDetails);

  // create container for ability details
  const abilityContainer = makeElement("div", {
    className: "ability-container",
  });

  const abilitiesTitle = makeElement("h1", { textContent: "Abilities" });
  // fetch and append ability details
  try {
    const abilitiesDetails = await fetchAbilityDetails(pokemon);

    const abilitiesElements = abilitiesDetails.map(({ name, short_effect }) => {
      const abilityDiv = makeElement();
      const abilityName = makeElement("h2", { textContent: name });
      const abilityEffect = makeElement("p", { textContent: short_effect });
      abilityDiv.append(abilityName, abilityEffect);
      return abilityDiv;
    });

    abilityContainer.append(abilitiesTitle, ...abilitiesElements);
  } catch (error) {
    console.error("Error rendering ability details:", error);
  }

  // wrapper for all information elements
  const infoWrapper = makeElement("div", {
    className: "info-wrapper",
  });
  infoWrapper.append(
    sizeContainer,
    typeContainer,
    statsContainer,
    abilityContainer
  );
  // refresh modal container and append new details
  modalContainer.innerHTML = "";

  modalContainer.append(pokemonTitleContainer, imageContainer, infoWrapper);
}

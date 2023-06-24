const pokemonData = require('../data/pokemon.json');

const pokemonService = {
    getAllPokemon: () => {
        return pokemonData;
    },

    getPokemonByType: (pokemonType) => {
        const data = pokemonData.filter(pokemon => pokemon.type.includes(pokemonType));
        return data;

    },

    getPokemonByTypeAndRoute: (filteredPokemon, pokemonType) => {
        const data = filteredPokemon.filter(pokemon => pokemon.type.includes(pokemonType));
        return data;
    },

    getPokemonByWillTrade: () => {
        const data = pokemonData.filter(pokemon => pokemon.willTrade === true);
        return data;
    },

    getPokemonByWillSell: (sell) => {
        const data = pokemonData.filter(pokemon => pokemon.price != null);
        return data;
    }

};

module.exports = pokemonService;
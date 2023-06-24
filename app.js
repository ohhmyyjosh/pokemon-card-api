// Student Name: Joshua Patterson

const express = require('express');
const { getPokemonByType } = require('./lib/PokemonService');
const pokemonService = require('./lib/PokemonService');
let app = express();

let handlebars = require('express-handlebars')
	.create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	if(req.query.type){
		req.pokemon = pokemonService.getPokemonByType(req.query.type);
	} else {
		req.pokemon = pokemonService.getAllPokemon();
	}

	next();
});

app.get('/', function(req, res) {
	const pokemon = pokemonService.getAllPokemon();
		res.render('home', {
		pokemon: req.pokemon
	});
});

app.get('/api/cards', function (req, res) {
	const pokemon = pokemonService.getAllPokemon();
	if (req.query.type){
		res.json(pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type));
	}
	else {
		res.json(pokemon);
	}
});

app.get('/api/cards/trade', (req, res) => {
	const pokemon = pokemonService.getPokemonByWillTrade();
	if (req.query.type){
		res.json(pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type));
	}
	else {
		res.json(pokemon);
	}
});

app.get('/api/cards/sell', (req, res) => {
	const pokemon = pokemonService.getPokemonByWillSell();
	if (req.query.type){
		req.pokemon = pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type);
	}
	else {
		req.pokemon = pokemon;
	}
	res.json(req.pokemon);
});

app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});

const express = require('express');
const User = require('../models/User');
let router = express.Router();
const pokemonService = require('../middleware/PokemonService');
const passport = require('passport');


router.get('/signup', (req, res) => {
	res.render('signup');
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.post('/signup', function(req, res) {
	User.register(new User({ username : req.body.username, email: req.body.email }), req.body.password, function(err, user) {
	  if (err) {
		console.error(err);
		return res.redirect('/signup');
	  }
  
	  passport.authenticate('local')(req, res, function () {
		res.redirect('/');
	  });
	});
  });
   

router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	successFlash: 'Welcome!',
	failureRedirect: '/login',
	failureFlash: 'Invalid username or password.',
}));

router.get('/logout', function (req, res) {
    req.logout(() => {
        res.redirect('/login');
    });
});

router.post('/logout', function(req, res){
    req.logout(() => {
        res.redirect('/');
    });
});

router.get('/', function(req, res) {
	if(req.isAuthenticated()){
	  res.render('home', { currentUser: req.user.toObject(), cards: req.user.pokemonCollection });
	} else {
	  res.render('home', { currentUser: null });
	}
});

router.get('/api/cards', function (req, res) {
	res.json(req.user.pokemonCollection);
});
  
router.post('/api/cards', function (req, res) {
	req.user.pokemonCollection.push(req.body);
	req.user.save(function (err) {
		if (err) return res.status(500).send(err);
		return res.status(200).send('Saved successfully');
	});
});

router.get('/api/cards/trade', (req, res) => {
	const pokemon = pokemonService.getPokemonByWillTrade();
	if (req.query.type){
		res.json(pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type));
	}
	else {
		res.json(pokemon);
	}
});

router.get('/api/cards/sell', (req, res) => {
	const pokemon = pokemonService.getPokemonByWillSell();
	if (req.query.type){
		req.pokemon = pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type);
	}
	else {
		req.pokemon = pokemon;
	}
	res.json(req.pokemon);
});

module.exports = router;

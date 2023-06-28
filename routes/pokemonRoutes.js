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
	User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function(err, user) {
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

router.get('/', async function(req, res) {
    if (req.isAuthenticated()) {
        try {
            let user = await User.findOne({ username: req.user.username }).lean();
            user.pokemonCollection = user.pokemonCollection.map(card => ({...card, owner: user.username}));
            const showCollectionHeading = true;
            res.render('home', { currentUser: user, cards: user.pokemonCollection, showCollectionHeading });
        } catch (err) {
            console.log(err);
            return res.render('home', { currentUser: null, cards: [], showCollectionHeading });
        }
    } else {
        res.render('home', { currentUser: null, cards: [], showCollectionHeading: false });
    }
});



router.get('/my-collection', async function(req, res) {
    if (req.isAuthenticated()) {
        try {
            let user = await User.findOne({ username: req.user.username }).lean();
            user.pokemonCollection = user.pokemonCollection.map(card => ({...card, owner: user.username}));
            const showCollectionHeading = true;
            res.render('home', { currentUser: user, cards: user.pokemonCollection, showCollectionHeading });
        } catch (err) {
            console.log(err);
            return res.render('home', { currentUser: null, showCollectionHeading: false });
        }
    } else {
        res.redirect('/login');
    }
});



router.get('/all-cards', async function(req, res) {
    if (req.isAuthenticated()) {
        try {
			const currentUser = await User.findOne({ username: req.user.username }).lean();
            const users = await User.find({ _id: { $ne: req.user._id } }).lean();
            let allCards = users.reduce((cards, user) => {
                let userCards = user.pokemonCollection.map(card => ({...card, owner: user.username}));
                return cards.concat(userCards);
            }, []);
            res.render('home', { currentUser:  currentUser, cards: allCards, isAllCardsRoute: true });
        } catch (err) {
            console.log(err);
            return res.render('home', { currentUser: null, isAllCardsRoute: true });
        }
    } else {
        res.redirect('/login');
    }
});

router.get('/user-cards', async function(req, res) {
    const username = req.query.user;
    if (username) {
        try {
            const user = await User.findOne({ username: username }).lean();
            console.log('User:', user);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (!user.pokemonCollection || user.pokemonCollection.length == 0) {
                return res.status(404).json({ error: 'No cards found for this user' });
            }
            user.pokemonCollection = user.pokemonCollection.map(card => ({...card, owner: user.username}));
            res.render('home', { currentUser: req.user, cards: user.pokemonCollection });
        } catch (err) {
            console.log(err); 
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.redirect('/');
    }
});

router.get('/api/cards', function (req, res) {
	if (req.isAuthenticated()) {
		User.find({ _id: { $ne: req.user._id } }, 'pokemonCollection')
			.populate('pokemonCollection')
			.exec(function(err, users) {
				if (err) {
					return res.status(500).json({ error: 'Internal server error' });
				}
				const allCards = users.reduce((cards, user) => cards.concat(user.pokemonCollection), []);
				res.json(allCards);
			});
	} else {
		res.status(401).json({ error: 'Unauthorized' });
	}
});

router.get('/api/cards/:username', function(req, res) {
	const username = req.params.username;
	User.findOne({ username: username }, 'pokemonCollection')
		.populate('pokemonCollection')
		.exec(function(err, user) {
			if (err) {
				return res.status(500).json({ error: 'Internal server error' });
			}
			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}
			res.json(user.pokemonCollection);
		});
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
	if (req.query.type) {
		res.json(pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type));
	} else {
		res.json(pokemon);
	}
});

router.get('/api/cards/sell', (req, res) => {
	const pokemon = pokemonService.getPokemonByWillSell();
	if (req.query.type) {
		req.pokemon = pokemonService.getPokemonByTypeAndRoute(pokemon, req.query.type);
	} else {
		req.pokemon = pokemon;
	}
	res.json(req.pokemon);
});

module.exports = router;

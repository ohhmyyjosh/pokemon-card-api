const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { cookieSecret } = require('./credentials.js');
const User = require('./models/User');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const credentials = require('./credentials.js');
require('./db.js');
const pokemonService = require('./middleware/PokemonService');
const pokemonRoutes = require('./routes/pokemonRoutes');

const app = express();

passport.use(new LocalStrategy({ usernameField: 'username' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('handlebars', handlebars.create({
  defaultLayout: 'main',
  helpers: {
    getSpriteUrlByName: pokemonService.getSpriteUrlByName,
    getSpriteUrlById: pokemonService.getSpriteUrlById
  }
}).engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

app.use('/api', pokemonRoutes);
app.use(pokemonRoutes);

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.' );
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

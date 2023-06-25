const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  pokemonCollection: [{
    id: Number,
    name: String,
    type: [String],
    hp: Number,
    willTrade: Boolean,
    price: Number
  }],
});

UserSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

module.exports = mongoose.model('User', UserSchema);

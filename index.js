// ### Libraries and globals
var config = require('./config.js');
var Twit = require('twit');
var T = new Twit(config);
var nato = require('./nato.json');

// ### Utility Functions

var logger = function(msg) {
  // console.log('logging?: ' + config.log);
  if (config.log) console.log(msg);
};

// adding to array.prototype caused issues with nlp_compromise
// not used here, but hey, good practice anyway.
var pick = function(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
};

var pickRemove = function(arr) {
  var index = Math.floor(Math.random()*arr.length);
  return arr.splice(index,1)[0];
};


var getRandom = function(min,max) {
  return (min != undefined && max != undefined
          ? Math.floor(Math.random() * (max - min) + min)
          : Math.random()
          );
};

// return true or false
// 50-50 chance (unless override)
var coinflip = function(chance) {
  if (!chance) { chance = 0.5; }
  return (Math.random() < chance);
};

var isFirstLetterUpperCase = function(str) {
  return (str.charAt(0).toUpperCase() == str.charAt(0));
};


var direction = {
  forward: 0,
  reverse: 1
};

var capitalize = function(phrase) {

  var cphrase = [];
  var splits = phrase.split(' ');
  for (var i = 0; i < splits.length; i++) {
    cphrase.push(capitalizeWord(splits[i]));
  }

  return cphrase.join(' ');

};

var capitalizeWord = function(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

var getSentence = function() {
  var sentence = natocize(getNumbers());
  if (getRandom() < 0.02) {
    var adder = (coinflip() ? 'AFFIRMATIVE' : 'NEGATIVE');
    if (getRandom() < 0.1) {
      sentence = adder + ' ' + sentence;
    } else {
      sentence += ' ' + adder;
    }
  }
  return sentence;
};

var getNumbers = function(chars) {

  chars = chars || getRandom(2,15);

  return Math.random().toString(36).substr(2, chars);

};

var natocize = function(text) {

  var phon = [];
  var chars = text.toUpperCase().split('');

  for (var i = 0; i < chars.length; i++) {
    phon.push(nato[chars[i]]);
  }

  return phon.join(' ');

};


var tweeter = function(texts) {

  var newSentence = '';

  try {

    while (newSentence.length === 0 || newSentence.length > 140) {
      newSentence = getSentence();
    }

    console.log(newSentence);

    if(!newSentence) {
      logger('NOTHING NOTHING NOTHING');
    }
  } catch (err) {
    console.log('Error: ' + err.message);
  }

  if (newSentence.length === 0 || newSentence.length > 140) {
    tweeter();
  } else {
    if (config.tweet_on) {
      T.post('statuses/update', { status: newSentence }, function(err, reply) {
	if (err) {
	  console.log('error:', err);
	}
	else {
          // nothing on success
	}
      });
    }
  }

};


// Tweets ever n minutes
// set config.seconds to 60 for a complete minute
setInterval(function () {
  try {
    tweeter();
  }
  catch (e) {
    console.log(e);
  }
}, 1000 * config.minutes * config.seconds);

// Tweets once on initialization.
tweeter();

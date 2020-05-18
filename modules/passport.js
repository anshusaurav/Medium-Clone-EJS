var passport = require("passport");
var GitHubStrategy = require('passport-github').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require("../models/user");
passport.use(new GitHubStrategy({
    clientID: process.env.Github_Client_ID,
    clientSecret: process.env.Github_Client_Secret ,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOne({ email: profile.emails[0].value }, function (err, user) {
      if(err)
        return cb(err);
      if(!user){
        console.log('User not found. Creating new');
        let newUser = {email: profile.emails[0].value, name: profile.displayName, password:"password", github_oauth: profile._json.id}; 
        User.create(newUser, (err, user) =>{
          console.log('User created');
          if(err)
            return cb(err);
          return cb(null, user);

        });
      }
      else
        return cb(null, user);
      
    }); 
  }
));
passport.use(new FacebookStrategy({
  clientID: process.env.Facebook_Client_ID,
  clientSecret: process.env.Facebook_Client_Secret ,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, cb) {
  // console.log(profile);
  User.findOne({fb_oauth: profile._json.id }, function (err, user) {
    if(err)
      return cb(err);
    if(!user){
      console.log('User not found. Creating new');
      let newUser = {fb_oauth: profile._json.id, name: profile._json.name, password:"password"}; 
      User.create(newUser, (err, user) =>{
        console.log('User created');
        if(err)
          return cb(err);
        return cb(null, user);

      });
    }
    else
      return cb(null, user);
    
  }); 
}
));

var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.Google_Client_ID,
    clientSecret: process.env.Google_Client_Secret,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOne({ email: profile.emails[0].value }, function (err, user) {
      if(err)
        return cb(err);
      if(!user){
        console.log('User not found. Creating new');
        let newUser = {email: profile.emails[0].value, name: profile.displayName, password:"password", google_oauth: profile.id}; 
        User.create(newUser, (err, user) =>{
          console.log('User created');
          if(err)
            return cb(err);
          return cb(null, user);

        });
      }
      else
        return cb(null, user);
      
    });
  }
));


passport.serializeUser((user, cb) => {
  // console.log(user);
  cb(null, user.id)
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if(err)
      cb(err);
    cb(null, user);
  });
});
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
    // console.log(profile);
    User.findOne({ email: profile.emails[0].value }, function (err, user) {
      if(err)
        return cb(err);
      if(!user){
        // console.log('User not found. Creating new');
        let newUser = {
          email: profile.emails[0].value, 
          name: profile.displayName, 
          password:"password", 
          github_oauth: profile._json.id, 
          github_profile: {
            id: profile._json.id, 
            photo: profile._json.avatar_url, 
            profile: profile._json.html_url
          }
        }; 
        User.create(newUser, (err, user) =>{
          // console.log('User created');
          if(err)
            return cb(err);
          return cb(null, user);

        });
      }
      else{
        // console.log('hereI am ');
        github_profile = {
            id: profile._json.id, 
            photo: profile._json.avatar_url, 
            profile: profile._json.html_url
        }
        User.findOneAndUpdate(
          {
            email : profile.emails[0].value
          },
          { 
            $set : { 
              github_profile: github_profile,
              github_oauth: profile._json.id
            }
          },
          (err, updatedUser) => {
            // console.log(updatedUser);
            if(err)
              return cb(err);
            return cb(null, updatedUser);
          }

        ) 
      }
      
    }); 
  }
));
passport.use(new FacebookStrategy({
  clientID: process.env.Facebook_Client_ID,
  clientSecret: process.env.Facebook_Client_Secret ,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: [
    'id',
    'email',
    'gender',
    'profileUrl',
    'displayName',
    'locale',
    'name',
    'timezone',
    'updated_time',
    'verified',
    'picture.type(large)',
  ],
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);
    User.findOne({ email: profile._json.email }, function (err, user) {
      if(err)
        return cb(err);
      if(!user){
        console.log('User not found. Creating new');
        let newUser = {
          email: profile._json.email, 
          name: profile._json.name, 
          password:"password", 
          fb_oauth: profile._json.id ||'', 
          fb_profile: {
            id: profile._json.id ||'', 
            picture: profile.photos[0].data ||'', 
          }
        }; 
        User.create(newUser, (err, user) =>{
          console.log('User created');
          if(err)
            return cb(err);
          return cb(null, user);

        });
      }
      else{
        console.log('here I am ');
        fb_profile = {
          id: profile._json.id ||'', 
          picture: profile.photos[0].data ||'', 
        }
        console.log(fb_profile);
        User.findOneAndUpdate(
          {
            email : profile._json.email
          },
          { 
            $set : { 
              fb_profile: fb_profile,
              fb_oauth: profile._json.id
            }
          },
          (err, updatedUser) => {
            console.log(updatedUser);
            if(err)
              return cb(err);
            return cb(null, updatedUser);
          }

        ) 
      }
      
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
        let newUser = {
          email: profile._json.email, 
          name: profile._json.name, 
          password:"password", 
          google_oauth: profile._json.sub, 
          google_profile: {
            sub: profile._json.sub, 
            picture: profile._json.picture, 
            
          }
        }; 
        User.create(newUser, (err, user) =>{
          console.log('User created');
          if(err)
            return cb(err);
          return cb(null, user);

        });
      }
      else{
        console.log('hereI am ');
        google_profile = {
          sub: profile._json.sub, 
          picture: profile._json.picture, 
        }
        User.findOneAndUpdate(
          {
            email : profile.emails[0].value
          },
          { 
            $set : { 
              google_profile: google_profile,
              google_oauth: profile._json.sub
            }
          },
          (err, updatedUser) => {
            console.log(updatedUser);
            if(err)
              return cb(err);
            return cb(null, updatedUser);
          }

        ) 
      }
      
    }); 
  }
));


passport.serializeUser((user, cb) => {
  cb(null, user.id)
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if(err)
      cb(err);
    cb(null, user);
  });
});
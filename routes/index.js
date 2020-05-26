var express = require('express');
var passport = require('passport');
var router = express.Router();
var Article = require("../models/article");
var Tag = require("../models/tag");
var User = require("../models/user");
/* GET home page. */
router.get('/', function(req, res) {
  // console.log('HERE');
  // console.log(req.session);
  // Get an array of flash messages by passing the key to req.flash()
  Tag.find({}, (err, tags) =>{
    if(err)
        return next(err);
    if(req.session.userId){
      User.findById(req.session.userId, (err, user) => {
        if(err)
          return next(err);
        return res.render('index', {tags: tags, user: user, isUser: true});
      }) 
    }
    else
      return res.render('index', {tags: tags,isUser: false});
  });
});


router.get('/home', function(req, res, next){
  // console.log('HRERE');
  Article.find({})
        .populate('author')
        .exec((err, articles) =>{
        if(err)
            return next(err);
        if(req.session.userId){
            User.findById(req.session.userId)
            .exec((err, user) => {
                if(err)
                  return next(err);
                // console.log(user);
                articles.sort((a,b) => b.updatedAt - a.updatedAt);
                let followedArticles = articles.filter(elem =>{
                  return (user.following.includes(elem.author.id));
                  //user.tagsFollowed.filter(value => elem.tags.includes(value));
                });
                let feedSupport = [];
                let feedArticles = articles.filter(elem =>{
                  // console.log(elem.tags,  user.tagsFollowed.filter(value => elem.tags.includes(value)));
                  if(user.following.includes(elem.author.id)) { //||
                    feedSupport.push(`Since you follow ${elem.author.name}`);
                    return true;
                  }
                  else if((user.tagsFollowed.filter(value => elem.tags.includes(value)).length > 0)) {
                    feedSupport.push(`Since you follow ${user.tagsFollowed.filter(value => elem.tags.includes(value))[0]}`);
                    return true;
                  }
                  return false;
                });
                // console.log('feedarticles', feedArticles.length);
                var today = new Date();
                today.setDate(today.getDate() - 1);
                let todayArticles = articles.filter(elem =>{
                  // console.log(elem.updatedAt, isSameDay(today, new Date(elem.updatedAt)));
                  if(isSameDay(today, new Date(elem.updatedAt)))
                    return false;
                  return true;
                });
                // console.log('todayArticles', todayArticles.length);
                let weekArticles = articles.filter(elem =>{
                  console.log(elem.updatedAt, isLast7Days(elem));
                  if(isLast7Days(elem))
                    return true;
                  return false;
                });
                // console.log('weekArticles', weekArticles.length);
                Tag.find({}, (err, tags) =>{
                  if(err)
                    return next(err);
                  //sort tags by number of articles
                  // console.log(tags);
                  return res.render(
                    'home',
                    {
                      articles: articles, 
                      fArticles: followedArticles,
                      feedArticles,
                      feedSupport,      //For mention follow tag or author, author if both present
                      todayArticles,
                      weekArticles,
                      user, 
                      isUser: true, 
                      title: 'All Articles',
                      tags: tags
                    }
                  );
                })
                
            }) 
        }
        else{
            req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login');  
        } 
        
    });
});

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github',
  {failureRedirect:'/login'}), async(req, res) =>{
    // console.log('Sunny angry');
    if(req.session.userId){
      console.log('already user logged in');
      //check if req.session.passport.user is same as req.session.userId
      console.log(req.session.userId, req.session.passport.user);
      if(req.session.passport.user != req.session.userId) {
        let deletedUser = await User.findByIdAndDelete(req.session.passport.user);
        console.log(deletedUser);
        req.flash('Error', 'Email different please sign in to your github account');
        res.locals.message = req.flash();
        return res.redirect('/home');
      }
    }
    else{
      'No user logged in'
    }
    console.log(req.session.passport);
    req.session.userId = req.session.passport.user;
    return res.redirect('/home');
  })

router.get('/auth/facebook',
  passport.authenticate('facebook',{
    scope: ['public_profile', 'email']
  })
);

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  async function(req, res) {
    // Successful authentication, redirect home.
    // console.log('Sunny angry');
    if(req.session.userId){
      console.log('already user logged in');
      //check if req.session.passport.user is same as req.session.userId
      console.log(req.session.userId, req.session.passport.user);
      if(req.session.passport.user != req.session.userId) {
        let deletedUser = await User.findByIdAndDelete(req.session.passport.user);
        req.flash('Error', 'Email different please sign in to your github account');
        res.locals.message = req.flash();
        return res.redirect('/home');
      }
    }
    else{
      'No user logged in'
    }
    console.log(req.session.passport);
    req.session.userId = req.session.passport.user;
    return res.redirect('/home');
  });

router.get('/auth/google',
  passport.authenticate('google', { scope: ['openid email profile'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  async function(req, res) {
    if(req.session.userId){
      console.log('already user logged in');
      //check if req.session.passport.user is same as req.session.userId
      console.log(req.session.userId, req.session.passport.user);
      if(req.session.passport.user != req.session.userId) {
        let deletedUser = await User.findByIdAndDelete(req.session.passport.user);
        req.flash('Error', 'Email different please sign in to your github account');
        res.locals.message = req.flash();
        return res.redirect('/home');
      }
    }
    else{
      'No user logged in'
    }
    req.session.userId = req.session.passport.user;
    res.redirect('/home');
  });
  const isSameDay = (a, b) => {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate()=== b.getDate();
  }
  const isLast7Days = (a) => {
    var d = new Date();
    var now = new Date();
    var ts = d.getTime();
    var sevenDays = ts - (7 * 24 * 60 * 60 * 1000);
    return a.updatedAt >= sevenDays;
    
  }
module.exports = router;

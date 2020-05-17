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


router.get('/home', function(req, res){
  Article.find({})
        .populate('author')
        .exec((err, articles) =>{
        if(err)
            return next(err);
        if(req.session.userId){
            User.findById(req.session.userId, (err, user) => {
                if(err)
                    return next(err);
                articles.sort((a,b) => b.updatedAt - a.updatedAt);
                let followedArticles = articles.filter(elem =>{
                  return user.following.includes(elem.author.id);
                });
                console.log('HERE');
                console.log(followedArticles.length);
                return res.render('home', {articles: articles, fArticles: followedArticles, user: user, isUser: true, title: 'All Articles'});
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
  {failureRedirect:'/login'}), (req, res) =>{
    // console.log('Sunny angry');
    console.log(req.session.passport);
    req.session.userId = req.session.passport.user;
    return res.redirect('/articles');
  })

router.get('/auth/facebook',
passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log(req.session.passport);
    req.session.userId = req.session.passport.user;
    return res.redirect('/articles');
  });


module.exports = router;

var express = require('express');
var router = express.Router();
var Article = require("../models/article");
var Comment = require("../models/comment");
var User = require("../models/user");
var Tag = require("../models/tag");


router.get('/', function(req, res, next) {
    Tag.find({}, (err, tags) =>{
        if(err)
            return next(err);
        if(req.session.userId){
            User.findById(req.session.userId, (err, user) => {
                if(err)
                    return next(err);
                return res.render('allTags', {tags: tags, user: user, isUser: true});
            }) 
        }
        else{
            req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login');  
        }
        
    });
});

router.get('/:tagname', function(req, res, next){
    let tagname = req.params.tagname;
    console.log('HERE');
    if(req.session.userId){
        User.findById(req.session.userId, (err, user) => {
            if(err)
                return next(err);
            Article.find({tags: {$in:[tagname]}})
                .populate('author')
                .exec((err, articles) =>{
                    if(err)
                        return next(err);
                    return res.render('allArticle', {articles:articles, user: user, isUser: true, title: `Posts related to #${tagname}` });
            });
        });
    }
    else{
        req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login');  
    }
});
router.get('/:tagname/subscribe', async(req, res,next) =>{
    console.log('wsadasdhere');
    if(req.session.userId){
        try{
            var tag = await Tag.findOne({tagname: req.params.tagname});
            console.log(tagname, req.session.userId)
            var user = await User.findByIdAndUpdate(
                req.session.userId, {
                    $addtoset: {
                        tagsFollowed: tag.id
                    }
                },{new: true});
            console.log(user);
            res.redirect('/home');
        }
        catch(error){
            return next(error);
        }
    }
    else{
        req.flash('Error', 'Please login to continue')
            res.locals.message = req.flash();
            return res.render('login');  
    }
});

router.get('/:tagname/unsubscribe', async(req, res,next) =>{
    if(req.session.userId){
        try{
            var {tagname} = req.params.tagname;
            var tag = await Tag.findOne({tagname})
            var user = await User.findByIdAndUpdate(
                req.session.userId, {
                    $pull: {
                        tagsFollowed: tag.id
                    }
                },{new: true});
            res.redirect('/home');
        }
        catch(error){
            return next(error);
        }
    }
    else{
        req.flash('Error', 'Please login to continue')
        res.locals.message = req.flash();
        return res.render('login');  
    }
});
module.exports = router;
var express = require('express');
var router = express.Router();
var User = require("../models/user");
var Tag = require("../models/tag");
var multer  = require('multer')
var bcrypt = require("bcrypt");
var upload = multer({ dest: './public/data/uploads/' })
/* GET users listing. */
router.get('/', function(req, res, next) {

  if(req.session && req.session.userId) {
    req.flash('Success', 'Login successful')
      res.locals.message = req.flash();
    res.render('users');
  }
  else {
    req.flash('Error', 'Please log in')
    res.locals.message = req.flash();
    return res.render('login');
  }
});

router.get('/register', function(req, res, next){
  res.render('register');
});

router.post('/register', async function(req, res, next){
  console.log(req.body);
  
  User.findOne({email: req.body.email}, (err, foundUser) =>{
    if(err)
      return next(err);
    if(foundUser){
      req.flash('Error', 'Email already registered');
      res.locals.message = req.flash();
      return res.render('register');
    }
    else{
      if(req.body.tags) {
        var tagArr = req.body.tags.split(', ');
        console.log(tagArr);
        var arr = [];
        req.body.tagsFollowed = tagArr;
      }
      // req.body.tags =  
      User.create(req.body, (err, createdUser) => {
        if(err)
          return next(err);
        // console.log(createdUser, 'after save');
        req.flash('Success', 'Registeration successful')
        res.locals.message = req.flash();
        return res.redirect('login');
      });
    }
  })
  

})


router.get('/login', function(req, res, next){
  res.render('login');
});

router.post('/login', async function(req, res, next){
  console.log(req.body);
  var {email, password} = req.body;
  let user = await User.findOne({email});
  if(!user) {
    req.flash('Error', 'Email is not registered, please register')
    res.locals.message = req.flash();
      return res.render('login');
  }
  else{
    const match = await user.verifyPassword(password);
    if(match) {
      console.log('Login Successful')
      req.session.userId = user.id;
      return res.redirect('/home');
    }
    else{
      // console.log('Error', 'Invalid password. Please try again');
      req.flash('Error', 'Invalid password. Please try again')
      res.locals.message = req.flash();
      return res.render('login');
    }
  }
    
})

router.get('/logout', function(req, res, next) {
  if(req.session.userId){
    req.session.destroy(function (err) {
      res.redirect('/'); //Inside a callback… bulletproof!
    });
  }
  //delete req.session.userId;
  //res.clearCookie('connect-sid');
  res.redirect('/');
});

//View User Profile
router.get('/:id', function(req, res, next) {
  // console.log('HERE');
  let id  = req.params.id;
  if(req.session.userId){
    User.findById(id)
        .populate('articles')
        .exec((err, visitor) => {
          if(err)
            return next(err);
          User.findById(req.session.userId, (err, user) =>{
            if(err)
              return next(err);
            return res.render('userProfile', {visitor: visitor,user: user, isUser: true});
          });
        });
    
  }
  else{
    req.flash('Error', 'Please login to continue')
    res.locals.message = req.flash();
    return res.render('login')
  }
});


//Follow User
router.get('/:id/follow', function(req, res, next){
  let id  = req.params.id;
  let ref = req.get('Referrer');
  // console.log(id, req.session.userId);
  if(req.session.userId){
    User.findByIdAndUpdate(id, {$addToSet : {followers : req.session.userId} },{new: true}, (err, visitor) =>{
      if(err)
        return next(err);
      else {
        User.findByIdAndUpdate(req.session.userId, { $addToSet : { following:id } },{new: true}, (err, user) =>{
          if(err) 
            return next(err);
          if(ref.includes('users/'))
            return res.redirect(`/users/${id}`);
          else if(ref.includes('articles')) {
            let ind = ref.indexOf('/articles/');
            return res.redirect(ref.substr(ind));
          }
          else if(ref.includes('home')) {
            return res.redirect(ref);
          }
          else{
            return res.redirect(`/users/${id}`);
          }
            //return res.render('userProfile', {visitor: visitor,user: user, isUser: true});
          
        });
      }
    })
  
  }
  else {
    req.flash('Error', 'Please login to continue')
    res.locals.message = req.flash();
    return res.render('login');  
}
});


//Unfollow User
router.get('/:id/unfollow', function(req, res, next){
  let id  = req.params.id;
  let ref = req.get('Referrer');
  if(req.session.userId){
    User.findByIdAndUpdate(id, {$pull:{followers:req.session.userId}},{new: true}, (err, visitor) =>{
      if(err)
        return next(err);
      else {
        User.findByIdAndUpdate(req.session.userId, {$pull:{following:id}},{new: true}, (err, user) =>{
          if(err) 
            return next(err);
            if(ref.includes('users/'))
            return res.redirect(`/users/${id}`);
          else if(ref.includes('articles')) {
            let ind = ref.indexOf('/articles/');
            return res.redirect(ref.substr(ind));
          }
          else if(ref.includes('home')) {
            return res.redirect(ref);
          }
          else{
            return res.redirect(`/users/${id}`);
          }
          
          
            // return res.render('userProfile', {visitor: visitor,user: user, isUser: true});
          
        });
      }
    })
  
  }
  else {
    req.flash('Error', 'Please login to continue')
    res.locals.message = req.flash();
    return res.render('login');  
}
});

//Edit User Profile

router.get('/:id/edit', function(req, res, next){
  let id  = req.params.id;
  if(req.session.userId && req.session.userId === id){
    User.findById(req.session.userId, (err, user) => {
      if(err)
        return next(err);
      return  res.render('editProfile',{user: user, isUser: true});
    });
  }
  else {
      req.flash('Error', 'Please login to continue')
      res.locals.message = req.flash();
      return res.render('login');  
  }
});

router.post('/:id/edit',upload.single('avatar'),function(req, res, next){
  let id  = req.params.id;
  //console.log(req.body);
  //console.log(req.file);
  
  if(req.file){
    console.log('here');
    req.body.avatar = req.file.filename;
    // console.log(req.body.avatar);
  }
  // console.log('|' + req.body + '|');
  if(req.session.userId && req.session.userId === id){
        User.findByIdAndUpdate(id, req.body, 
          {new:true, runValidators: true} , 
            (err, user) =>{
              if(err)
                  return next(err);
              return res.redirect(`/users/${id}`);
        });
  }
  else {
      req.flash('Error', 'Please login to continue')
      res.locals.message = req.flash();
      return res.render('login');  
  }
});
router.get('/:id/changepassword', function (req, res, next){
  let id  = req.params.id;
  if(req.session.userId && req.session.userId === id){
    User.findById(req.session.userId, (err, user) => {
      if(err)
        return next(err);
      return  res.render('changepassword',{user: user, isUser: true});
    });
    // return res.render('changepassword')
  }
  else {
    req.flash('Error', 'Please login to continue')
    res.locals.message = req.flash();
    return res.render('login');  
  }
});

router.post('/:id/changepassword', function (req, res, next){
  let id  = req.params.id;
  let oldpass = req.body.oldpassword;
  
  
  if(req.session.userId && req.session.userId === id){
    console.log('HEREAREWE: ', oldpass);
    User.findById(req.session.userId, (err, user) => {
      if(err)
        return next(err);
      console.log(user);
      if(bcrypt.compareSync(oldpass, user.password)) {
        console.log('Old password matches');
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        User.findByIdAndUpdate(req.session.userId, req.body, {new:true},(err, user) =>{
          if(err)
            return next(err);
          console.log(user);
          return res.redirect(`/users/${id}`);
        });
      } else {
        req.flash('Error', 'Old Password is wrong')
        res.locals.message = req.flash();
        return res.render('changepassword',{user: user, isUser: true});
      }
      
    });
    // return res.render('changepassword')
  }
  else {
    req.flash('Error', 'Please login to continue')
    res.locals.message = req.flash();
    return res.render('login');  
  }
});
module.exports = router;

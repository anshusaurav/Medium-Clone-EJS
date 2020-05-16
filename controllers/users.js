exports.listUsers = ( req, res, next) => {

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
  };
var express = require('express');
var router = express.Router();
var Comment = require('../models/comment');
var Article = require('../models/article');
/* GET comment by id. */
router.get('/:id/edit', function(req, res, next) {
  let id = req.params.id;
  Comment.findById(id, (err, comment)  =>{
    if(err)
      return next(err);
    res.render("editResponse", {comment});

  });
});


//edit comment
router.post('/:id/edit', function(req, res, next) {
  let id = req.params.id;
  Comment.findByIdAndUpdate(id, req.body,{new:true}, (err, comment)  =>{   //Only fields present in req.body are updated
    if(err)
      return next(err);
    res.redirect(`/articles/${comment.articleId}`);

  });
});

//delete comment
router.get('/:id/delete', (req, res, next)=>{
  let id = req.params.id;
  Comment.findByIdAndDelete(id, (err, comment) =>{
    if(err)
      return next(err);
    Article.findOneAndUpdate({_id:comment.articleId}, { $pull: {comments: comment.id} }, (err, article)=>{
      res.redirect(`/articles/${article.id}`);
    });
    
  });
});
module.exports = router;

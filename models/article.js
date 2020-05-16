const mongoose = require("mongoose");
var Schema = mongoose.Schema;


var articleSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],

    readersLiked: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    tags: [String]
    
},{timestamps: true});

var Article = mongoose.model("Article", articleSchema);
module.exports = Article;

//module.exports = mongoose.model("User", userSchema);
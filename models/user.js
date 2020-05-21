const mongoose = require("mongoose");
var bcrypt = require("bcrypt");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    name:{
        type: String, 
        required: true
    },
    email: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        trim: true
    },
    github_oauth:{
        type: String,
    },
    fb_oauth:{
        type: String,
    },
    google_oauth: {
        type: String,
    },
    google_profile:{
        sub: String,
        picture: String
    },
    fb_profile:{
        id: String,
        photo: String,
    },
    github_profile:{
      id: String,
      photo: String, 
      profile: String, 
    },

    bio: {
        type: String,
        default:"Add Bio",
        maxlength: 24
    },
    imageurl: {
        type: String,
        default: "data:image/png;base64,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"
    },
    avatar: {
        type: String,
        default:'avatar'
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: "Article",
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment",
    }],

    likedArticles: [{
        type: Schema.Types.ObjectId,
        ref: "Article",
    }],

    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    tagsFollowed: [{
        type: String
    }],
    
},{timestamps: true});

//Defining schema
//Dont use arrow function since we cant use this inside arrow function
userSchema.pre('save', async function(next){
    console.log(this, 'Presave hook');
    if(this.password && this.isModified('password')) {
        //Use async mode of bcrypt is preferred
        this.password = await bcrypt.hash(this.password, 10);
        console.log(this.password);
    }
    next();
});

userSchema.methods.verifyPassword = async function(pwd) {
    const match = await bcrypt.compare(pwd, this.password); 
    console.log(match);
    if(match)
        return true;    
    else 
        return false;
}

module.exports = mongoose.model("User", userSchema);
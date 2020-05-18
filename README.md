# Clone of Devto
Create a clone of Devto

## Endpoints:

### Authentication:

`POST users/login`

Example request body:
```JSON
{
  "user":{
    "email": "jack@email.com",
    "password": "jackjack",
    "name": "Jack Black"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `password`


### Registration:

`POST /api/users`

Example request body:
```JSON
{
  "user":{
    "username": "Jacob",
    "email": "jake@jake.jake",
    "password": "jakejake"
  }
}
```

No authentication required, returns a [User](#users-for-authentication)

Required fields: `email`, `username`, `password`



### Get Current User

`GET /api/user`

Authentication required, returns a [User](#users-for-authentication) that's the current user



### Update User

`PUT /api/user`

Example request body:
```JSON
{
  "user":{
    "email": "jake@jake.jake",
    "bio": "I like to skateboard",
    "image": "https://i.stack.imgur.com/xHWG8.jpg"
  }
}
```

Authentication required, returns the [User](#users-for-authentication)


Accepted fields: `email`, `username`, `password`, `image`, `bio`



### Get Profile

`GET /api/profiles/:username`

Authentication optional, returns a [Profile](#profile)



### Follow user

`POST /api/profiles/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required



### Unfollow user

`DELETE users/:username/follow`

Authentication required, returns a [Profile](#profile)

No additional parameters required



### List Articles

`GET /articles`

Returns most recent articles globally by default.

### Feed Articles

`GET /articles`

Can also take `limit` and `offset` query parameters like [List Articles](#list-articles)

Authentication required, will return [multiple articles](#multiple-articles) created by followed users, ordered by most recent first.


### Get Article

`GET /articles/:id`

No authentication required, will return [single article](#single-article)

### Create Article

`POST /articles`

Example request body:

```JSON
{
  "article": {
    "title": "How to train your dragon",
    "description": "Ever wonder how?",
    "body": "You have to believe",
    "tagList": ["reactjs", "angularjs", "dragons"]
  }
}
```

Authentication required, will return an [Article](#single-article)

Required fields: `title`, `description`, `body`

Optional fields: `tagList` as an array of Strings



### Update Article

`PUT /api/articles/:id`

Example request body:

```JSON
{
  "article": {
    "title": "Did you train your dragon?"
  }
}
```

Authentication required, returns the updated [Article](#single-article)

Optional fields: `title`, `description`, `body`

The `slug` also gets updated when the `title` is changed


### Delete Article

`DELETE /articles/:id`

Authentication required



### Add Comments to an Article

`POST /articles/:id/comments`

Example request body:

```JSON
{
  "comment": {
    "body": "His name was my name too."
  }
}
```

Authentication required, returns the created [Comment](#single-comment)

Required field: `body`



### Get Comments from an Article

`GET /articles/:id/comments`

Authentication optional, returns [multiple comments](#multiple-comments)



### Delete Comment

`DELETE /articles/:id/comments/:id`

Authentication required



### Favorite Article

`POST /articles/:id/favorite`

Authentication required, returns the [Article](#single-article)

No additional parameters required



### Unfavorite Article

`DELETE /articles/:id/favorite`

Authentication required, returns the [Article](#single-article)

No additional parameters required



### Get Tags

`GET /tags`

No authentication required, returns a [List of Tags](#list-of-tags)
---
layout: post
title: "Creating a REST API in node.js"
category: computers
tags: [express, knex, nodejs, javascript, programming]
date: 2017/4/19
---

Getting started with making web APIs can be confusing, even overwhelming at first. I'd like to share my process for creating APIs in Node.js.

# The server

First let's create a `package.json` and add a dependency:

``` bash
$ cd rest_api
$ npm init -y
$ npm install --save express
```

Then let's create a super minimal 'hello world' with express and save it as `index.js`:

``` javascript
const express = require('express')

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world!')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Express started on http://localhost:${port}\npress Ctrl+C to terminate.`)
})
```

* <small>I'm using ES2015 syntax here and throughout this guide, so if your node version doesn't support something, consider using [nvm][nvm] to get a more recent version.</small>

[nvm]: https://github.com/creationix/nvm

Express is imported, then an instance is created and saved as `app`.

`app.get()` tells the Express instance to listen for `GET` requests to the specified route; here it's just `/`. When this route is requested, the given callback is fired, in this case it sends the string "Hello world!" as a response.

Finally, `port` is declared as a variable which can be set from the environment, or otherwise defaults to `3000` if none is specified. Express then listens on that port, and after the server has finally started it uses `console.log` to print a message in the terminal.

Assuming everything went okay, you should then be able to run `node index.js` and point your browser at [http://localhost:3000/](http://localhost:3000/) and see the message "Hello world!"

---

Another way to test this instead of opening your browser is with either [cURL][curl] or [postman][postman]. cURL is great if you're the command-line junkie type (like me), postman is really pretty and slick but a bit too much hassle for me.

[cURL]: https://curl.haxx.se
[postman]: https://getpostman.com

Once you have curl installed it should be as simple to get your Hello World in the shell with:

``` bash
$ curl localhost:3000
```

## Request parameters

A server that only responds with the same thing every time isn't very fun though. Let's make a new route that allows us to say hello when passed a name:

``` javascript
app.get('/:name', (req, res) => {
  res.send(`Hello ${req.params.name}!`)
})
```

You'll want to add this before the `app.listen()` command so that it gets registered properly.

Then, with curl:

``` bash
$ curl localhost:3000/foo
```

You should see "Hello foo!"

## Automatic restart

To get the above change working, you first have to stop the server and then restart it again, which can get fairly annoying after a few changes. [nodemon][nodemon] can be installed to watch for changes and restart automatically.

[nodemon]: https://nodemon.io/

``` bash
$ npm install --save-dev nodemon
```

Then alter your package.json so that it looks like this:

``` json
{
  ...
  "scripts": {
    "start": "nodemon -w '*.js' -x node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  ...
}
```

Now you can run `npm start` and it will use nodemon to watch for changes and restart the server.

# The database

Before making a database, you should first identify your data and what you'll be doing with it. I spent about 30 seconds debating what kind of data to use in this tutorial, and decided to do "something" with movies.

Among other things, a movie would have a title and a date it was released, and that seems like enough to work with for now.

--- 

I don't want to go into setting up and configuring a big fancy database, so we will use the most excellent [SQLite][sqlite]. SQLite is a great [RDBMS][rdbms] that uses files to represent databases, and doesn't require any background processes to store or retrieve data. If you already have a database like PostgreSQL or MariaDB running feel free to use those, you should only have to adjust a couple of things.

[sqlite]: https://sqlite.org/
[rdbms]: https://en.wikipedia.org/wiki/Relational_database_management_system

``` bash
$ npm install --save sqlite3 knex
```

Rather than interacting with the database directly, we're going to use a query builder called [knex][knex]. knex allows you to write your queries in plain JavaScript, which provides an abstraction layer over your database driver. This makes it so your queries aren't necessarily tied to a specific database engine, and if you want to change to a different database later it's a much less difficult migration, sometimes only just a few lines.

[knex]: http://knexjs.org

In a separate file, perhaps called `movies.js` save this:

``` javascript
const path = require('path')
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: path.join(__dirname, 'data.sqlite3') },
  useNullAsDefault: true,
})
```

This creates a knex instance, and uses a file called `data.sqlite3` in the same directory as the database. The `useNullAsDefault` is necessary for SQLite, but for other databases it can be omitted.

Now let's define some sort of schema:

``` javascript
knex.schema.createTableIfNotExists('movies', table => {
  table.increments('id').primary()
  table.string('title')
  table.integer('released')
}).then()
```

This tells knex to look for a table called "movies" and create it if it doesn't exist. It creates three columns in the table: "id", "title", and "released".

It's important to note that because of the nature of promises, knex would not execute this without the `.then()` method at the end. A promise can be initialized, but it won't resolve unless it has a reason to.

## Data methods

Now that we have a database and a table, we need some methods to populate the table with data.

``` javascript
function create(title, released) {
  return knex('movies')
    .insert({ title, released })
}
```

This creates a function called `create` that accepts two parameters, `title` and `released`, which are purposely the same name as the field names. We then initialize a promise with knex to insert these, using [object shorthand notation][osn], which lets you use variable names for object keys.

[osn]: https://ariya.io/2013/02/es6-and-object-literal-property-value-shorthand

Now that we can create movies, we need a way to list them:

``` javascript
function list() {
  return knex('movies')
    .select('*')
}
```

The functions here don't use `.then()` to resolve the promises because they will be used elsewhere. This file should just provide a small module that exposes a few functionalities to interact with data.

To finish up, since this file won't directly consume these methods, we need to export them so they can be used as a module:

``` javascript
module.exports = {
  create,
  list,
}
```

# Wiring it up

Now let's wire up our database to our server!

Going back to our `index.js`, let's import our new movies file and make a route to use the `list` method so that it looks like this:

``` javascript
const express = require('express')
const movies = require('./movies')

const app = express()

app.get('/api/v1/movies', (req, res) => {
  movies.list()
    .then(data => res.json(data))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Express started on http://localhost:${port}\npress Ctrl+C to terminate.`)
})
```

Requesting the data is the easy part, with curl we can simply:

``` bash
$ curl localhost:3000/api/v1/movies
```

which right now will return an empty JSON array.

Accepting `POST` requests is where things get a bit tricky...

To be able to properly create movies, we need to introduce a piece of express middleware:

* Express middleware are little modules that are run 'in the middle' of the request. They usually alter the request or response objects in some way. There are tons of middleware modules for express, and explaining them in-depth is a bit out of scope for this post, but if you'd like to read more, check out the [offical docs][middleware].

[middleware]: http://expressjs.com/en/guide/using-middleware.html

``` bash
$ npm install --save body-parser
```

Then add it to the imports at the top:

``` javascript
const bodyParser = require('body-parser')
```

Then tell express to apply the middleware:

``` javascript
app.use(bodyParser.urlencoded({ extended: true }))
```

Finally we can add the route, and our `POST` body data will be available as `req.body`:

``` javascript
app.post('/api/v1/movies', (req, res) => {
  const { title, released } = req.body
  movies.create(title, released)
    .then(data => res.json(data))
})
```

There's a bit of destructuring magic going on there:

``` javascript
const { title, released } = req.body
// is the same thing as
const title = req.body.title
const released = req.body.released
```

The file should eventually look like:

``` javascript
const express = require('express')
const bodyParser = require('body-parser')
const movies = require('./movies')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/v1/movies', (req, res) => {
  movies.list()
    .then(data => res.json(data))
})

app.post('/api/v1/movies', (req, res) => {
  const { title, released } = req.body
  movies.create(title, released)
    .then(data => res.json(data))
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Express started on http://localhost:${port}\npress Ctrl+C to terminate.`)
})
```

Using curl we can now insert data with:

``` bash
$ curl -X POST -d 'released=2017' -d 'title=nothing good' localhost:3000/api/v1/movies
```

Which will return the new number of rows.

If we wanted to have the POST method also return the new data in it's entirety, we can simply chain promises:

``` javascript
app.post('/api/v1/movies', (req, res) => {
  const { title, released } = req.body
  movies.create(title, released)
    .then(() => movies.list())
    .then(data => res.json(data))
})
```

## Full CRUD support

Any good API endpoint usually provides [four methods][crud]:

[crud]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete

* Create
* Read
* Update
* Delete

We only have the first two, so let's finish it up and add the others.

Back in our `movies.js` let's add two more functions:

``` javascript
function update({ id, title, released }) {
  return knex('movies')
    .update({ title, released })
    .where({ id })
}

function del(id) {
  return knex('movies')
    .where({ id })
    .del()
}
```

The `update` method uses parameter destructuring, so rather than accepting 3 different arguments it accepts a single object, which we extract the keys from as their own variables. Both methods then use more object property shorthand, instead of the more verbose `where({ id: id })`.

Then we need to update our exports:

``` javascript
module.exports = {
  create,
  list,
  update,
  del,
}
```

Back in the `index.js` file we need to make two more routes:

``` javascript
app.put('/api/v1/movies', (req, res) => {
  movies.update(req.body)
    .then(() => movies.list())
    .then(data => res.json(data))
})

app.delete('/api/v1/movies', (req, res) => {
  movies.del(req.body.id)
    .then(() => movies.list())
    .then(data => res.json(data))
})
```

Now we can edit movies by passing field names as data pieces in curl:

``` bash
$ curl -X PUT -d 'id=1' -d 'title=new title' localhost:3000/api/v1/movies
```

And delete them by passing the id:

``` bash
$ curl -X DELETE -d 'id=1' localhost:3000/api/v1/movies
```

# Conclusion

We learned how to make a single endpoint respond to different actions and query a database with the appropriate methods.

Hopefully I didn't rush through too much and explain things enough, I'm still getting used to this whole technical writing thing.

At some point I'll make a follow up to to this to show how to make a React front-end to display and edit data.

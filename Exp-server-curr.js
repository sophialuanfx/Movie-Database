const express = require('express');
const pug = require("pug");
const model = require("./logic.js");
const fs = require("fs");
const mongo = require('mongodb');
const movies = require("./movie/movie-data.json");
const users = require("./movie/users.json");

const app = express();
app.set("view engine", "pug");
const session = require('express-session');
const mc = require('mongodb').MongoClient;
let db;

app.use(session({ secret: 'some secret here'}))
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

/*
Function our business logic currently supports:
1. creating a new user (createUser) - POST/users
2. Reading a user (getUser) - GET /users/:users
3. Searching for users (searchUsers) -GET /users
4. Searching for movie (searchMovie) -GET /movies
5. Searching for people (searchPeople) -GET /movies
6. Making a subscribe (make Subscribe) -Post /users
7. Recommend Movie (getRecMovie) -GET /movies
8. Making a follow (makeFollow) -Post /users
9. Upgrade the Account level (upgradeAccount) - Post /users
10. Posting a new Review for movie (createReview) -Post /users
*/
//user pug functrion to render through the login Page
const renderLogin = pug.compileFile('pages/login.pug');
const renderHome = pug.compileFile('pages/Home.pug');
const renderSignup = pug.compileFile('pages/Signup.pug');
const renderProfile = pug.compileFile('pages/Profile.pug');
const renderMovie = pug.compileFile('pages/Movie.pug');
const renderView = pug.compileFile('pages/View.pug');
const renderOther = pug.compileFile('pages/Other.pug');

app.use(express.static("stylesheets"));
app.use(express.json());

function auth(req, res, next){
  if(!req.session.user){
    res.status(403).send(" You need to logged in to do this request");
    return;
  }
  next();
}

app.get("/", getHome)
app.get('/logOut', logOut);
app.get("/movies/:mid", getMovie);
app.get("/other", getOther);
app.get("/other/:uid",getOther);
app.get("/people/:uid", getPeople);
app.get("/img/ilovem.jpg", getImg);
app.get("/movies/img/ilovem.jpg", getImg);
app.get("/users/img/ilovem.jpg", getImg);
app.get("/people/img/ilovem.jpg", getImg);
app.get("/other/img/ilovem.jpg", getImg);
app.get("/img/ilovemb.jpg", getBackgroundImg);
app.get("/movies/img/ilovemb.jpg", getBackgroundImg);
app.get("/users/img/ilovemb.jpg", getBackgroundImg);
app.get("/other/img/ilovemb.jpg", getBackgroundImg);

app.post("/movies", searchMovie, getMovie);
app.post("/people", searchPeople, getPeople);
app.post("/other", searchUser, getOther);
app.post('/signUpUser', signUpUser, logInUser);
app.post('/logInUser', logInUser);
app.post("/movies/:mid", auth, addWatchList, getMovie);
app.post("/subscribe/:pid", auth, subscribePeo, getPeople);
app.post("/reviewmovie/:mid", auth, makeReview);

//check the cookie been create
app.use('/', function(req, res, next){
  //console.log(req.session);
  next()
})

//render the home page
function getHome(req, res, next){
  let movArr = model.getRanMovie();
  let movName = movArr[0].Title;
  let data = renderHome({movie: movArr, name: movName, session: req.session});
  res.status(200).send(data);
}

function searchMovie(req, res, next){

  db.collection("Movies").find({Title:req.body.movName}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    if(result.length<1||result==undefined){
      res.send("Please enter the full name or correct name (Movie Name)");
    }else{
      res.redirect("/movies/" + req.body.movName);
    }
  });
}

function searchPeople(req, res, next){
  let result=model.searchPeople(req.body.peoName);

  if(result.length<1||result==undefined){
      res.send("Please enter the correct name (People Name)");
    }else{
      res.redirect("/people/" + req.body.peoName);
  }
}

function searchUser(req, res, next){
  db.collection("Users").find({username:req.body.userName}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    if(result.length<1||result==undefined){
      res.send("Please enter the full name or correct name (Users Name)");
    }else{
      res.redirect("/other/" + req.body.userName);
    }
  });
}

//render the movie page
function getMovie(req, res, next){
  let movArr = model.getMovie(req.params.mid);
  let directorName = model.getNameArr(movArr[0].Director);
  let writerName = model.getNameArr(movArr[0].Writer);
  let actorName = model.getNameArr(movArr[0].Actors);
  let url = movArr[0].Poster;
  let recMovie = model.getRecMovie(req.params.mid);

  let data = renderMovie({movie: movArr, link: url, session:req.session, movName: req.params.mid,
                          otherName: directorName, writerName: writerName, actorName: actorName,
                        recMovie: recMovie});
  res.status(200).send(data);
}

// render people page
function getPeople(req, res, next){
  let name = req.params.uid;

  db.collection("Movies").find({$or:[{Writer:{$eq:name}}, {Director: {$eq:name}}, {Actors: {$eq:name}}]}).toArray(function(err,result){
		if(err) throw err;
    if(result.length < 1 || result == undefined){
      //empty
      res.redirect("/");
      return;
    }
    let writerName = model.getNameArr(result[0].Writer);
    let data = renderView({name:name, session:req.session, movie:result, writerName:writerName});
    res.status(200).send(data);
	});
}

function getOther(req, res, next){
  let name = req.params.uid;

  req.session.hasSubOthers = true;
  req.session.user.followOther.push(req.params.uid);

  db.collection("Users").find({username:req.params.uid}).toArray(function(err,result){
    if(err) throw err;

    let data = renderOther({name:name,session:req.session});
    res.status(200).send(data);
        });
}

// add the movie to users watch List -post/subscribeMovie
function addWatchList(req, res, next){
  req.session.hasMovies = true;
  req.session.user.likedMovie.push(req.params.mid);

  next();
}

function subscribePeo(req, res,next){
  if(req.session.user.following.includes(req.params.pid)){
    res.status(200).redirect("/people/" + req.params.pid);
    return;
  }
  req.session.hasSubscribe = true;
  req.session.user.following.push(req.params.pid);

  res.status(200).redirect("/people/" + req.params.pid);
}

//Purpose : add review to the user profile page and movie page
function makeReview(req, res, next){
    let movName = req.params.mid;
    let review = {username: req.session.user.username, movName :movName , review: req.body.moviereview}

    req.session.hasReview = true;
    req.session.user.reviews.push(review);
    res.status(200).redirect("/movies/" + req.params.mid);
}

// serve logo image
function getImg(req, res, next){
  fs.readFile("img/ilovem.jpg", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
}

// serve background image
function getBackgroundImg(req, res, next){
  fs.readFile("img/ilovemb.jpg", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
}

// Homepage JS function
app.get("/Homepage.js", function(req, res, next){
  fs.readFile("Homepage.js", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

// provide css style
app.get("/movie/style.css", function(req, res, next){
  fs.readFile("stylesheet/style.css", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})

//render sign up page
app.get("/signup", function(req, res, next){
  let data = renderSignup("./pages/Signup.pug",{session:req.session})
  res.status(200).send(data);
})

//render sign up page
app.get("/signin", function(req, res, next){
  let data = renderLogin("./pages/login.pug",{session:req.session})
  res.status(200).send(data);
})

app.get("/login", function(req, res, next){
  let data = renderLogin("./pages/login.pug",{session:req.session})
  res.status(200).send(data);
})

//render the profile page
app.get("/profile", function(req, res, next){

  let data = renderProfile({user: req.session.user, session:req.session, movName:req.session.user.likedMovie,
                              subName:req.session.user.following , review: req.session.user.reviews,
                            subOtherName:req.session.user.followOther});
  res.status(200).send(data);
})


//render the movie
app.get("/view", function(req, res, next){
  let data = renderView();
  res.status(200).send(data);
})

app.get("/login.js", function(req, res, next){
  fs.readFile("login.js", function(err, data){
    if(err){
      res.status(500).send("Unknown resources");
      return;
    }
      res.status(200).send(data);
  });
})


//the post request for the log in function
function logInUser(req, res, next){

  db.collection("Users").find({username:req.body.username,password:req.body.password}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }
    if(model.authenticateUser(req.body.username, req.body.password)){
        //they have logged in successfully
        req.session.user = model.users[req.body.username];
        req.session.loggedin = true;
        req.session.hasMovies = false;
        req.session.hasReview = false;
        req.session.hasSubscribe = false;
        req.session.hasSubOthers = false;
        res.status(200).redirect("/users/" + req.body.username);
    }else if(result.length<1||result==undefined){
      //they did not log in successfully.
      res.status(401).send("You enter the wrong username or password. Please Try agian");
    }
    next();
  });
}

//the post request for the sign up function
function signUpUser(req, res, next){
  let newUser =req.body;

  db.collection("Users").find({username:newUser.username}).toArray(function(err,result){
    if(err){
      res.status(500).send("Error Reading Database");
      return;
    }


    if(result.length<1||result==undefined){
      let usernew= model.createUser(newUser);
      db.collection("Users").insertOne(usernew,function(err,result){
        if(err){
          res.status(500).send("Error Reading Database");
          return;
        }
        next();
      });
    }else if(result[0].username===(newUser.username)){
      res.status(300).send("You already register");
    }
  });
}

function logOut(req, res){
  req.session.destroy();
  res.redirect('/login');
}


//2. get request for the Reading a user (getUser), input the uid to get the user information
app.get("/users/:uid", auth,function(req, res, next){
  let result = model.getUser(req.session.user, req.params.uid);
  if(result == null){
    res.status(404).send("Unknown user")
  }else{
    let data = renderProfile({user: result, session:req.session});
    res.status(200).send(data);
    return;
  }
})


//3. Searching for users (searchUsers),
app.get("/users", function(req, res, next){

  if(req.query.name==undefined){
    req.query.name="";
  }
  let result = model.searchUsers(req.session.user, req.query.name);
  res.status(200).json(result);
})


//4. Searching for moive (searchMovie),
app.post("/SearchMovie", function(req, res, next){

  if(req.query.title==undefined){
    req.query.title="";
  }
  let result =model.searchMovie(req.session.user, req.query.name);

  let data = renderMovie({movie: result});
  res.status(200).send(data);
})


//5. Searching for People (searchPeople),
app.get("/SearchPeople", function(req, res, next){

  if(req.query.name==undefined){
    req.query.name="";
  }
  let result =model.searchPeople(req.session.user, req.query.name);
  res.status(200).json(result);
})

//9. Upgrade the Account level (upgradeAccount) - Post /users
app.post("/upgrade/:uid", auth,function(req, res, next){
  let result = upgradeAccount(req.session.user);
  if(result == NULL){
      res.status(500).send("Invalid User");
  }
  let data = renderProfile({user: result});
  res.status(200).send(data);
  return;
})

// set up the mongodb server, add movies and users into database
mc.connect("mongodb://localhost:27017", function(err, client){
  if(err)
  {
    console.log("Error connecting to MongoDB");
    console.log(err);
    return;
  }

  db = client.db("Moivedb");
  db.collection("Movies").insertMany(movies, function(err,result){
    if(err) throw err;

  });
  db.collection("Users").insertMany(users, function(err,result){
		if(err) throw err;
		console.log(result);
	});
  app.listen(3000);
  console.log("Server listening on port 3000");


})

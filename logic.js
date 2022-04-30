/*
Purpose: This file include all the business logic part of the project, which provides the basic web function.
This file include the different logic function, for creating new users, searching movie, or people, recommend
movie, ect.
*/

let users = require("./Movie/users.json");
let movies = require("./Movie/movie-data.json");


// Purpose: Create the user with all the defult value; Input: newUser - object; output: object
function createUser(newUser){
        if(!newUser.username || !newUser.password){
            return null;
        }

        if(users.hasOwnProperty(newUser.username)){
          //There is a user with that name already
          return null;
        }

        //Set initial values for the new user
        newUser.accountLevel = ["regular"];
        newUser.reviews = [];
        newUser.following = [];
        newUser.likedMovie = [];
        newUser.followOther = [];
        users[newUser.username] = newUser;

        return users[newUser.username];
}


// Purpose: Check the user enter whether valid .
function isValidUser(userObj){
  if(!userObj){
    return false;
  }
  if(!userObj.username || !users.hasOwnProperty(userObj.username)){
    return false;
  }
  return true;
}

// Purpose: Check whether is authenticateUser
function authenticateUser(username, password){
  return users.hasOwnProperty(username) && users[username].password == password;
}

// Purpose: Get the user infor by given input username,
function getUser(requestingUser, userID){
    //If the requesting user is invalid
    if(!isValidUser(requestingUser)){
      return null;
    }

    //If the requested userID exists and the requesting user is allowed to access it, return the user
    if(users.hasOwnProperty(userID)){
      if(requestingUser.username == userID || requestingUser.friends.includes(userID)){
        return users[userID];
      }
    }

    return null;
}

// Purpose : Return the first string that separate by the , then get the string before (
// Input : "John Lasseter (original story by), Pete Docter (original story by)"
// Output : ["John Lasseter", "Pete Docter"]
function getNameArr(str){
  let arrStr = str.split(',');
  let nameArr = []
  for(let i=0; i < arrStr.length; i++){
    let name = arrStr[i].split('(')[0];
    //check if the first string whetehr contains space bar
    if(name[0] === ' '){
      name = name.substring(1);
    }
    nameArr.push(name);
  }
  return nameArr;
}


/*
Purpose : Return an array of Recommand movies
Input:    1. movie title - string
Outputs: movie arrary
*/

function getRecMovie(movie){
  let movieArr = getMovie(movie);
  let recMovie = [];
  let length = 0;

  // get 4 movies into array
  for(i in movies){
    if (length == 4){
      return recMovie;
    }
    // get same Country and Rated title movie
    if(movies[i].Country == movieArr[0].Country
      && movies[i].Rated == movieArr[0].Rated
    && movies[i].Title != movieArr[0].Title){
      recMovie.push(movies[i]);
      length++;
    }
  }
  return recMovie;

}


/*
Input: user - who want to subscribe, and the people who has been subscribed by other
Output: NULL - not found the user, 2 - user already in the following, 3-add succesful
*/
function makeSubscribe(user, people){
    console.log("!"+user + ".hasOwnProperty("+people+ " = " +  !users.hasOwnProperty(people));
    let flag = 0;
    //If one of the user doesn't exist, stop
    if(!users.hasOwnProperty(user) || !users.hasOwnProperty(people)){
      return flag;
    }
    console.log("user = " + user);
    console.log("users = " + users[user]);
    //If the users are already Subscribe, stop
    if(users[user].following.includes(people)){
      flag = 1;
      return flag;
    }

    //Update they are now followed
    users[user].following.push(people);
    flag = 2;
    return flag;


}

// Purpose: search the user
function searchUsers(requestingUser, searchTerm){
    let results = [];

    //If the user is not valid, return an empty array.
    //You could return null to indicate an error or any other value to signify the requesting user was not valid.
    if(!isValidUser(requestingUser)){
      return results;
    }

    //If users was an array, you could use a nice one line filter function call
    for(username in users){
      let user = users[username];
      //If this user matches the search term
      if(user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0){
        //If the requesting user is allowed to access the matching user
        if(user.username === requestingUser.username || requestingUser.following.includes(user.username)){
          results.push(user);
        }
      }
    }

  return results;
}


//Purpose: search Movie Title
function searchMovie(movieName){
  let results = [];

  //If the user is not valid, return an empty array.
  //You could return null to indicate an error or any other value to signify the requesting user was not valid.
  for(name in movies){
    let movie = movies[name];
      if(movie.Title.includes(movieName)){
        results.push(movie);
    }
  }

return results;
}

//search people (writer, actor, director)
function searchPeople(peopleName){
  let results = [];

    for(i in movies){
      let moviepeople = movies[i];
      if(moviepeople.Actors.includes(peopleName)){
        results.push(moviepeople);
      }else if(moviepeople.Actors.includes(peopleName)){
        results.push(moviepeople);
      }else if(moviepeople.Director.includes(peopleName)){
        results.push(moviepeople);
      }
    }
  return results;
}

// Purpose: Change the account level
function upgradeAccount(requestingUser){

    if(!isValidUser(requestingUser)){
        return null;
    }

    if(requestingUser.accountLevel === "regular"){
        requestingUser.accountLevel = ["contributing"];
        console.log("upgrade!")
    }else{
        requestingUser.accountLevel= ["regular"];
        console.log("downgrade~");
    }
    users[requestingUser.accountLevel] = requestingUser;
    return users[requestingUser.accountLevel];
}

function createReview(requestingUser, title, newR){
  //Verify the contents of the question and we should verify the user
  let reviewArr = [];

  reviewArr.push(title);
  reviewArr.push(newR);

  requestingUser.reviews.push(reviewArr);

  return newR;
}

// Purpose : generated random movie on the Homepage if the user haven't login
function getRanMovie(){
  let movArr =[];
  for(let i =0;i< 5;i++){
    movArr[i] = movies[i];
  }
  return movArr;

}

// Pupose : get Specific movie
function getMovie(name){
  let movArr =[];
  for(i in movies){
    if(movies[i].Title == name){
      movArr.push(movies[i]);
    }
  }
  return movArr;

}

console.log("Creating some users");
let userA = createUser({username: "Sop", password: "12345"});
let userC = createUser({username: "Li", password:"12345"});
let userD = createUser({username: "Lulu", password: "12345"});
let userB = createUser({username: "simon", password: "123"});

module.exports = {
  users,
  movies,
  isValidUser,
  createUser,
  getUser,
  makeSubscribe,
  searchUsers,
  searchMovie,
  searchPeople,
  authenticateUser,
  getRanMovie,
  getMovie,
  upgradeAccount,
  createReview,
  getNameArr,
  getRecMovie,
}

1. List of Source files
		README.txt

		Dynamic web page (HTML and PUG)
			login.pug						This file include the username input and password input by using the log in button to log in to the account and
			 										create new account by using the sign up button

			Signup.pug          The User registration page contains username and password

			Movie.pug						This file include the top search bar which can be using for return to home page and the search button for the
			 										movie or people searching, also include the movie information, and the other movie for the other user's viewing

			Other.pug						This file include the follow button which can follow the user, user's information, the list of movie review by user,
			 										and include the people followed by this user and click the people is able to navigate to that person’s page.

			Profile.pug					This file include the my account information, a side bar navigation to the home page and the upgrade page.

			Home.pug						The homepage of the web, provide search bar, log in and register button. also provides a list of movie
			 										that is recommend to the users.

			View.pug						The web page that shows the information about the Director, also have subscribe button than can subscribe the Director

		Logic JS file	(the client side and some server side of programming was divided each corresponding web page)
		- login.js						This file for user to check having a correct form to login
		- logic.js						(final version) This file include all the business logic part of the project.

		Sever JS file
			- movie-server.js				The new server by using the express application.

		CSS style sheet
			style.css								Style sheet for webpage

		Demo picture
			ilovem.jpg							Website icon
			ilovemb.jpg							Website background

		JSON file
			users.JSON							demo-user-data store in JSON file
			movie-data-short.json 	demo-movie data in JSON file
			movie-data.json					full movie data in JSON file


2. The project we current working on
		Movie Database

3. The name of both partners
 	Sophia Luan #101035064,
	Yanxi Chen #101118360，

4. OpenStack instance information
	ip: 134.117.133.188
	username: student
	password: student

5. How to run the server on OpenStack instance
	1. cd COMP2406_finalProject
	2. /home/student/COMP2406_finalProject
	3. node movie-server.js

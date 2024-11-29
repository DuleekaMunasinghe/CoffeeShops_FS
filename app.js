var express = require('express');
var app = express();
var path = require('path');
var bcrypt = require("bcrypt");
var conn = require("./db");
var session = require("express-session");

app.use(      // the session we are using
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());    // 

// Serve static files from the "public" directory
app.use('/public', express.static(__dirname + '/public'));

// Route for the home page
app.get('/', function (req, res) {
  res.render("home"); // Render the "home.ejs" view
});

// Route for the login page
app.get('/login', function (req, res) {
  res.render('login'); // Make sure you have a login.ejs file in your views directory
});

app.get('/register', function (req, res) {
  res.render("register"); // Render register.ejs
});

// Route for the About Us page
app.get('/aboutus', function (req, res) {
  res.render("aboutus"); // Render the "aboutus.ejs" view
});

// Route for the products page
app.get('/products', function (req, res) {
  res.render("products"); // Ensure you have a products.ejs file
});

// Route for the logged_products page
app.get('/logged_products', function (req, res) {
  res.render("logged_products"); // Ensure you have a products.ejs file
});

// Route for the logged_products page
app.get('/adminpannel', function (req, res) {
  res.render("adminpannel"); // Ensure you have a products.ejs file
});


// Routes product page
app.get("/rating", function (req, res) {
  if (!req.session.loggedIn) {
    //if the user is not login this will direct to login page and then the user can login first to rate the products
    res.redirect("/login");
    res.end();
  } else {
    res.render("rating");
  }
});

// Route for the customers page
app.get('/customers', function (req, res) {
  res.render("customers"); // Render register.ejs
});

// Registration Process
app.post("/reg", function (request, response) {
  console.log("Register Request", request.body);

  if (request.body.password !== request.body.confirmPassword) {
    console.log("Password not match");
    response.redirect("/register");
    response.end();

  } else {
    console.log("Password match");

    // Hash the password

    var hashedPassword = bcrypt.hashSync(request.body.password, 10);
    console.log("Hashed Password", hashedPassword);

    // ADD TO DATABASE

    conn.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
      [request.body.firstName, request.body.lastName, request.body.email, hashedPassword],
      function (error, results, fields) {
        if (error) throw error;
        console.log("User added to database");
        response.redirect("/login");
      }
    );
  }
});

// Login Process
app.post("/auth", function (request, response) {
  console.log("Login Request", request.body);

  conn.query(
    "SELECT * FROM users WHERE email = ?",
    [request.body.email],
    function (error, results, fields) {
      if (error) throw error;
      console.log("User found in database", results);

      if (results.length > 0) {
        var user = results[0];
        console.log("User", user);
        var passwordMatch = bcrypt.compareSync(
          request.body.password,
          user.password
        );
        console.log("Password Match", passwordMatch);

        if (passwordMatch) {
          request.session.email = request.body.email;
          request.session.loggedIn = true;
          response.redirect("/logged_products"); // if the login success --> redirect to product page
          response.end();
        } else {
          response.redirect("/login"); // if the login failed --> redirect to login page
          response.end();
        }
      } else {
        response.send("User not found");
      }
    }
  );
});

// Route admin dashboard
app.get("/adminpannel", function (req, res) {
  //in order to make the admin accessible to admin pages, we need to go database and manupilate the value of "is_admin" 0 to 1, then admin can access the dashboard
  if (!req.session.loggedIn) {
    res.redirect("/login");
    res.end();
  } else {
    // Check if the user is an admin
    // Get the user from the database
    conn.query(
      "SELECT * FROM users WHERE email = ?",
      [req.session.email],

      function (error, results, fields) {
        if (error) throw error;
        console.log("User found in database", results);

        if (results.length > 0) {
          var user = results[0];
          console.log("User", user);
          if (user.is_admin) {
            // checking the user is admin, only admin can access the dashboard
            console.log("User is admin");

            // Fetch all the ratings from the database

            conn.query(
              "SELECT * FROM ratings",
              function (error, results, fields) {
                if (error) throw error;
                console.log("Ratings From database", results);

                // Create a histogram of the ratings

                var histogram = {
                  1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  2: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                  3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                };

                for (var i = 0; i < results.length; i++) {
                  var rating = results[i];
                  histogram[rating.product_id][rating.rating]++;
                }

                console.log("Histogram", histogram);

                res.render("adminpannel", { ratings: results });
              }
            );
          } else {
            console.log("User is not admin");
            res.redirect("/rating");
            res.end();
          }
        } else {
          console.log("User not found");
          res.redirect("/");
          res.end();
        }
      }
    );
  }
});

// Process rating submission
app.post("/submit_ratings", function (req, res) {
  if (!req.session.loggedIn) {
    //if the user is not login this will direct to login page and then the user can login first to rate the products
    res.redirect("/login");
    res.end();
  }

  console.log("Rating Submission", req.body);

  // Who rated the product
  console.log("User", req.session.username);

  // TODO: check if the user has already rated the product
  // If the user has already rated the product, update the rating

  // Process the rating submission

  var ratings = [
    {
      product_id: 1,
      rating: req.body.rating_product1,
    },
    {
      product_id: 2,
      rating: req.body.rating_product2,
    },
    {
      product_id: 3,
      rating: req.body.rating_product3,
    },
  ];
  console.log("Ratings", ratings);
  // Add to database

  for (var i = 0; i < ratings.length; i++) {
    conn.query(
      "INSERT INTO ratings (product_id, rating, user) VALUES (?, ?, ?)",
      [ratings[i].product_id, ratings[i].rating, req.session.email],
      function (error, results, fields) {
        if (error) throw error;
        console.log("Rating added to database");
      }
    );
  }
});




// Route for logout
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
  res.end();
  console.log("User logged out");
});



// REST API functions 
app.get("/api/products", function (req, res) {
  const productId = req.query.id; // Change from req.params.id to req.query.id

  // If no product ID is provided, fetch all products
  if (!productId) {
    const queryAll = 'SELECT * FROM products';
    conn.query(queryAll, function (err, results) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to retrieve products'
        });
      }

      // Return all products
      return res.status(200).json(results);
    });
  } else {
    // If product ID is provided, search for specific product
    const query = 'SELECT * FROM products WHERE id = ?';
    conn.query(query, [productId], function (err, results) {
      // Handle any database errors
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to retrieve product'
        });
      }

      // If no product found
      if (results.length === 0) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Product with ID ${productId} not found`
        });
      }

      // Return the first (and should be only) matching product
      res.status(200).json(results[0]);
    });
  }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Node app is running on port ${PORT}`);
});

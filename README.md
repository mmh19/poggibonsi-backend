# Poggibonsi
Smart Table Soccer application created during the Monk Mobile Hackathon 2019

## Available APIs
### Public routes


#### Signup
~~~~ 
POST: /signup 
~~~~
`firstName` player's first name (required)
`lastName` player's last name (required)
`email` player's email (required)
`image` Base64 profile image

---

### Authenticated routes

#### Players
~~~~ 
GET: /players 
~~~~

Retrieves the full list of registered players.

---

~~~~
PUT: /players/:playerId
~~~~

Updates the user data based on the values of `firstName`, `lastName`, `email` and `available`.

---

#### Matches
~~~~ 
GET: /matches 
~~~~
Retrieves the current active match.

---

~~~~ 
POST: /matches 
~~~~
Creates a new match given a pair of player ids.
`redPlayer` is the red player id.
`bluePlayer` is the blue player id.

---




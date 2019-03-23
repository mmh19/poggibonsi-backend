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
GET: /api/players 
~~~~

Retrieves the full list of registered players.

---

~~~~
GET: /api/players/:playerId
~~~~
Returns the `UserObject` related to the given `playerId`.

---


~~~~
PUT: /api/players/:playerId
~~~~

Updates the user data based on the values of `firstName`, `lastName`, `email` and `available`.

---

#### Matches
~~~~ 
GET: /api/matches 
~~~~
Retrieves the list of all existing matches

---

~~~~
GET: /api/matches/pending
~~~~
Retrieves the current pending match.

---

~~~~
GET: /api/matches/active
~~~~
Retrieves the current active match.

---

~~~~ 
POST: /api/matches 
~~~~
Creates a new match given a pair of player ids.
`redPlayer` is the red player id.
`bluePlayer` is the blue player id.

#### Returned values
`{MatchObject}` if the match creation is successful

#### Meaningful HTTP status codes
`200` Match created
`403` Another match is in progress

---

~~~~
PUT: /api/matches/:matchId
~~~~

Updates the match data based on the values of `isActive`,

---

### Live Scoretable
~~~~
ws://localhost:8888/
~~~~
Websocket which streams the current match status in real-time. The message has the following format:

~~~~
{
    bluePlayer: <UserObject>,
    redPlayer: <UserObject>,
    blueScore: <Number>,
    redScore: <Number>
}
~~~~


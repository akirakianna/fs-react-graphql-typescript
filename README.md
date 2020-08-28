# fs-react-graphql-typescript

ts-node is slower, running TypeScript with the Watch command instead.
It takes the TypeScript code and turns it in to JavaScript (see dist folder)

nodemon - so we don't have to run command every time. It listens for any changes we make in file and re-run it.

postgresql problems

When trying to set up migrations got the following error:
error: role "postgres" does not exist

Fixed by createuser -s -r postgres - error was because the postgresql role hadn't been created.
Roles are how postgresql maintains db permissions.

Dist folder doesn't update - delete then run yarn watch to create again (no duplications).

Use await when data is returning a promise.

Playground (devtool) - GraphQL - TypeScript

crud - reading a post, updating a post, deleting a post etc.

GraphQL splits queries and mutations so have to specify mutation on playground..

Need to be explicit with types when using nullable 

-------HOW SESSIONS WORK-------

req.session.userId = user.id - storing some data into session, will take any data stuck onto the session object and store it in redis.


{userId: 1} -> sends this to redis

1. stored in redis.
sess:lgfkjlkgfhjglfk -> { userId: 1 }
if i give redis this key, it will give me back that data

2. signed version of key is sent to the browser
express-session (middleware) will set a cookie on my browser, e.g. ghthf58gjvj
the cookie value is a signed version of the key above
stick signed key on user's broswer

3. Whenever the user makes a request
ghthf58gjvj -> sent to the server

4. On server it unsigns using the secret specified
turns cookie into
decrypt the cookie and get the key for redis
ghthf58gjvj -> sess:lgfkjlkgfhjglfk 

5. make a request to redis, it looks the key (in redis) up and returns the data
sess:lgfkjlkgfhjglfk -> { userId: 1 }

6. Then stores { userId: 1 } this on req.session.


----- TECHNOLOGIES -----
TypeScript
GraphQL
Playground for graphql
React.js
Node.js
MikroORM
Argon2
PostgreSQL
Next.js
Chakra
Redis
Formiddable urql - graphQL client

In next.js whatever you call your pages file name, automatically becomes a route. e.g register - can now /register

2.55 for colormode changes








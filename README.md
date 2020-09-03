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

// BUG

server side bug

Bug where if you eneter a username that's already taken, the next time you enter a username it doesn't work..
error with persistandflush - ValidationError: You cannot call em.flush() from inside lifecycle hook handlers
fixed by re-writing with a query builder - user.ts register mutation

before 
 try {
    //* This is saving the user to the db
    await em.persistAndFlush(user)
    } catch(err) {
      console.log(err)
      //* username duplication error handling
      if (err.code === '23505') {
        return {
          errors: [
            {
            field: 'username',
            message: 'Username is already taken!'
          }
        ]
      }
    } 
  }

--- login error ---

Due to cacheing it didn't automatically update to show the right links in navbar when logging in, had to refresh page.
Urql is using caching, caching the me request - saw `i wasn't logged in and didn't make another network erequest. just took the data from the cache which said I wasn't logged in.
to fix this I updated the cache on login and register by ...
urql doesn't come with default normalized cache - set up in separate package - using graphcache. See notes in _app.tsx.

--- fragments ---

Created a base user fragment so that I don't have to repeat fields in my graphql files -
can just use ...BaseUser. Also means can add more fields to fragment and won't need to do it in all files with user


--- server side rendering ---
sleep function in post.ts (post resolver) creating artifical delay
diff between server side rendering is its going to run this data on the server side and not on the browser side,
if successful won't show loading div.
If you don't do ssr (view page source) can see browser it is not sending back the data (just say loading div)as it has to evaluate the JS first.
If you are doing SCO you should use SSR. [4.00]
1 reason bcos it doesn't need to evaulate the JS first, the data will just show up.

Rules for SSR or not:
If the data I'm using needs to be found by Google, SSR it. If you want the data to be searchable. In this case Posts on HomePage.
If data is static e.g login etc don't need SSR.
Only need SSR if doing queries on that page, then you need to think about if that querie's content is important to SCO or not.

Example:

me -> browser http://localhost:3000
-> makes a request to our next.js server
-> which then makes a request to our graphql server localhost:5000
-> building the HTML
-> then sending it back to client(browser)

--- urql ---

any time want to access Urql on a page, wrap the component with the following:
export default withUrqlClient(createUrqlClient)(Register)
then can decide whether that page needs SSR or not , e.g.
export default withUrqlClient(createUrqlClient, { ssr: true })(Index)

cmd shift p organize imports

--- Setting up forgotten password ---

Nodemailer - good as allows you to set up test emails in development.

user: 'f555b6lwz7pmokr2@ethereal.email', // generated ethereal user
      pass: 'CHa3DTqS3XHJ6TMDcq', // generated ethereal password

-- NEXT.JS --
Convention in next.js to name your files like so if you want a variable in the url:

[token].tsx


---- TO DO ----

1. change default from on emails

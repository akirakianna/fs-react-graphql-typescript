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
Base error fragment used in reg login changepw

You can layer fragments on top of one another, 
eg created a Base user response fragment to house ... fragments as they are all user response types?/ user responses.
See user.ts file.

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

1. change default from email address on emails

--- Forgot PW Flow ---

Talk about the different parts in code, mutations, forgot pw, change pw token expiry etc.
Login, fg pw link - enter email - sends us email - [token.tsx][changepw.graphql][forgotpw.graphql]

---Switch to TYpeORM due to lack of foreign key - cannot easily attach user id? to column - would have to fetch every time.
Could use getReference - tutorial preferred TypeOrm so changed over to that.

--- mikroorm config ----

import { Post } from "./entities/Post"
import { __prod__ } from "./constants"
import { MikroORM } from "@mikro-orm/core"
import path from 'path'
import { User } from "./entities/User"

export default {
  migrations: {
    path: path.join(__dirname, './migrations'), 
    pattern: /^[\w-]+\d+\.[tj]s$/, 
  },
  entities: [Post, User],
  dbName: 'clreddit',
  type: 'postgresql',
  //! Only want to be true in development, when not in production I want debugging to be on
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0]

//* By casting as const means it will convert it to the correct type - makes it more specific.
//* Otherwise will complain when you import it (index.ts) - it was reading dbName and type as strings before.
//! However, by casting using Parameters (from MikroORM) - the parameters of the type (in this case the function).
//* Parameters returns an array, so we only want to return the first result.
//* Return the type that init expects as its first parameter.


TypeORM relationships ----

Between entities.

Post entity -
Setting up a many-to-one : a single user can post many posts.


Add create post form validation.

// CREATING GLOBAL ERROR FOR PROJECT
https://github.com/formidablelabs/urql/issues/225
createUrqlClient.ts


-- CUSTOM HOOK --
useIsAuth
Split the code out into its own hook so I can use wherever I want to make sure the user is logged in and has access to that page.


--- token.tsx ---
using query parameters - chnaged some code in token.tsx file.
const response = await changePassword({
            newPassword: values.newPassword,
            token: 
            // Getting the token this way allowed me to remove getInitialProps function below
            typeof router.query.token === 'string' ? router.query.token : ''
          })
          better to use router.query.token
is better than using getInitialProps as gip, next.js if some pages don't use gip, it will make the page static and optimize it.
if you did need to ssr the page based off of a query param then you would use gip.


-- Adding pagination --

see post.ts resolver

-- Dummy Data --
mockaroo - create db with columns with info you want for your db
matching the fields up to our field names in our Post entitiy

Creating a migration for our 'dummy' data:
npx typeorm migration:create -n FakePosts
Migration /Users/kiannalove/development/fs-react-graphql-typescript/1599837924256-FakePosts.ts has been generated successfully.
inserted sql into our typeorm migration
index.ts:
  const conn = await createConnection({
    type: 'postgres',
    database: 'clreddit2',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    //* will create the tables automatically for you
    synchronize: true,
    entities: [Post, User]
  })
  await conn.runMigrations()
  Need to tell typeorm where the migrations are - to do so add migrations array to conn:


--- bug with sql ----
needs to have "" around it or else it doesn't read the Uppercase characters


-- tips --
//* limit amount of text shown for larger posts
<Text mt={4}>{p.text.slice(0, 50)}</Text>
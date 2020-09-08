import 'reflect-metadata'
import { __prod__, COOKIE_NAME } from "./constants"
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from "type-graphql"
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'
import { User } from './entities/User'
import { createConnection } from 'typeorm'
import { Post } from './entities/Post'


//* TypeORM setup.

const main = async () => {
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

  const app = express()

  //* Order matters - goes between app and middleware. The order that you add Express middleware is the order they will run.
  //! Important because I will be using the session middleware inside of the apollo middleware.
  const RedisStore = connectRedis(session)
  const redis = new Redis()
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        //! Can change this (connect-redis doc) to set an expiry time
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, //cannot access the cookie in the front-end
        sameSite: 'lax', //protecting csrf
        secure: __prod__ // cookie only works in https, set to prod as dev (localhost) does not use https
      },
      saveUninitialized: false,
      //! Pop this is ENV file later
      secret: 'catkettle',
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    //* context is a special obj which is avalable to all of the resolvers.
    context: ({ req, res }) => ({ req, res, redis })
  })

  apolloServer.applyMiddleware({
    app,
    cors: false
  })

  app.listen(5000, () => {
    console.log('Server started on localhost:5000')
  })
}

main().catch((err) => {
  console.error(err)
})




//* MikroORM setup.

// const main = async () => {
//   // //* When server starts send test email
//   // sendEmail("kianna@kianna.com", "hello")
//   //!Connect to the db
//   const orm = await MikroORM.init(mikroConfig)
//   // orm.em.nativeDelete(User, {})
//   //! Run migrations
//   await orm.getMigrator().up()
//   //! Run SQL
//   //* To create a post and insert into our db - create > post object > field
//   //* At this point it isn't doing anything with the db, I have just created a new instance of Post.
//   // const post = orm.em.create(Post, { title: 'First post' })
//   // //* The following will insert this new Post instance into my db:
//   // await orm.em.persistAndFlush(post)
//   //* Can also do the following
//   // await orm.em.NativeInsert(Post, { title: 'First post' })
//   //* See what posts are in the db.
//   // const posts = await orm.em.find(Post, {})
//   // console.log(posts)
//   const app = express()

//   //* Order matters - goes between app and middleware. The order that you add Express middleware is the order they will run.
//   //! Important because I will be using the session middleware inside of the apollo middleware.
//   const RedisStore = connectRedis(session)
//   const redis = new Redis()
//   app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
//   })
//   )
//   app.use(
//     session({
//       name: COOKIE_NAME,
//       store: new RedisStore({
//         client: redis,
//         //! Can change this (connect-redis doc) to set an expiry time
//         disableTouch: true
//       }),
//       cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
//         httpOnly: true, //cannot access the cookie in the front-end
//         sameSite: 'lax', //protecting csrf
//         secure: __prod__ // cookie only works in https, set to prod as dev (localhost) does not use https
//       },
//       saveUninitialized: false,
//       //! Pop this is ENV file later
//       secret: 'catkettle',
//       resave: false,
//     })
//   )

//   const apolloServer = new ApolloServer({
//     schema: await buildSchema({
//       resolvers: [HelloResolver, PostResolver, UserResolver],
//       validate: false
//     }),
//     //* context is a special obj which is avalable to all of the resolvers.
//     context: ({ req, res }) => ({ em: orm.em, req, res, redis })
//   })

//   apolloServer.applyMiddleware({
//     app,
//     cors: false
//   })

//   app.listen(5000, () => {
//     console.log('Server started on localhost:5000')
//   })
// }

// main().catch((err) => {
//   console.error(err)
// })


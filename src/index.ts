import 'reflect-metadata'
import { MikroORM } from "@mikro-orm/core"
import { __prod__ } from "./constants"
import { Post } from "./entities/Post"
import mikroConfig from './mikro-orm.config'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from "type-graphql"
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'

//* MikroORM setup.

const main = async () => {
  //!Connect to the db
  const orm = await MikroORM.init(mikroConfig)
  //! Run migrations
  await orm.getMigrator().up()
  //! Run SQL
  //* To create a post and insert into our db - create > post object > field
  //* At this point it isn't doing anything with the db, I have just created a new instance of Post.
  // const post = orm.em.create(Post, { title: 'First post' })
  // //* The following will insert this new Post instance into my db:
  // await orm.em.persistAndFlush(post)
  //* Can also do the following
  // await orm.em.NativeInsert(Post, { title: 'First post' })
  //* See what posts are in the db.
  // const posts = await orm.em.find(Post, {})
  // console.log(posts)
  const app = express()
  
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    //* context is a special obj which is avalable to all of the resolvers.
    context: () => ({ em: orm.em })
  })

  apolloServer.applyMiddleware({ app })

  app.listen(5000, () => {
    console.log('Server started on localhost:5000')
  })
}

main().catch((err) => {
  console.error(err)
})







console.log('hello world!')
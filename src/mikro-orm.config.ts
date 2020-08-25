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


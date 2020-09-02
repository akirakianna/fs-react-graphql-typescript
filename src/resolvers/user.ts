import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql'
import { User } from '../entities/User'
import { MyContext } from 'src/types'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegister } from '../utils/validateRegister'

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em }: MyContext
  ) {
    // const user = await em.findOne(User, { email })
    return true
  }

  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ) {
    // User is not logged in
    if (!req.session.userId) {
      return null
    }
    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
   
  ): Promise<UserResponse> {
    const errors = validateRegister(options)
    if (errors) {
      return { errors }
    }

    const hashedPassword = await argon2.hash(options.password)
    let user
    try {
      //! Using Knex instead of MikroORM here to build a query due to em.flush() error.
      //* Saving user to DB.
      //* I called it createdAt, updatedAt but MikroOrm adds underscores
      //* Knex doesn't know about this, so have to add them in here so it knows what the column 
      //* name is in the db.
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*')
      user = result[0]
    } catch (err) {
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
    // Store user id session
    // This sets a cookie on the user and keeps them logged in
    req.session.userId = user.id
    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    //* Conditionally finding a user, depending on whether there is an @ present.
    const user = await em.findOne(User, usernameOrEmail.includes('@')
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail }
    )
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'That username does not exist.'
          }
        ]
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Incorrect password!'
          }
        ]
      }
    }

    req.session.userId = user.id

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  logout(
    // *The destroy func. will remove the session from Redis.
    //! To also clear the cookie, add res object and use clearCookie function with cookie name.
    @Ctx() { req, res }: MyContext
  ) {
    // The resolver will wait for the promise to finish, then wait for the callback to finish.
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        //! If only want to destro cookie once successfully logged out move down to resolve(true)
        res.clearCookie(COOKIE_NAME)
        // If there is a problem trying to destroy the session
        // console.log to see what the issue is
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        resolve(true)
      }))
  }
}
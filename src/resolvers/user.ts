import { Resolver, Mutation, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql'
import { User } from '../entities/User'
import { MyContext } from 'src/types'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME, FORGOT_PW_PREFIX } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegister } from '../utils/validateRegister'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'

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
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Ctx() { redis, em, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Password length must be greater than 3 characters.'
          }
        ]
      }
    }

    const userId = await redis.get(FORGOT_PW_PREFIX + token)
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token is invalid or expired.'
          }
        ]
      }
    }

    const user = await em.findOne(User, { id: parseInt(userId) })

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User no longer exists.'
          }
        ]
      }
    }
    
    //* Updating user with new pw and saving to db.
    user.password = await argon2.hash(newPassword)
    await em.persistAndFlush(user)

    //* Auto login user once updated/ changed pw.
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    // check if user exists
    const user = await em.findOne(User, { email })
    if (!user) {
      // the email is not in the db
      // you don't want to highlight if that email is not in the db, so can return true instead of false
      return true
    }

    //uuid generates a random & unique string 
    //! 1. Creating token
    const token = v4()

    //specify key
    await redis.set(
      //! 2. Storing the token in Redis
      FORGOT_PW_PREFIX + token,
      //! 4. Will look up the value to get the user id
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    ) // 3 days to reset your pw
    //! 3. Whenever the user changes their pw, the token will be sent back to us here
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    )
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
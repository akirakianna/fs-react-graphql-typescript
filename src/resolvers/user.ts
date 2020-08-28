import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType, Query } from 'type-graphql'
import { User } from '../entities/User'
import { MyContext } from 'src/types'
import argon2 from 'argon2'

//* A different way of writing resolver 1.18
//* Inputs can be reused - e.g same ones for register and login
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

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
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em }: MyContext
  ) {
    console.log('Session: ', req.session)
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
    //! Adding custom validation
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Username length must be greater than 2 characters."
          }
        ]
      }
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "Password length must be greater than 3 characters."
          }
        ]
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    })
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
  // Store user id session
  // This sets a cookie on the user and keeps them logged in
  req.session.userId = user.id
  return { user } 
}

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: 'That username does not exist.'
          }
        ]
      }
    }
    const valid = await argon2.verify(user.password, options.password)
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
}
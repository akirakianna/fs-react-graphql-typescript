import { MiddlewareFn } from "type-graphql"
import { MyContext } from "../types"

//* MiddleWareFn special function from GraphQL, used here to check if the user is authenticated.
//! Middleware runs beforen the resolver.
//! Passing in context so it knows the type of context.

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error('Not authenticated')
  }

  return next()
}
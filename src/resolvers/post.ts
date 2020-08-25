import { Resolver, Query, Ctx, Arg, Int, Mutation } from 'type-graphql'
import { Post } from '../entities/Post'
import { MyContext } from 'src/types'

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }
  //! Query is for gettin data
  @Query(() => Post, { nullable: true })
  post(
    //! id is TypeScript type, GraphQL type is Int.
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  //!Mutation is for changing (changing on the server, e.g create, edit, delete)
  @Mutation(() => Post)
  async createPost(
    @Arg('title', () => String) title: string,
    @Ctx() { em }: MyContext): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }
}
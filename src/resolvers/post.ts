import { Resolver, Query, Ctx, Arg, Mutation } from 'type-graphql'
import { Post } from '../entities/Post'
import { MyContext } from 'src/types'


//* CRUD through GraphQL *//

@Resolver()
export class PostResolver {

  //* Return all posts
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }

  //* Get a single post by id
  //! Query is for getting data
  @Query(() => Post, { nullable: true })
  post(
    //! id is TypeScript type, GraphQL type is Int.
    @Arg('id') id: number,
    @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  //* Create a new post
  //!Mutation is for changing (changing on the server, e.g create, edit, delete)
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  //* Edit a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id })
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }
    return post
  }

  //* Delete a post
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    await em.nativeDelete(Post, { id })
    return true
  }
}
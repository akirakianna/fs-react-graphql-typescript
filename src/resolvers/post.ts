import { Resolver, Query, Arg, Mutation } from 'type-graphql'
import { Post } from '../entities/Post'

//* CRUD through GraphQL *//

@Resolver()
export class PostResolver {

  //* Return all posts
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find()
  }

  //* Get a single post by id
  //! Query is for getting data
  @Query(() => Post, { nullable: true })
  post(
    //! id is TypeScript type, GraphQL type is Int.
    @Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  //* Create a new post
  //!Mutation is for changing (changing on the server, e.g create, edit, delete)
  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string): Promise<Post> {
      //* This is 2 SQL queries - 1 to save/ insert, the other to select it.
    return Post.create({ title }).save()
  }

  //* Edit a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title', () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id)
    if (!post) {
      return null
    }
    if (typeof title !== 'undefined') {
      await Post.update({ id }, { title })
    }
    return post
  }

  //* Delete a post
  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number): Promise<boolean> {
    await Post.delete(id)
    return true
  }
}
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware
} from 'type-graphql'
import { Post } from '../entities/Post'
import { MyContext } from 'src/types'
import { isAuth } from '../middleware/isAuth'

//* CRUD through GraphQL *//

// InputType handy to use when have multiple feilds for one query
@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

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
    //! id is TypeScript type
    @Arg('id') id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }

  //* Create a new post
  //!Mutation is for changing (changing on the server, e.g create, edit, delete)
  @Mutation(() => Post)
  //! Catch users that are not logged in
  @UseMiddleware(isAuth)
  async createPost(
    @Arg('input') input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      originalPosterId: req.session.userId
    }).save()
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
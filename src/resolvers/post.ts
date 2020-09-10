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
import { getConnection } from 'typeorm'

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
  // adding cursor based pagination, uses location - e.g I want all posts after this point.
  // need to pick your cursor based on how you are sorting your list, e.g new.
  async posts(
    @Arg('limit') limit: number,
    // string will be a date that the posts are created
    //! The very first time we use fetch posts we're not going to have the cursor 
    //! so need to make it nullable (and explicitly set the type)
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    // setting a max limit
    const realLimit = Math.min(50, limit)
    //* Using TypeORM Select query builder instead of Post.find() as more complex.
    return ( getConnection()
    .getRepository(Post)
    .createQueryBuilder("p")
    .where('"createdAt" > :cursor', { cursor })
    //* Can add second param (ascending, descending)
    .orderBy('"createdAt"', "DESC")
    // there is a limit method in typeorm but the docs recommend using take when doing pagination
    .take(realLimit)
    .getMany()
   )
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
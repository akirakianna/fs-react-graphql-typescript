import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Post } from "./Post";

//* Creating entitites with TypeORM

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number
  
  @Field()
  @Column({ unique: true })
  username!: string

  @Field()
  @Column({ unique: true })
  email!: string

  //* By removing @Field means it can't be selected (by GraphQL ?), will be a hash pw and only being created as a db column.
  @Column()
  password!: string

  @OneToMany(() => Post, (post) => post.originalPosterId)
  posts: Post[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}

//* MikroORM

// @ObjectType()
// @Entity()
// export class User {
//   @Field()
//   @PrimaryKey()
//   id!: number
  
//   @Field(() => String)
//   @Property({ type: 'date' })
//   createdAt = new Date()

//   @Field(() => String)
//   @Property({ type: 'date', onUpdate: () => new Date() })
//   updatedAt = new Date()
  
//   @Field()
//   @Property({ type: 'text', unique: true })
//   username!: string

//   @Field()
//   @Property({ type: 'text', unique: true })
//   email!: string

//   //* By removing @Field means it can't be selected, will be a hash pw and only being created as a db column.
//   @Property({ type: 'text', })
//   password!: string
// }

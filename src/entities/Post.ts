import { ObjectType, Field, Int } from "type-graphql";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, ManyToOne } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number
  
  //* @Column just decorates it as a regular column makes it a db column, without it it is just a field in the class.
  //* @Field - can choose what to expose or hide.
  @Field()
  @Column()
  title!: string
  
  @Field()
  @Column()
  text!: string
  
  @Field()
  @Column({ type: 'int', default: 0 })
  points!: number

  @Field()
  @Column()
  originalPosterId: number

  //* Point to type we want to be connected to, in this case our user.
  //* This is setting up a foreign key to our user table. We are storing that foreignkey in originalPosterId column.
  @ManyToOne(() => User, user => user.posts)
  //* The name here effects/ will be the name of the foreignkey.
  originalPoster: User

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
// export class Post {
//   //* id, createdAt, updatedAt, titel - 4 fields - these correspond to columns in our db table.
//   @Field(() => Int)
//   @PrimaryKey()
//   id!: number
  
//   @Field(() => String)
//   @Property({ type: 'date' })
//   createdAt = new Date()

//   @Field(() => String)
//   @Property({ type: 'date', onUpdate: () => new Date() })
//   updatedAt = new Date()
  
//   //* @Property just decorates it as a regular column makes it a db column, without it it is just a field in the class.
//   //* @Field - can choose what to expose or hide.
//   @Field()
//   @Property({ type: 'text' })
//   title!: string
// }
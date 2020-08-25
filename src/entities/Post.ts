import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field, Int } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
  //* id, createdAt, updatedAt, titel - 4 fields - these correspond to columns in our db table.
  @Field(() => Int)
  @PrimaryKey()
  id!: number
  
  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date()

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date()
  
  //* @Property just decorates it as a regular column makes it a db column, without it it is just a field in the class.
  //* @Field - can choose what to expose or hide.
  @Field()
  @Property({ type: 'text' })
  title!: string
}
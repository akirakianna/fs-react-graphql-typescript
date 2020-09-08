import { ObjectType, Field } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";

//* Creating entitites with TypeORM

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number
  
  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
  
  @Field()
  @Column({ unique: true })
  username!: string

  @Field()
  @Column({ unique: true })
  email!: string

  //* By removing @Field means it can't be selected, will be a hash pw and only being created as a db column.
  @Column()
  password!: string
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

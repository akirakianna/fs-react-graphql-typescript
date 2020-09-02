import { InputType, Field } from 'type-graphql';
//* A different way of writing resolver 1.18
//* Inputs can be reused - e.g same ones for register and login
@InputType()
export class UsernamePasswordInput {
  @Field()
  email: string;


  @Field()
  username: string;


  @Field()
  password: string;
}

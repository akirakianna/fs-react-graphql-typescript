import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput"

//! Custom Validation

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: "email",
        message: "Invalid email address!"
      }
    ]
  }
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "Username length must be greater than 2 characters."
      }
    ]
  }
  if (options.username.includes('@')) {
    return [
      {
        field: "username",
        message: "Username cannot include @."
      }
    ]
  }
  if (options.password.length <= 3) {
    return [
      {
        field: "password",
        message: "Password length must be greater than 3 characters."
      }
    ]
  }
  return null
}
# fs-react-graphql-typescript

ts-node is slower, running TypeScript with the Watch command instead.
It takes the TypeScript code and turns it in to JavaScript (see dist folder)

nodemon - so we don't have to run command every time. It listens for any changes we make in file and re-run it.

postgresql problems

When trying to set up migrations got the following error:
error: role "postgres" does not exist

Fixed by createuser -s -r postgres - error was because the postgresql role hadn't been created.
Roles are how postgresql maintains db permissions.

Dist folder doesn't update - delete then run yarn watch to create again (no duplications).

Use await when data is returning a promise.

Playground (devtool) - GraphQL - TypeScript

crud - reading a post, updating a post, deleting a post etc.

GraphQL splits queries and mutations so have to specify mutation on playground..
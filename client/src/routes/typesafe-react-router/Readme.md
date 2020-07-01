# typesafe-react-router (adjusted)

This part is based heavily upon the [typesafe-react-route][typesafe-react-router-github] by AveroLLC. However, the following changes were made during this reimplementation:

- **Add the support for optional path parameters**

  This is achieved by changing the `param()` function and the `RouteParams` type. This also add a new `OptionalParamsFromPathArray` type and adjusts the `PathParam` and related types.

- **Use class instead of function**

  Convert `route` and corresponding functions into a class `Route`. It takes in the `PathParts` as arguments of the constructor.

- **Remove all query related stuff**

  The main reason is that it is not needed in this project as of the time of adjusting [typesafe-react-route][typesafe-react-router-github] and therefore the `query-string` library is not required aswell.

- **Change file structure**

  Due to the changes above the file structure also changed. This includes the renaming of files (`route.ts` to `Route.ts`), restructing the folder itself (moving `types.ts` from `interfaces/` folder) and removing files and folder (`interfaces/`, `parse.ts`, `guards.ts`, `route.test.ts`).

The license used by [typesafe-react-route][typesafe-react-router-github] itself can be found in the [LICENSE.txt](./LICENSE.txt).

[typesafe-react-router-github]: https://github.com/AveroLLC/typesafe-react-router

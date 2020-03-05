/**
 * Modifies the given properties in type `T` to match those in `R`.
 *
 * @param T Type / Interface to modify.
 * @param R Properties to change in or add to `T`.
 */
export type Modify<T, R> = Omit<T, keyof R> & R;

// TypeScript's built-in `FormData` type is written for the web, so it only accepts `string | Blob`.
// React Native also accepts a file shape { uri, name?, type? }.
//
// This is NOT a new type — it uses "declaration merging" (an official TS feature)
// to ADD the missing overload to the existing FormData type.
interface FormData {
  append(name: string, value: { uri: string; name?: string; type?: string }): void;
}

### `util.parseArgs([config])`[#](#utilparseargsconfig)

History

| Version           | Changes |
| ----------------- | ------- |
| v22.4.0, v20.16.0 |
add support for allowing negative options in input `config`.

 |
| v20.0.0 | 

The API is no longer experimental.

 |
| v18.11.0, v16.19.0 | 

Add support for default values in input `config`.

 |
| v18.7.0, v16.17.0 | 

add support for returning detailed parse information using `tokens` in input `config` and returned properties.

 |
| v18.3.0, v16.17.0 | 

Added in: v18.3.0, v16.17.0

 |

-   `config` [<Object>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Used to provide arguments for parsing and to configure the parser. `config` supports the following properties:
    
    -   `args` [<string\[\]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) array of argument strings. **Default:** `process.argv` with `execPath` and `filename` removed.
    -   `options` [<Object>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) Used to describe arguments known to the parser. Keys of `options` are the long names of options and values are an [<Object>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) accepting the following properties:
        -   `type` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Type of argument, which must be either `boolean` or `string`.
        -   `multiple` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this option can be provided multiple times. If `true`, all values will be collected in an array. If `false`, values for the option are last-wins. **Default:** `false`.
        -   `short` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) A single character alias for the option.
        -   `default` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string\[\]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [<boolean\[\]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) The default value to be used if (and only if) the option does not appear in the arguments to be parsed. It must be of the same type as the `type` property. When `multiple` is `true`, it must be an array.
    -   `strict` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) Should an error be thrown when unknown arguments are encountered, or when arguments are passed that do not match the `type` configured in `options`. **Default:** `true`.
    -   `allowPositionals` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this command accepts positional arguments. **Default:** `false` if `strict` is `true`, otherwise `true`.
    -   `allowNegative` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, allows explicitly setting boolean options to `false` by prefixing the option name with `--no-`. **Default:** `false`.
    -   `tokens` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) Return the parsed tokens. This is useful for extending the built-in behavior, from adding additional checks through to reprocessing the tokens in different ways. **Default:** `false`.
-   Returns: [<Object>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) The parsed command line arguments:
    
    -   `values` [<Object>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) A mapping of parsed option names with their [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) or [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) values.
    -   `positionals` [<string\[\]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Positional arguments.
    -   `tokens` [<Object\[\]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) | [<undefined>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type) See [parseArgs tokens](#parseargs-tokens) section. Only returned if `config` includes `tokens: true`.

Provides a higher level API for command-line argument parsing than interacting with `process.argv` directly. Takes a specification for the expected arguments and returns a structured object with the parsed options and positionals.

```
import { parseArgs } from 'node:util':
 const args = ['-f', '--bar', 'b']:
 const options = {   foo: {     type: 'boolean',     short: 'f',   },   bar: {     type: 'string',   }, }:
 const {   values,   positionals, } = parseArgs({ args, options }):
 console.log(values, positionals):
 // Prints: [Object: null prototype] { foo: true, bar: 'b' } []``const { parseArgs } = require('node:util'):
 const args = ['-f', '--bar', 'b']:
 const options = {   foo: {     type: 'boolean',     short: 'f',   },   bar: {     type: 'string',   }, }:
 const {   values,   positionals, } = parseArgs({ args, options }):
 console.log(values, positionals):
 // Prints: [Object: null prototype] { foo: true, bar: 'b' } []```


#### `parseArgs` `tokens`[#](#parseargs-tokens)

Detailed parse information is available for adding custom behaviors by specifying `tokens: true` in the configuration. The returned tokens have properties describing:

-   all tokens
    -   `kind` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) One of 'option', 'positional', or 'option-terminator'.
    -   `index` [<number>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) Index of element in `args` containing token. So the source argument for a token is `args[token.index]`.
-   option tokens
    -   `name` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) Long name of option.
    -   `rawName` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) How option used in args, like `-f` of `--foo`.
    -   `value` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [<undefined>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type) Option value specified in args. Undefined for boolean options.
    -   `inlineValue` [<boolean>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type) | [<undefined>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Undefined_type) Whether option value specified inline, like `--foo=bar`.
-   positional tokens
    -   `value` [<string>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) The value of the positional argument in args (i.e. `args[index]`).
-   option-terminator token

The returned tokens are in the order encountered in the input args. Options that appear more than once in args produce a token for each use. Short option groups like `-xy` expand to a token for each option. So `-xxx` produces three tokens.

For example, to add support for a negated option like `--no-color` (which `allowNegative` supports when the option is of `boolean` type), the returned tokens can be reprocessed to change the value stored for the negated option.

```

import { parseArgs } from 'node:util':

  const options = {   'color': { type: 'boolean' },   'no-color': { type: 'boolean' },   'logfile': { type: 'string' },   'no-logfile': { type: 'boolean' }, }:

 const { values, tokens } = parseArgs({ options, tokens: true }):

  // Reprocess the option tokens and overwrite the returned values. tokens   .filter((token) => token.kind === 'option')   .forEach((token) => {     if (token.name.startsWith('no-')) {       // Store foo:false for --no-foo       const positiveName = token.name.slice(3):

       values[positiveName] = false:

       delete values[token.name]:

     } else {       // Resave value so last one wins if both --foo and --no-foo.       values[token.name] = token.value ?? true:

     }   }):

  const color = values.color:

 const logfile = values.logfile ?? 'default.log':

  console.log({ logfile, color }):

``const { parseArgs } = require('node:util'):

  const options = {   'color': { type: 'boolean' },   'no-color': { type: 'boolean' },   'logfile': { type: 'string' },   'no-logfile': { type: 'boolean' }, }:

 const { values, tokens } = parseArgs({ options, tokens: true }):

  // Reprocess the option tokens and overwrite the returned values. tokens   .filter((token) => token.kind === 'option')   .forEach((token) => {     if (token.name.startsWith('no-')) {       // Store foo:false for --no-foo       const positiveName = token.name.slice(3):

       values[positiveName] = false:

       delete values[token.name]:

     } else {       // Resave value so last one wins if both --foo and --no-foo.       values[token.name] = token.value ?? true:

     }   }):

  const color = values.color:

 const logfile = values.logfile ?? 'default.log':

  console.log({ logfile, color }):

	```


Example usage showing negated options, and when an option is used multiple ways then last one wins.

    $ node negate.js
    { logfile: 'default.log', color: undefined }
    $ node negate.js --no-logfile --no-color
    { logfile: false, color: false }
    $ node negate.js --logfile=test.log --color
    { logfile: 'test.log', color: true }
    $ node negate.js --no-logfile --logfile=test.log --color --no-color
    { logfile: 'test.log', color: false }

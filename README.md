# basic-csv-parser
[![NPM](https://nodei.co/npm/basic-csv-parser.png?compact=true)](https://nodei.co/npm/basic-csv-parser/)

lightweight (1kb gzip, no dependencies) csv string parser for the browser,
validated against an applicable subset of the [PapaParse](https://github.com/mholt/PapaParse) test suite.

# Example
check this [codesandbox](https://codesandbox.io/embed/basic-csv-parser-example-ct1kl?expanddevtools=1&fontsize=14&hidenavigation=1)

# API v1
```ts
/**
 * @return a csv string parser as specified by the given `config` options object
 */
export declare function getCsvParser<T = string[]>(
  config?: Partial<CSV_PARSER_SPEC>
): (input: string) => T[]

export interface CSV_PARSER_SPEC {
  /**
   * when true, the first line is interpreted as a header (list of field names),
   * in which case the parsed entries are objects
   * instead of a list of field values.
   * default: false
   */
  header: boolean
  /**
   * field delimiter character,
   * default: `,`
   */
  delimiter: string
  /**
   * escape character,
   * default: `"`
   */
  escape: string
  /**
   * called for each parsed field,
   * with its index in the parsed record.
   * defaults to a function that unescapes the field string
   */
  postprocess: (field: string, index?: number) => string
}
```

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2019 ZenyWay S.A.S., Stephane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.

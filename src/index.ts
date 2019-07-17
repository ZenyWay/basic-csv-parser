/**
 * Copyright 2019 ZenyWay S.A.S., Stephane M. Catala
 * @author Stephane M. Catala
 * @license Apache Version 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */

const DEFAULTS = {
  delimiter: ',',
  escape: '"',
  postprocess (escape: string) {
    const escapedDoubleQuoteRegExp = new RegExp(`${escapeRegExp(escape)}"`, 'g')
    return (field: string) => field.replace(escapedDoubleQuoteRegExp, '"') // unescape
  }
}

export interface CSV_PARSER_SPEC extends CORE_CSV_PARSER_SPEC {
  header: boolean
}

export interface CORE_CSV_PARSER_SPEC extends CSV_TOKENIZER_SPEC {
  postprocess: (field: string, index?: number) => string
}

export interface CSV_TOKENIZER_SPEC {
  delimiter: string
  escape: string
}

export function getCsvParser<T = string[]> (
  config = {} as Partial<CSV_PARSER_SPEC>
) {
  const { header, ...params } = config
  const parse = getCoreCsvParser(params)
  return !header
    ? parse
    : function (input: string) {
        const data = parse(input)
        return foldToObjects<T>(data.shift(), data)
      }
}

const NEWLINE_TOKENS = ['\r\n', '\r', '\n']

function getCoreCsvParser (config: Partial<CORE_CSV_PARSER_SPEC>) {
  const delimiter = config.delimiter || DEFAULTS.delimiter
  const escape = config.escape || DEFAULTS.escape
  const postprocess = config.postprocess || DEFAULTS.postprocess(escape)
  const CSV_TOKENIZER_REGEXP = getCsvTokenizerRegExp({ escape, delimiter })
  const splitEntries = split(...NEWLINE_TOKENS)
  const splitFields = split(delimiter)

  return (input: string) =>
    !input
      ? []
      : splitEntries(input.match(CSV_TOKENIZER_REGEXP))
          .filter(entry => entry.length)
          .map(entry =>
            splitFields(entry).map((field, index) =>
              postprocess(trimQuotes(field[0] || ''), index)
            )
          )
}

function getCsvTokenizerRegExp (spec: CSV_TOKENIZER_SPEC) {
  const escape = escapeRegExp(spec.escape)
  const delimiter = escapeRegExp(spec.delimiter)
  return new RegExp(
    `"(?:${escape}"|[^"])*"|(?:${escape}"|[^\r\n${delimiter}"])+|${delimiter}|\r\n|\r|\n`,
    'g'
  )
}

function foldToObjects<T = {}> (keys: string[], entries: string[][]) {
  const key = keys ? index => keys[index] || index : index => index
  return entries.map(entry =>
    entry.reduce(
      function (props, value, index) {
        props[key(index)] = value
        return props
      },
      Object.create(null) as T
    )
  )
}

function split (...delimiters: string[]) {
  return function (tokens: string[]) {
    const { entries, entry } = tokens.reduce(
      ({ entries, entry }, token) =>
        delimiters.indexOf(token) >= 0
          ? { entries: entries.concat([entry]), entry: [] }
          : { entries, entry: entry.concat(token) },
      { entries: [] as string[][], entry: [] as string[] }
    )
    return entries.concat([entry])
  }
}

function trimQuotes (token: string) {
  return token.startsWith('"') && token.endsWith('"')
    ? token.slice(1, -1)
    : token
}

/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping */
function escapeRegExp (regexp: string) {
  return regexp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

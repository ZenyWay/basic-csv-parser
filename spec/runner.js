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
 *
 * extracted and adapted from:
 * Papa Parse v5.0.0
 * https://github.com/mholt/PapaParse
 * License: MIT
 */

const { getCsvParser } = require('../')

exports.runCsvParserTests = function runCsvParserTests (t, specs) {
  for (var i = 0; i < specs.length; i++) {
    runCsvParserTest(t, specs[i])
  }
  t.end()
}

function runCsvParserTest (t, spec) {
  const config = spec.config || {}
  const disabled =
    spec.disabled ||
    spec.expected.errors.length || // skip tests without compliant input
    config.comments ||
    config.dynamicTyping ||
    config.fastMode ||
    config.preview ||
    config.skipEmptyLines ||
    config.transform ||
    isFunction(config.delimiter) ||
    (config.quoteChar && config.quoteChar !== '"')
  // console.log(spec.description, config)
  if (disabled) return t.skip(spec.description)
  t.test(spec.description, function (st) {
    try {
      const { delimiter, escapeChar, header, newline } = config
      const parse = getCsvParser({
        delimiter,
        escape: escapeChar,
        header,
        newline
      })
      const result = parse(spec.input)
      st.deepEqual(result, spec.expected.data)
    } catch (err) {
      st.fail(err && err.message)
    }
    st.end()
  })
}

function isFunction (val) {
  return typeof val === 'function'
}

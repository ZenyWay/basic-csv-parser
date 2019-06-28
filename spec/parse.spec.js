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

const { runCsvParserTests } = require('./runner')
const test = require('tape')
/*
const summarize = require('tap-summary')
test
  .createStream()
  .pipe(
    summarize({
      ansi: true,
      progress: true
    })
  )
  .pipe(require('browser-stdout')({ objectMode: true }))
*/
const RECORD_SEP = String.fromCharCode(30)
const UNIT_SEP = String.fromCharCode(31)

/*
test.createStream({ objectMode: true }).on('data', function(row) {
  if (row.skip || row.type === 'end' || row.ok) return
  console.log(
    row.type === 'test'
      ? `${row.id}: ${row.name}`
      : `${row.test}: ${JSON.stringify(row)}`
  )
})
*/

test('Parse Tests', t =>
  runCsvParserTests(t, [
    {
      description: 'Two rows, just \\r',
      input: 'A,b,c\rd,E,f',
      expected: {
        data: [['A', 'b', 'c'], ['d', 'E', 'f']],
        errors: []
      }
    },
    {
      description: 'Two rows, \\r\\n',
      input: 'A,b,c\r\nd,E,f',
      expected: {
        data: [['A', 'b', 'c'], ['d', 'E', 'f']],
        errors: []
      }
    },
    {
      description: 'Quoted field with \\r\\n',
      input: 'A,"B\r\nB",C',
      expected: {
        data: [['A', 'B\r\nB', 'C']],
        errors: []
      }
    },
    {
      description: 'Quoted field with \\r',
      input: 'A,"B\rB",C',
      expected: {
        data: [['A', 'B\rB', 'C']],
        errors: []
      }
    },
    {
      description: 'Quoted field with \\n',
      input: 'A,"B\nB",C',
      expected: {
        data: [['A', 'B\nB', 'C']],
        errors: []
      }
    },
    {
      description:
        'Quoted fields with spaces between closing quote and next delimiter',
      input: 'A,"B" ,C,D\r\nE,F,"G"  ,H',
      expected: {
        data: [['A', 'B', 'C', 'D'], ['E', 'F', 'G', 'H']],
        errors: []
      }
    },
    {
      description:
        'Quoted fields with spaces between closing quote and next new line',
      input: 'A,B,C,"D" \r\nE,F,G,"H"  \r\nQ,W,E,R',
      expected: {
        data: [
          ['A', 'B', 'C', 'D'],
          ['E', 'F', 'G', 'H'],
          ['Q', 'W', 'E', 'R']
        ],
        errors: []
      }
    },
    {
      description: 'Quoted fields with spaces after closing quote',
      input: 'A,"B" ,C,"D" \r\nE,F,"G"  ,"H"  \r\nQ,W,"E" ,R',
      expected: {
        data: [
          ['A', 'B', 'C', 'D'],
          ['E', 'F', 'G', 'H'],
          ['Q', 'W', 'E', 'R']
        ],
        errors: []
      }
    },
    {
      description: 'Mixed slash n and slash r should choose first as precident',
      disabled: true,
      notes: 'disabled because considered malformed',
      input: 'a,b,c\nd,e,f\rg,h,i\n',
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f\rg', 'h', 'i'], ['']],
        errors: []
      }
    },
    {
      description: 'Header row with one row of data',
      input: 'A,B,C\r\na,b,c',
      config: { header: true },
      expected: {
        data: [{ A: 'a', B: 'b', C: 'c' }],
        errors: []
      }
    },
    {
      description: 'Header row only',
      input: 'A,B,C',
      config: { header: true },
      expected: {
        data: [],
        errors: []
      }
    },
    {
      description: 'Row with too few fields',
      input: 'A,B,C\r\na,b',
      config: { header: true },
      expected: {
        data: [{ A: 'a', B: 'b' }],
        errors: [
          {
            type: 'FieldMismatch',
            code: 'TooFewFields',
            message: 'Too few fields: expected 3 fields but parsed 2',
            row: 0
          }
        ]
      }
    },
    {
      description: 'Row with too many fields',
      input: 'A,B,C\r\na,b,c,d,e\r\nf,g,h',
      config: { header: true },
      expected: {
        data: [
          { A: 'a', B: 'b', C: 'c', __parsed_extra: ['d', 'e'] },
          { A: 'f', B: 'g', C: 'h' }
        ],
        errors: [
          {
            type: 'FieldMismatch',
            code: 'TooManyFields',
            message: 'Too many fields: expected 3 fields but parsed 5',
            row: 0
          }
        ]
      }
    },
    {
      description: 'Row with enough fields but blank field at end',
      input: 'A,B,C\r\na,b,',
      config: { header: true },
      expected: {
        data: [{ A: 'a', B: 'b', C: '' }],
        errors: []
      }
    },
    {
      description:
        'Header rows are transformed when transformHeader function is provided',
      disabled: true,
      notes: 'unsupported feature',
      input: 'A,B,C\r\na,b,c',
      config: {
        header: true,
        transformHeader: function(header) {
          return header.toLowerCase()
        }
      },
      expected: {
        data: [{ a: 'a', b: 'b', c: 'c' }],
        errors: []
      }
    },
    {
      description:
        'Line ends with quoted field, first field of next line is empty using headers',
      input: 'a,b,"c"\r\nd,e,"f"\r\n,"h","i"\r\n,"k","l"',
      config: {
        header: true,
        newline: '\r\n'
      },
      expected: {
        data: [
          { a: 'd', b: 'e', c: 'f' },
          { a: '', b: 'h', c: 'i' },
          { a: '', b: 'k', c: 'l' }
        ],
        errors: []
      }
    },
    {
      description: 'Tab delimiter',
      input: 'a\tb\tc\r\nd\te\tf',
      config: { delimiter: '\t' },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Pipe delimiter',
      input: 'a|b|c\r\nd|e|f',
      config: { delimiter: '|' },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'ASCII 30 delimiter',
      input:
        'a' +
        RECORD_SEP +
        'b' +
        RECORD_SEP +
        'c\r\nd' +
        RECORD_SEP +
        'e' +
        RECORD_SEP +
        'f',
      config: { delimiter: RECORD_SEP },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'ASCII 31 delimiter',
      input:
        'a' +
        UNIT_SEP +
        'b' +
        UNIT_SEP +
        'c\r\nd' +
        UNIT_SEP +
        'e' +
        UNIT_SEP +
        'f',
      config: { delimiter: UNIT_SEP },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Bad delimiter (\\n)',
      disabled: true,
      input: 'a,b,c',
      config: { delimiter: '\n' },
      notes:
        'Should silently default to comma. Config assertion not supported.',
      expected: {
        data: [['a', 'b', 'c']],
        errors: []
      }
    },
    {
      description: 'Multi-character delimiter',
      input: 'a, b, c',
      config: { delimiter: ', ' },
      expected: {
        data: [['a', 'b', 'c']],
        errors: []
      }
    },
    {
      description: 'Callback delimiter',
      input: 'a$ b$ c',
      config: {
        delimiter: function(input) {
          return input[1] + ' '
        }
      },
      expected: {
        data: [['a', 'b', 'c']],
        errors: []
      }
    },
    {
      description: 'Dynamic typing converts numeric literals',
      input: '1,2.2,1e3\r\n-4,-4.5,-4e-5\r\n-,5a,5-2',
      config: { dynamicTyping: true },
      expected: {
        data: [[1, 2.2, 1000], [-4, -4.5, -0.00004], ['-', '5a', '5-2']],
        errors: []
      }
    },
    {
      description: 'Dynamic typing converts boolean literals',
      input: 'true,false,T,F,TRUE,FALSE,True,False',
      config: { dynamicTyping: true },
      expected: {
        data: [[true, false, 'T', 'F', true, false, 'True', 'False']],
        errors: []
      }
    },
    {
      description: "Dynamic typing doesn't convert other types",
      input: 'A,B,C\r\nundefined,null,[\r\nvar,float,if',
      config: { dynamicTyping: true },
      expected: {
        data: [
          ['A', 'B', 'C'],
          ['undefined', 'null', '['],
          ['var', 'float', 'if']
        ],
        errors: []
      }
    },
    {
      description: 'Dynamic typing applies to specific columns',
      input: 'A,B,C\r\n1,2.2,1e3\r\n-4,-4.5,-4e-5',
      config: { header: true, dynamicTyping: { A: true, C: true } },
      expected: {
        data: [{ A: 1, B: '2.2', C: 1000 }, { A: -4, B: '-4.5', C: -0.00004 }],
        errors: []
      }
    },
    {
      description: 'Dynamic typing applies to specific columns by index',
      input: '1,2.2,1e3\r\n-4,-4.5,-4e-5\r\n-,5a,5-2',
      config: { dynamicTyping: { 1: true } },
      expected: {
        data: [['1', 2.2, '1e3'], ['-4', -4.5, '-4e-5'], ['-', '5a', '5-2']],
        errors: []
      }
    },
    {
      description: 'Dynamic typing can be applied to `__parsed_extra`',
      input: 'A,B,C\r\n1,2.2,1e3,5.5\r\n-4,-4.5,-4e-5',
      config: {
        header: true,
        dynamicTyping: { A: true, C: true, __parsed_extra: true }
      },
      expected: {
        data: [
          { A: 1, B: '2.2', C: 1000, __parsed_extra: [5.5] },
          { A: -4, B: '-4.5', C: -0.00004 }
        ],
        errors: [
          {
            type: 'FieldMismatch',
            code: 'TooManyFields',
            message: 'Too many fields: expected 3 fields but parsed 4',
            row: 0
          }
        ]
      }
    },
    {
      description: 'Dynamic typing by indices can be determined by function',
      input: '001,002,003',
      config: {
        dynamicTyping: function(field) {
          return field % 2 === 0
        }
      },
      expected: {
        data: [[1, '002', 3]],
        errors: []
      }
    },
    {
      description: 'Dynamic typing by headers can be determined by function',
      input: 'A_as_int,B,C_as_int\r\n001,002,003',
      config: {
        header: true,
        dynamicTyping: function(field) {
          return /_as_int$/.test(field)
        }
      },
      expected: {
        data: [{ A_as_int: 1, B: '002', C_as_int: 3 }],
        errors: []
      }
    },
    {
      description: 'Dynamic typing converts empty values into NULL',
      input: '1,2.2,1e3\r\n,NULL,\r\n-,5a,null',
      config: { dynamicTyping: true },
      expected: {
        data: [[1, 2.2, 1000], [null, 'NULL', null], ['-', '5a', 'null']],
        errors: []
      }
    },
    {
      description: 'Custom transform function is applied to values',
      input: 'A,B,C\r\nd,e,f',
      config: {
        transform: function(value) {
          return value.toLowerCase()
        }
      },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Custom transform accepts column number also',
      input: 'A,B,C\r\nd,e,f',
      config: {
        transform: function(value, column) {
          if (column % 2) {
            value = value.toLowerCase()
          }
          return value
        }
      },
      expected: {
        data: [['A', 'b', 'C'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Custom transform accepts header name when using header',
      input: 'A,B,C\r\nd,e,f',
      config: {
        header: true,
        transform: function(value, name) {
          if (name === 'B') {
            value = value.toUpperCase()
          }
          return value
        }
      },
      expected: {
        data: [{ A: 'd', B: 'E', C: 'f' }],
        errors: []
      }
    },
    {
      description: 'Dynamic typing converts ISO date strings to Dates',
      input:
        'ISO date,long date\r\n2018-05-04T21:08:03.269Z,Fri May 04 2018 14:08:03 GMT-0700 (PDT)\r\n2018-05-08T15:20:22.642Z,Tue May 08 2018 08:20:22 GMT-0700 (PDT)',
      config: { dynamicTyping: true },
      expected: {
        data: [
          ['ISO date', 'long date'],
          [
            new Date('2018-05-04T21:08:03.269Z'),
            'Fri May 04 2018 14:08:03 GMT-0700 (PDT)'
          ],
          [
            new Date('2018-05-08T15:20:22.642Z'),
            'Tue May 08 2018 08:20:22 GMT-0700 (PDT)'
          ]
        ],
        errors: []
      }
    },
    {
      description: 'Blank line at beginning',
      input: '\r\na,b,c\r\nd,e,f',
      notes: 'blank lines are ignored.',
      config: { newline: '\r\n' },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Blank line in middle',
      input: 'a,b,c\r\n\r\nd,e,f',
      notes: 'blank lines are ignored.',
      config: { newline: '\r\n' },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Blank lines at end',
      input: 'a,b,c\nd,e,f\n\n',
      notes:
        'RFC4180 2.2. The last record in the file may or may not have an ending line break. blank lines are ignored.',
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Blank line in middle with whitespace',
      input: 'a,b,c\r\n \r\nd,e,f',
      expected: {
        data: [['a', 'b', 'c'], [' '], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'First field of a line is empty',
      input: 'a,b,c\r\n,e,f',
      expected: {
        data: [['a', 'b', 'c'], ['', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Last field of a line is empty',
      input: 'a,b,\r\nd,e,f',
      expected: {
        data: [['a', 'b', ''], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Other fields are empty',
      input: 'a,,c\r\n,,',
      expected: {
        data: [['a', '', 'c'], ['', '', '']],
        errors: []
      }
    },
    {
      description: 'Empty input string',
      input: '',
      expected: {
        data: [],
        errors: [
          {
            type: 'Delimiter',
            code: 'UndetectableDelimiter',
            message:
              "Unable to auto-detect delimiting character; defaulted to ','"
          }
        ]
      }
    },
    {
      description: 'Input is just the delimiter (2 empty fields)',
      input: ',',
      expected: {
        data: [['', '']],
        errors: []
      }
    },
    {
      description: 'Input is just a string (a single field)',
      input: 'Abc def',
      expected: {
        data: [['Abc def']],
        errors: [
          {
            type: 'Delimiter',
            code: 'UndetectableDelimiter',
            message:
              "Unable to auto-detect delimiting character; defaulted to ','"
          }
        ]
      }
    },
    {
      description: 'Preview 0 rows should default to parsing all',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i',
      config: { preview: 0 },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
        errors: []
      }
    },
    {
      description: 'Preview 1 row',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i',
      config: { preview: 1 },
      expected: {
        data: [['a', 'b', 'c']],
        errors: []
      }
    },
    {
      description: 'Preview 2 rows',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i',
      config: { preview: 2 },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Preview all (3) rows',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i',
      config: { preview: 3 },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
        errors: []
      }
    },
    {
      description: 'Preview more rows than input has',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i',
      config: { preview: 4 },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
        errors: []
      }
    },
    {
      description: 'Preview should count rows, not lines',
      input: 'a,b,c\r\nd,e,"f\r\nf",g,h,i',
      config: { preview: 2 },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f\r\nf', 'g', 'h', 'i']],
        errors: []
      }
    },
    {
      description: 'Preview with header row',
      notes:
        'Preview is defined to be number of rows of input not including header row',
      input: 'a,b,c\r\nd,e,f\r\ng,h,i\r\nj,k,l',
      config: { header: true, preview: 2 },
      expected: {
        data: [{ a: 'd', b: 'e', c: 'f' }, { a: 'g', b: 'h', c: 'i' }],
        errors: []
      }
    },
    {
      description: 'Empty lines',
      input: '\na,b,c\n\nd,e,f\n\n',
      notes:
        'RFC4180 2.2. The last record in the file may or may not have an ending line break. blank lines are ignored.',
      config: { delimiter: ',' },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Skip empty lines',
      input: 'a,b,c\n\nd,e,f',
      config: { skipEmptyLines: true },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Skip empty lines, with newline at end of input',
      input: 'a,b,c\r\n\r\nd,e,f\r\n',
      config: { skipEmptyLines: true },
      expected: {
        data: [['a', 'b', 'c'], ['d', 'e', 'f']],
        errors: []
      }
    },
    {
      description: 'Skip empty lines, with empty input',
      input: '',
      config: { skipEmptyLines: true },
      expected: {
        data: [],
        errors: [
          {
            type: 'Delimiter',
            code: 'UndetectableDelimiter',
            message:
              "Unable to auto-detect delimiting character; defaulted to ','"
          }
        ]
      }
    },
    {
      description: 'Skip empty lines, with first line only whitespace',
      notes: 'A line must be absolutely empty to be considered empty',
      input: ' \na,b,c',
      config: { skipEmptyLines: true, delimiter: ',' },
      expected: {
        data: [[' '], ['a', 'b', 'c']],
        errors: []
      }
    },
    {
      description: 'Skip empty lines while detecting delimiter',
      notes:
        'Parsing correctly newline-terminated short data with delimiter:auto and skipEmptyLines:true',
      input: 'a,b\n1,2\n3,4\n',
      config: { header: true, skipEmptyLines: true },
      expected: {
        data: [{ a: '1', b: '2' }, { a: '3', b: '4' }],
        errors: []
      }
    },
    {
      description:
        'Lines with comments are not used when guessing the delimiter in an escaped file',
      notes:
        'Guessing the delimiter should work even if there are many lines of comments at the start of the file',
      input:
        '#1\n#2\n#3\n#4\n#5\n#6\n#7\n#8\n#9\n#10\none,"t,w,o",three\nfour,five,six',
      config: { comments: '#' },
      expected: {
        data: [['one', 't,w,o', 'three'], ['four', 'five', 'six']],
        errors: []
      }
    },
    {
      description:
        'Lines with comments are not used when guessing the delimiter in a non-escaped file',
      notes:
        'Guessing the delimiter should work even if there are many lines of comments at the start of the file',
      input:
        '#1\n#2\n#3\n#4\n#5\n#6\n#7\n#8\n#9\n#10\n#11\none,two,three\nfour,five,six',
      config: { comments: '#' },
      expected: {
        data: [['one', 'two', 'three'], ['four', 'five', 'six']],
        errors: []
      }
    },
    {
      description: 'Pipe delimiter is guessed correctly when mixed with comas',
      disabled: true,
      notes:
        'Guessing the delimiter should work even if there are many lines of comments at the start of the file. feature not supported.',
      input: 'one|two,two|three\nfour|five,five|six',
      config: {},
      expected: {
        data: [['one', 'two,two', 'three'], ['four', 'five,five', 'six']],
        errors: []
      }
    },
    {
      description:
        'Pipe delimiter is guessed correctly when first field are enclosed in quotes and contain delimiter characters',
      disabled: true,
      notes:
        'Guessing the delimiter should work if the first field is enclosed in quotes, but others are not. feature not supported.',
      input: '"Field1,1,1";Field2;"Field3";Field4;Field5;Field6',
      config: {},
      expected: {
        data: [
          ['Field1,1,1', 'Field2', 'Field3', 'Field4', 'Field5', 'Field6']
        ],
        errors: []
      }
    },
    {
      description:
        'Pipe delimiter is guessed correctly when some fields are enclosed in quotes and contain delimiter characters and escaoped quotes',
      disabled: true,
      notes:
        'Guessing the delimiter should work even if the first field is not enclosed in quotes, but others are. feature not supported.',
      input: 'Field1;Field2;"Field,3,""3,3";Field4;Field5;"Field6,6"',
      config: {},
      expected: {
        data: [
          ['Field1', 'Field2', 'Field,3,"3,3', 'Field4', 'Field5', 'Field6,6']
        ],
        errors: []
      }
    },
    {
      description: 'Single quote as quote character',
      notes:
        'Must parse correctly when single quote is specified as a quote character',
      input: "a,b,'c,d'",
      config: { quoteChar: "'" },
      expected: {
        data: [['a', 'b', 'c,d']],
        errors: []
      }
    },
    {
      description: 'Custom escape character in the middle',
      notes:
        'Must parse correctly if the backslash sign (\\) is configured as a custom escape character',
      input: 'a,b,"c\\"d\\"f"',
      config: { escapeChar: '\\' },
      expected: {
        data: [['a', 'b', 'c"d"f']],
        errors: []
      }
    },
    {
      description: 'Custom escape character at the end',
      notes:
        'Must parse correctly if the backslash sign (\\) is configured as a custom escape character and the escaped quote character appears at the end of the column',
      input: 'a,b,"c\\"d\\""',
      config: { escapeChar: '\\' },
      expected: {
        data: [['a', 'b', 'c"d"']],
        errors: []
      }
    },
    {
      description: 'Custom escape character not used for escaping',
      notes:
        'Must parse correctly if the backslash sign (\\) is configured as a custom escape character and appears as regular character in the text',
      input: 'a,b,"c\\d"',
      config: { escapeChar: '\\' },
      expected: {
        data: [['a', 'b', 'c\\d']],
        errors: []
      }
    },
    {
      description: 'Header row with preceding comment',
      notes: 'Must parse correctly headers if they are preceded by comments',
      input: '#Comment\na,b\nc,d\n',
      config: {
        header: true,
        comments: '#',
        skipEmptyLines: true,
        delimiter: ','
      },
      expected: {
        data: [{ a: 'c', b: 'd' }],
        errors: []
      }
    },
    {
      description:
        'Carriage return in header inside quotes, with line feed endings',
      input: '"a\r\na","b"\n"c","d"\n"e","f"\n"g","h"\n"i","j"',
      config: {},
      expected: {
        data: [['a\r\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: []
      }
    },
    {
      description:
        'Line feed in header inside quotes, with carriage return + line feed endings',
      input: '"a\na","b"\r\n"c","d"\r\n"e","f"\r\n"g","h"\r\n"i","j"',
      config: {},
      expected: {
        data: [['a\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: []
      }
    },
    {
      description: 'Using \\r\\n endings uses \\r\\n linebreak',
      input: 'a,b\r\nc,d\r\ne,f\r\ng,h\r\ni,j',
      config: {},
      expected: {
        data: [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 23,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description: 'Using \\n endings uses \\n linebreak',
      input: 'a,b\nc,d\ne,f\ng,h\ni,j',
      config: {},
      expected: {
        data: [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\n',
          delimiter: ',',
          cursor: 19,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description:
        'Using \\r\\n endings with \\r\\n in header field uses \\r\\n linebreak',
      input: '"a\r\na",b\r\nc,d\r\ne,f\r\ng,h\r\ni,j',
      config: {},
      expected: {
        data: [['a\r\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 28,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description:
        'Using \\r\\n endings with \\n in header field uses \\r\\n linebreak',
      input: '"a\na",b\r\nc,d\r\ne,f\r\ng,h\r\ni,j',
      config: {},
      expected: {
        data: [['a\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 27,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description:
        'Using \\r\\n endings with \\n in header field with skip empty lines uses \\r\\n linebreak',
      input: '"a\na",b\r\nc,d\r\ne,f\r\ng,h\r\ni,j\r\n',
      config: { skipEmptyLines: true },
      expected: {
        data: [['a\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 29,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description:
        'Using \\n endings with \\r\\n in header field uses \\n linebreak',
      input: '"a\r\na",b\nc,d\ne,f\ng,h\ni,j',
      config: {},
      expected: {
        data: [['a\r\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\n',
          delimiter: ',',
          cursor: 24,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description: 'Using reserved regex character . as quote character',
      input: '.a\na.,b\r\nc,d\r\ne,f\r\ng,h\r\ni,j',
      config: { quoteChar: '.' },
      expected: {
        data: [['a\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 27,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description: 'Using reserved regex character | as quote character',
      input: '|a\na|,b\r\nc,d\r\ne,f\r\ng,h\r\ni,j',
      config: { quoteChar: '|' },
      expected: {
        data: [['a\na', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j']],
        errors: [],
        meta: {
          linebreak: '\r\n',
          delimiter: ',',
          cursor: 27,
          aborted: false,
          truncated: false
        }
      }
    },
    {
      description: "Parsing with skipEmptyLines set to 'greedy'",
      notes: 'Must parse correctly without lines with no content',
      input: 'a,b\n\n,\nc,d\n , \n""," "\n	,	\n,,,,\n',
      config: { skipEmptyLines: 'greedy' },
      expected: {
        data: [['a', 'b'], ['c', 'd']],
        errors: []
      }
    },
    {
      description:
        "Parsing with skipEmptyLines set to 'greedy' with quotes and delimiters as content",
      notes: 'Must include lines with escaped delimiters and quotes',
      input: 'a,b\n\n,\nc,d\n" , ",","\n""" """,""""""\n\n\n',
      config: { skipEmptyLines: 'greedy' },
      expected: {
        data: [['a', 'b'], ['c', 'd'], [' , ', ','], ['" "', '""']],
        errors: []
      }
    }
  ]))

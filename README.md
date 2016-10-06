# bem-deps-parser

Automagically generate deps.js for you

WIP! Consider current state as a proof of concept.

### Installation

In your project try:
```sh
git clone https://github.com/maksugr/bem-deps-parser.git bem-deps-parser
cd bem-deps-parser
npm i
```

### Usage

In js-file on project level:
``` javascript
const depsParser = require('./bem-deps-parser/index');
const sourceCode = "block('bla').content()(function() { return [{ block: 'b1', elem: 'e2' }]; })";

const deps = depsParser.parse(sourceCode);
```


# Dynamic Validator

dynamic-validator is an npm library for dealing with validation dynamically.

## Rules

 - type: array, object, boolean, string, number, integer, long, unsignedInt, unsignedShort, unsignedLong, safeInteger, decimal, float, double.
 - enum
 - has (object)
 - range (number)
 - text (string)
 - maxLength (string and array)
 - minLength (string and array)
 - length (string and array)
 - in (array)
 - dynamic (dynamic fields)
 - required

## Installation

```bash
npm i --save dynamic-validator
```

## Usage

```python
const { config } = require('./lib/validator')

const body = {
	name: "abc",
	age: 100,
	status: false,
	address: {
		city: "Karachi",
		country: "Pakistan",
		street: "DHA",
		extra: {
			phone: "123456789",
		}
	},
	hobbies: ["coding", "reading", "sleeping"],
	ur: [
		{
			name: "abc",
		},
		{
			name: "abc",
		}
	]
}

let errors = config(body, {
	name: "type:string|enum:abc,abc1,abc2|length:3|required:true",
	age: "type:number|range:0,100",
	status: "type:boolean",
	["address|type:object|has:city,country,street"]: {
		city: "type:string",
		country: "type:string",
		street: "type:string",
		["extra|type:object|has:phone"]: {
			phone: "type:string|maxLength:10|minLength:4"
		}
	},
	["hobbies|type:array|maxLength:6|minLength:2|in:coding,reading,sleeping,eating"]: [],
	["[en,ur,ko]|type:array"]: [{
		name: "type:string|text:abc"
	}],
})
```

## Contributing
Pull requests are welcome.
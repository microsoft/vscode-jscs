function foo() {   

  console.log('sdfasdf ');
}

if (true)

  var x2 = 20;      
  
var x;    

'use strict';

function bar(x) { }; 

function foo2() {}

var Checker = require('jscs');
var checker = new Checker();
checker.registerDefaultRules();
var fs = require('fs');
checker.configure({
  preset: 'airbnb',
});

var file = fs.readFileSync('index.js', 'utf8');
var results = checker.checkString(file);
var errors = results.getErrorList();

console.log(errors);

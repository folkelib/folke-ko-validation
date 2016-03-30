# KO Validation

Add validation to Knockout observables. 

## Install

  bower install folke-ko-validation --save
  
## Getting started
  
```javascript

  // Imports the module with require.js
  var validation = require('folke-ko-validation');
  
  // Creates a new observable with two validators
  var value = validation.validableObservable()
      .addValidator(validator.isRequired)
      .addValidator(validator.hasMaxLength(8));
  
  value("way too long");
  
  // Displays an error message
  console.log(value.errorMessage());
```

## Properties of a validableObservable

* errorMessage: a string observable with an error message or null if no error is found
* validating: a boolean that is true if there is any pending asynchronous validation
* addValidation : a method to add a new validator

## Localization

The `errorMessages` object holds the error message and may be localized.

## Validators

* isEmail: checks that it is an e-mail address
* isRequired: checks that the value is not null or empty
* hasMinLength(number): checks that the string has at least a given number of characters
* hasMaxLength(number): checks that the string has at most a given number of characters
* isInRange(min, max): checks that a number is between two values (included)
* validateService(service): the service is a function that takes a string in parameters and returns a ES6 promise with the error message
* areSame(observable): checks that it is the same value as another observable

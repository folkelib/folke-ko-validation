/*Copyright (C) 2015 Sidoine De Wispelaere

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.*/
define(["require", "exports", "knockout"], function (require, exports, ko) {
    exports.errorMessages = {
        email: "Wrong e-mail format",
        required: "Required field",
        minLength: "At least {0} characters long",
        minValue: "At least {0}",
        maxValue: "At most {0}",
        areSame: "The two fields must be identical"
    };
    /** Utility function that converts a string to a date and checks that the value is different
     * @param {Date} value The current value
     * @param {string} original The original value, that is converted to a Date
     */
    function hasDateChanged(value, original) {
        if (value == null)
            return original != null;
        if (original == null)
            return true;
        return value.getTime() != new Date(original).getTime();
    }
    exports.hasDateChanged = hasDateChanged;
    /** Utility function that checks that an object has changed or that the object was originaly null but is not anymore, or that the
     * object is not null but originaly was null.
     */
    function hasObjectChanged(value, original) {
        if (value == null)
            return original != null;
        if (original == null)
            return true;
        return value.changed();
    }
    exports.hasObjectChanged = hasObjectChanged;
    /** Checks if an array of Changeable has changed */
    function hasArrayOfObjectsChanged(value, original) {
        if (value == null)
            return original != null;
        if (original == null)
            return true;
        return value().length != original.length || value().some(function (v) { return v.changed(); });
    }
    exports.hasArrayOfObjectsChanged = hasArrayOfObjectsChanged;
    /** Checks if an array of values has changed */
    function hasArrayChanged(value, original) {
        if (value == null)
            return original != null;
        if (original == null)
            return true;
        return value().length != original.length || value().some(function (v, i) { return v != original[i]; });
    }
    exports.hasArrayChanged = hasArrayChanged;
    /** Create a ValidableObservable */
    function validableObservable() {
        var observable = ko.observable();
        var validators = ko.observableArray();
        var errorMessage = ko.computed(function () {
            var v = validators();
            for (var i = 0; i < v.length; i++) {
                var error = v[i].errorMessage();
                if (error) {
                    return error;
                }
            }
            return null;
        });
        var validating = ko.computed(function () {
            var v = validators();
            for (var i = 0; i < v.length; i++) {
                if (v[i].validating && v[i].validating()) {
                    return true;
                }
            }
            return false;
        });
        observable.errorMessage = errorMessage;
        observable.validating = validating;
        observable.addValidator = function (validatorFactory) {
            validators.push(validatorFactory(observable));
            return observable;
        };
        return observable;
    }
    exports.validableObservable = validableObservable;
    /** A validator factory that checks that the value has the format of an e-mail  */
    function isEmail(value) {
        var re = /^\S+@\S+\.\S+$/;
        return {
            errorMessage: ko.computed(function () { return re.test(value()) ? null : exports.errorMessages.email; })
        };
    }
    exports.isEmail = isEmail;
    /** A validator factory that checks that the value is not null or empty */
    function isRequired(value) {
        return {
            errorMessage: ko.computed(function () { return value() == null || value() == "" ? exports.errorMessages.required : null; })
        };
    }
    exports.isRequired = isRequired;
    /** Creates a validator factory that checks that a string has a minimum length */
    function hasMinLength(minLength) {
        return function (value) {
            return {
                errorMessage: ko.computed(function () { return !value() || value().length < minLength ? format(exports.errorMessages.minLength, minLength) : null; })
            };
        };
    }
    exports.hasMinLength = hasMinLength;
    /** Creates a validator factory that checks that a number has a value between two limits */
    function isInRange(min, max) {
        return function (value) {
            return {
                errorMessage: ko.computed(function () { return !value() || value() < min ? format(exports.errorMessages.minValue, min) : (value() > max ? format(exports.errorMessages.maxValue, max) : null); })
            };
        };
    }
    exports.isInRange = isInRange;
    /** Creates a validator factory that calls a service to check if a value is valid */
    function validateService(service) {
        return function (value) {
            var errorMessage = ko.observable(null);
            var validating = ko.observable(false);
            value.subscribe(function (newValue) {
                validating(true);
                service({ value: newValue })
                    .then(function (result) {
                    errorMessage(result);
                    validating(false);
                })
                    .catch(function () { return validating(false); });
            });
            return {
                errorMessage: errorMessage,
                validating: validating
            };
        };
    }
    exports.validateService = validateService;
    /** Creates a validator factory that checks that the string is equal to another observable string */
    function areSame(other) {
        return function (value) {
            return {
                errorMessage: ko.computed(function () { return value() == other() ? null : exports.errorMessages.areSame; })
            };
        };
    }
    exports.areSame = areSame;
    function format(f, a) {
        return f.replace("{0}", a);
    }
});

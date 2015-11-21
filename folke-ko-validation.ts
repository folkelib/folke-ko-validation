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

import * as ko from "knockout";

export var errorMessages = {
    email: "Wrong e-mail format",
    required: "Required field",
    minLength: "At least {0} characters long",
    minValue: "At least {0}",
    maxValue: "At most {0}",
    areSame: "The two fields must be identical"
};

/** A validator. */
export interface Validator {
    /** The error message. If null, there is no error. */
    errorMessage: KnockoutObservable<string>
    /** (optional) true while the validator is not ready (e.g. asynchronous call).
     * You should listen to this observable before reading errorMessage */
    validating?: KnockoutObservable<boolean>
}

/** An extension to KnockoutObservable to add validators */
export interface ValidableObservable<T> extends KnockoutObservable<T> {
    /** If there is an error it is not null */
    errorMessage: KnockoutObservable<string>;
    /** If the state is unknown (asynchronous call) */
    validating: KnockoutObservable<boolean>;
    /** Add a new validator factory */
    addValidator(validatorFactory: (value:ValidableObservable<T>) => Validator):ValidableObservable<T>;
}

/** Create a ValidableObservable */
export function validableObservable<T>(): ValidableObservable<T> {
    var observable = <ValidableObservable<T>>ko.observable<T>();
    var validators = ko.observableArray<Validator>();
    var errorMessage = ko.computed(() => {
        var v = validators();
        for (var i = 0; i < v.length; i++) {
            var error = v[i].errorMessage();
            if (error) {
                return error;
            }
        }
        return null;
    });

    var validating = ko.computed(() => {
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
    observable.addValidator = (validatorFactory: (value: ValidableObservable<T>) => Validator) => {
        validators.push(validatorFactory(observable));
        return observable;
    };
    return observable;
}

/** A validator factory that checks that the value has the format of an e-mail  */
export function isEmail(value: KnockoutObservable<string>):Validator {
    var re = /^\S+@\S+\.\S+$/;
    return {
        errorMessage: ko.computed(() => re.test(value()) ? null : errorMessages.email)
    };
}

/** A validator factory that checks that the value is not null or empty */
export function isRequired(value: KnockoutObservable<string|number>):Validator{
    return {
        errorMessage: ko.computed(() => value() == null || value() == "" ? errorMessages.required : null)
        };
}

/** Creates a validator factory that checks that a string has a minimum length */
export function hasMinLength(minLength: number) {
    return (value: KnockoutObservable<string>) => { return {
        errorMessage: ko.computed(() => !value() || value().length < minLength ? format(errorMessages.minLength, minLength) : null)
    }};
}

/** Creates a validator factory that checks that a number has a value between two limits */
export function isInRange(min: number, max:number) {
    return (value: KnockoutObservable<number>) => {
        return {
            errorMessage: ko.computed(() => !value() || value() < min ? format(errorMessages.minValue, min) : (value() > max ? format(errorMessages.maxValue, max) : null))
        }
    };
}

/** Creates a validator factory that calls a service to check if a value is valid */
export function validateService(service: (parameters: { value: string }) => Promise<string>) {
    return (value: KnockoutObservable<string>) => {
        var errorMessage = ko.observable<string>(null);
        var validating = ko.observable(false);
        value.subscribe(newValue => {
            validating(true);
            service({ value: newValue })
                .then(result => {
                    errorMessage(result);
                    validating(false);
                })
                .catch(() => validating(false));
        });

        return {
            errorMessage: errorMessage,
            validating: validating
        }       
    };
}

/** Creates a validator factory that checks that the string is equal to another observable string */
export function areSame(other: KnockoutObservable<string>) {
    return (value: KnockoutObservable<string>) => {
        return {
            errorMessage: ko.computed(() => value() == other() ? null : errorMessages.areSame)
        };
    }
}

function format(f:string, a:any){
    return f.replace("{0}", a);
}

/* Register a new Knockout binding handler that adds an error message of class "error" after an input */
export var validateHandler: KnockoutBindingHandler = {
    init: function (element: HTMLElement, valueAccessor: () => ValidableObservable<any>) {
        var label = document.createElement('label');
        label.style.display = 'none';
        label.className = 'error';
        element.parentElement.insertBefore(label, element.nextSibling);
        $(element).after(label);
        var observable = valueAccessor();
        if (!observable.errorMessage) return;
        var handle = observable.errorMessage.subscribe(newValue => {
            if (newValue) {
                label.style.display = 'block';
                label.innerHTML = newValue;
            }
            else {
                label.style.display = 'none';
            }
        });
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => handle.dispose());
    }
};

ko.bindingHandlers['validate'] = validateHandler;
import * as ko from "knockout";
import * as promise from 'es6-promise';
export declare var errorMessages: {
    email: string;
    required: string;
    minLength: string;
    maxLength: string;
    minValue: string;
    maxValue: string;
    areSame: string;
};
/** A validator. */
export interface Validator {
    /** The error message. If null, there is no error. */
    errorMessage: ko.Computed<string>;
    /** (optional) true while the validator is not ready (e.g. asynchronous call).
     * You should listen to this observable before reading errorMessage */
    validating?: ko.Computed<boolean>;
}
/** An extension to ko.Observable to add validators */
export interface ValidableObservable<T> extends ko.Observable<T> {
    /** If there is an error it is not null */
    errorMessage: ko.Computed<string>;
    /** If the state is unknown (asynchronous call) */
    validating: ko.Computed<boolean>;
    /** Add a new validator factory */
    addValidator(validatorFactory: (value: ValidableObservable<T>) => Validator): ValidableObservable<T>;
}
/** Create a ValidableObservable */
export declare function validableObservable<T>(): ValidableObservable<T>;
/** A validator factory that checks that the value has the format of an e-mail  */
export declare function isEmail(value: ko.Observable<string>): Validator;
/** A validator factory that checks that the value is not null or empty */
export declare function isRequired(value: ko.Observable<string | number>): Validator;
/** Creates a validator factory that checks that a string has a minimum length */
export declare function hasMinLength(minLength: number): (value: ko.Observable<string>) => {
    errorMessage: ko.Computed<string>;
};
/** Creates a validator factory that checks that a string has a maximum length */
export declare function hasMaxLength(maxLength: number): (value: ko.Observable<string>) => {
    errorMessage: ko.Computed<string>;
};
/** Creates a validator factory that checks that a number has a value between two limits */
export declare function isInRange(min: number, max: number): (value: ko.Observable<number>) => {
    errorMessage: ko.Computed<string>;
};
/** Creates a validator factory that calls a service to check if a value is valid */
export declare function validateService(service: (parameters: {
    value: string;
}) => promise.Promise<string>): (value: ko.Observable<string>) => {
    errorMessage: ko.Observable<string>;
    validating: ko.Observable<boolean>;
};
/** Creates a validator factory that checks that the string is equal to another observable string */
export declare function areSame(other: ko.Observable<string>): (value: ko.Observable<string>) => {
    errorMessage: ko.Computed<string>;
};
export declare function register(): void;

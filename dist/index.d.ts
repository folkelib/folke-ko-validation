/// <reference types="knockout" />
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
    errorMessage: KnockoutComputed<string | null>;
    /** (optional) true while the validator is not ready (e.g. asynchronous call).
     * You should listen to this observable before reading errorMessage */
    validating?: KnockoutComputed<boolean>;
}
/** An extension to ko.Observable to add validators */
export interface ValidableObservable<T> extends KnockoutObservable<T> {
    /** If there is an error it is not null */
    errorMessage: KnockoutComputed<string | null>;
    /** If the state is unknown (asynchronous call) */
    validating: KnockoutComputed<boolean>;
    /** If the value is valid and it is not currently validating the entry */
    valid: KnockoutComputed<boolean>;
    /** Add a new validator factory */
    addValidator(validatorFactory: (value: ValidableObservable<T>) => Validator): ValidableObservable<T>;
}
/** Create a ValidableObservable */
export declare function validableObservable<T>(value?: T): ValidableObservable<T>;
/** A validator factory that checks that the value has the format of an e-mail  */
export declare function isEmail(value: KnockoutObservable<string>): Validator;
/** A validator factory that checks that the value is not null or empty */
export declare function isRequired(value: KnockoutObservable<any>): Validator;
/** Creates a validator factory that checks that a string has a minimum length */
export declare function hasMinLength(minLength: number): (value: KnockoutObservable<string>) => {
    errorMessage: KnockoutComputed<string | null>;
};
/** Creates a validator factory that checks that a string has a maximum length */
export declare function hasMaxLength(maxLength: number): (value: KnockoutObservable<string>) => {
    errorMessage: KnockoutComputed<string | null>;
};
/** Creates a validator factory that checks that a number has a value between two limits */
export declare function isInRange(min: number, max: number): (value: KnockoutObservable<number>) => {
    errorMessage: KnockoutComputed<string | null>;
};
export declare function isAtLeast(min: number): (value: KnockoutObservable<number>) => {
    errorMessage: KnockoutComputed<string | null>;
};
export declare function isAtMost(max: number): (value: KnockoutObservable<number>) => {
    errorMessage: KnockoutComputed<string | null>;
};
/** Creates a validator factory that calls a service to check if a value is valid */
export declare function validateService(service: (parameters: {
    value: string;
}) => Promise<string>): (value: KnockoutObservable<string>) => {
    errorMessage: KnockoutObservable<string>;
    validating: KnockoutObservable<boolean>;
};
/** Creates a validator factory that checks that the string is equal to another observable string */
export declare function areSame(other: KnockoutObservable<string>): (value: KnockoutObservable<string>) => {
    errorMessage: KnockoutComputed<string | null>;
};
export declare function register(): void;

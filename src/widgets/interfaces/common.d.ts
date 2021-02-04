import {ISBFObservable} from "../../../../simplebindingframework/src/common/interfaces";

export type JWDataType = "string" | "number" | "boolean" | "object" | "date" | "time" | "currency";
export type JWComparisonOperator = "=" | ">" | ">=" | "<" | "<=" | "!=" | "startsWith" | "endsWith" |"contains";
export type JWLogicalOperator = "OR" | "AND";
export type JWLogLevel = "info" | "error" | "warning" | "debug";
export type JWErrorType = "error" | "evalError" | "rangeError" | "referenceError" | "syntaxError" | "typeError" | "uriError";
export type JasonWidgetEvent = (sender:IJasonWidget<any> | HTMLElement,eventData:any | Event)=>void;

export interface IJasonWidgetDictionary<T>{
    [key:string]:T;
}

/**
 * JasonWidget interface
 */
export interface IJasonWidget<TOptions>{
    /** The HTML element that the widget will be created/bound to.*/
    htmlElement:HTMLElement;
    /** The widget options.*/
    options:TOptions;
    /** The widget's value. Not applicable to all widget types.*/
    value:ISBFObservable<any>;
    /** Cleans up any UI or others references.*/
    destroy();
    /**
     * Adds an event listener for the widget's supported events. Not all widgets have the same events.
     * @param eventName - The event name.
     * @param eventListener - The event listener.
     * @param callingContext - The calling context for the listener callback.
     */
    addEventListener(eventName:string,eventListener:(sender?:IJasonWidget<TOptions>,eventData?:any)=>void,callingContext?:object);
    /**
     * Trigger a widget event.
     * @param eventName - The event name.
     * @param eventData - The event data
     * @param eventsTriggeredCallback - Callback to be called when all event listeners for the specific event have been called.
     */
    triggerEvent(eventName:string,eventData?:any,eventsTriggeredCallback?:()=>void);
    /** Returns true if the widget's current value is valid, based on the widget's validation rules.*/
    validate():boolean;
}

export interface IJasonWidgetUIHelper{
    /** The JasonWidget instance.*/
    widget: IJasonWidget<any>;
    /** The HTML element that the widget will be created/bound to.*/
    htmlElement:HTMLElement;
    /** Renders the widget's UI into the DOM.*/
    renderUI();
    /** Removes the widget's UI from the DOM.*/
    clearUI();
}

/**
 * JasonWidgetEvent
 */
export interface IJasonWidgetEvent{
    /** The event name. */
    eventName:string;
    /**
     * Event listener
     * @param sender - The event sender (originator).
     * @param eventData - The event data.
     */
    listener:JasonWidgetEvent;
    /** The event calling context. */
    callingContext?:object;
    /** The event's enabled state. */
    enabled?:boolean;
    /** Is the event a capture or a bubble event. */
    useCapture?:boolean;
    /** The event's unique id. */
    uuid?:string;
    /** The event's associated html element. */
    element?:HTMLElement;
    /** The event's associated widget.*/
    widget?:IJasonWidget<any>;
}

/**
 * A validation rule can be applicable to a widget.
 * Validation rules, help validate user input, before taking any action.
 */
export interface IJasonWidgetValidationRule{
    /**
     * Rule name. If you use one of the default ones, you don't need to define a validate method,
     * unless you want to override the default behavior.
     */
    name:string | "email" | "min" | "max" | "minLength" | "maxLength" | "equal" | "notEqual" | "required";
    /**
     * Message to show from consumer when invalid.
     */
    message?:string | ((value:any) =>string);
    /**
     * Helper property to determine the validity of the observable.
     */
    ruleComparisonValue?:any;
    /**
     * Returns true if the widget's value is valid.
     * @param currentValue - The observables current value.
     * @param ruleComparisonValue - Helper value to determine the validity of the observable.
     */
    validate?:(currentValue:any,ruleComparisonValue?:any)=>boolean;
    /**
     * Group where this rule belongs to. Default is undefined.
     */
    group?:string;
}

/**
 * JasonWidget localization.
 */
export interface IJasonLocalization{
    /** Date separator. */
    localeDateSeparator:string;
    /** Time separator. */
    localeTimeSeparator:string;
    /** Ante meridiem string AM */
    anteMeridiem:string;
    /** Post meridiem string PM */
    postMeridiem:string;
    /** The locale. */
    locale:string;
    /** Locale's date format. */
    localeDateFormat:string;
    /** Locale's time format. */
    localeTimeFormat:string;
    /** True if the locale's clock is 12hour based. */
    isTwelveHour:boolean;

    /**
     * Formats a date time value.
     * @param value - The date-time value.
     * @param options - Format options.
     */
    formatDateTime(value:Date,options?:Intl.DateTimeFormatOptions):string;

    /**
     * Formats a numeric value.
     * @param value - The numeric value.
     * @param options - Format options.
     */
    formatNumber(value:number,options?:Intl.NumberFormatOptions):string;

    /**
     * Returns the given's date long day name.
     * @param date - The date value.
     */
    getDayLongName(date:Date):string;

    /**
     * Returns the given's date short day name.
     * @param date - The date value.
     */
    getDayShortName(date:Date):string;

    /**
     * Returns the given's date long month name.
      * @param date - The date value.
     */
    getMonthLongName(date:Date):string;

    /**
     * Returns the given's date short month name.
     * @param date - The date value.
     */
    getMonthShortName(date:Date):string;
}

/**
 * JasonWidget options
 */
export interface IJasonWidgetOptions{
    /** Events. */
    events?:IJasonWidgetDictionary<IJasonWidgetEvent | JasonWidgetEvent>;
    /** Validation rules.*/
    validationRules?:IJasonWidgetDictionary<IJasonWidgetValidationRule>;
    /** Localization*/
    localization?:IJasonLocalization | string;
    /** Controls the enabled state of the widget.*/
    enabled:ISBFObservable<boolean>;
    /** Controls the visible state of the widget.*/
    visible:ISBFObservable<boolean>;
    /** Controls the readonly state of the widget.*/
    readonly:ISBFObservable<boolean>;
}

/** JasonWidget coordinates definition */
export interface IJasonCoordinates{
    top:number;
    left:number;
}


export interface IJasonEventManager{
    /**
     * Adds a widget event.
     * @param widget - The widget.
     * @param eventName - The event name.
     * @param eventListener - The event listener.
     */
    addWidgetEvent(widget:IJasonWidget<any>,eventName:string,eventListener:(sender:IJasonWidget<any>,eventData?:any)=>void);

    /**
     * Adds an element event.
     * @param element - The element.
     * @param eventName - The event name.
     * @param eventListener - The event listener.
     * @param useCapture - True to add a capture phase event.
     */
    addElementEvent(element:HTMLElement,eventName:string,eventListener:(sender:HTMLElement,event:Event)=>void,useCapture?:boolean);

    /**
     * Triggers a widget event.
     * @param widget - The widget.
     * @param eventName - The event name.
     * @param eventData - The event data.
     */
    triggerWidgetEvent(widget:IJasonWidget<any>,eventName:string,eventData:any);

    /** Clears all events.*/
    clearEvents();
}
import {JasonLocalization} from "../localization/jasonLocalization";
import {
    IJasonWidget,
    IJasonWidgetUIHelper,
    IJasonWidgetValidationRule,
    JWErrorType,
    JWLogLevel
} from "../widgets/interfaces/common";
import {BaseJasonWidget, BaseJasonWidgetUIHelper} from "../widgets/baseJasonWidget";
import {ISBFObservable} from "../../../simplebindingframework/src/common/interfaces";
import {SBFManager} from "../../../simplebindingframework/src/common/sbfManager";
import {JasonTextboxBindingHandler} from "../widgets/textbox/jasonTextbox";
import {JasonDOM} from "./jasonDOM";


const emailRegEx = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
// noinspection JSUnusedLocalSymbols
const defaultRuleRepository={
    "email":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{return emailRegEx.test(currentValue);}},
    "min":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{
            if(typeof currentValue == "number" && typeof ruleComparisonValue == "number")
                return currentValue < ruleComparisonValue;
            return false;
        }},
    "max":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{
            if(typeof currentValue == "number" && typeof ruleComparisonValue == "number")
                return currentValue > ruleComparisonValue;
            return false;
        }},
    "minlength":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{
            if(typeof currentValue == "string" && typeof ruleComparisonValue == "number")
                return currentValue.length >= ruleComparisonValue;
            return false;
        }},
    "maxlength":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{
            if(typeof currentValue == "string" && typeof ruleComparisonValue == "number")
                return currentValue.length <= ruleComparisonValue;
            return false;
        }},
    "equal":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{return currentValue === ruleComparisonValue;}},
    "notequal":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{return currentValue !== ruleComparisonValue;}},
    "required":<IJasonWidgetValidationRule>{validate:(currentValue,ruleComparisonValue)=>{return currentValue != null;}}
}

const rulesRepository : {[key:string]:IJasonWidgetValidationRule} = {

}

// noinspection JSUnfilteredForInLoop
export class JasonCommon{
    private static deepExtend(sourceObject:any,targetObject:any,deep:boolean = false){
        if (!targetObject)
            targetObject = {};
        for (let prop in sourceObject) {
            if (targetObject[prop] == undefined || targetObject[prop] == null) {
                targetObject[prop] = sourceObject[prop];
            }
            if(deep) {
                if ((targetObject[prop]) && (typeof targetObject[prop] == "object" && typeof sourceObject[prop] == "object")) {
                    JasonCommon.extendObject(sourceObject[prop], targetObject[prop]);
                }
            }
        }
    }

    //#region date-time
    /**
     * Takes a date value and returns a date with only the date part.
     * @param value
     */
    static dateOf(value:Date):Date{
        let result = new Date();
        result.setHours(0, 0, 0, 0);
        result.setFullYear(value.getFullYear());
        result.setMonth(value.getMonth());
        result.setDate(value.getDate());
        return  result;
    }

    /**
     * Takes a date value dnd returns a date with only the time part.
     * @param value
     */
    static timeOf(value:Date):Date{
        let result = new Date();
        result.setHours(value.getHours(),value.getMinutes() , value.getSeconds(), value.getMilliseconds());
        result.setFullYear(0);
        result.setMonth(0);
        result.setDate(0);
        return  result;
    }

    /**
     * Takes in a string and tries to convert it to a date.
     * @param value - The date string value.
     * @param dateFormat - The date string format. For example 2020-12-31 is a format of type YYYY-MM-DD
     */
    static parseDateValue(value:string,dateFormat?:string):Date{
        let result = null;
        let localizationClass = new JasonLocalization();
        dateFormat = dateFormat ? dateFormat : localizationClass.localeDateFormat;
        let isDateWithWords = value.match(/\D\W/g);
        let currentDate = new Date();
        try{
            if (isDateWithWords) {
                result = new Date(value);

                if (value.indexOf(currentDate.getFullYear().toString()) < 0) {
                    result.setYear(currentDate.getFullYear());
                }
                result = JasonCommon.dateOf(result);
            }
            else{
                let nonNumeric = value.match(/[^0-9]/g);
                let splittedValue = nonNumeric ? value.split(nonNumeric[0]) : [value];
                let splittedFormat = nonNumeric ? dateFormat.split(nonNumeric[0]) : dateFormat.split(localizationClass.localeDateSeparator);
                let day = null;
                let month = null;
                let year = null;
                for (let i = 0; i <= splittedFormat.length - 1; i++) {
                    let splitValue : any = splittedValue[i];
                    if (splitValue) {
                        splitValue = parseInt(splitValue);
                    }

                    if (splittedFormat[i].indexOf("y") >= 0)
                        year = splitValue;

                    if (splittedFormat[i].indexOf("M") >= 0 && splitValue <= 12)
                        month = splitValue;

                    if (splittedFormat[i].indexOf("d") >= 0 && splitValue <= 31)
                        day = splitValue;
                }
                if (!year)
                    year = currentDate.getFullYear();
                if (!day)
                    day = currentDate.getDate();
                if (!month)
                    month = currentDate.getMonth() + 1;
                if (day && month && year) {
                    result = new Date();
                    result.setHours(0);
                    result.setMinutes(0);
                    result.setSeconds(0);
                    result.setMilliseconds(0);
                    result.setDate(day);
                    result.setMonth(month - 1);
                    result.setYear(year);
                    result = JasonCommon.dateOf(result);
                }
            }
            return result;
        }
        catch (e){
            console.debug(e);
            throw e;
        }
    }

    /**
     * Takes in a string and tries to convert it to a time.
     * @param value - The time string value.
     * @param timeFormat - The time string format. For example 16:05:30 is a format of type HH-mm-ss, where 04:00AM is hh-mm.
     */
    static parseTimeValue(value:string,timeFormat?:string):Date{
        let result = null;
        try{
            let localizationClass = new JasonLocalization();
            timeFormat = timeFormat ? timeFormat : localizationClass.localeTimeFormat;
            let isAM = false;
            let isPM = false;
            if (localizationClass.isTwelveHour) {
                isAM = value.indexOf(localizationClass.anteMeridiem) >= 0;
                isPM = value.indexOf(localizationClass.postMeridiem) >= 0;
                value = isAM ? value.replace(localizationClass.anteMeridiem, "") : value.replace(localizationClass.postMeridiem, "");
            }
            let nonNumeric = value.match(/[^0-9]/g);
            let timeSplitter = nonNumeric ? nonNumeric[0] : localizationClass.localeTimeSeparator;
            let splittedValue = value.split(timeSplitter);
            let splittedFormat = timeFormat.split(timeSplitter);
            let hours = null;
            let mins = null;
            let seconds = null;
            for (let i = 0; i <= splittedFormat.length - 1; i++) {
                if (splittedFormat[i].indexOf("h") >= 0 || splittedFormat[i].indexOf("H") >= 0) {
                    hours = parseInt(splittedValue[i]);
                    if (localizationClass.isTwelveHour && isAM)
                        hours = hours > 12 ? hours - 12 : hours;
                    if (localizationClass.isTwelveHour && isPM)
                        hours = hours > 12 ? hours : hours + 12;
                }
                if (splittedFormat[i].indexOf("m") >= 0)
                    mins = parseInt(splittedValue[i]);

                if (splittedFormat[i].indexOf("s") >= 0)
                    seconds = parseInt(splittedValue[i]);
            }
            if (!seconds || isNaN(seconds) || seconds > 60)
                seconds = 0;
            if (!mins || isNaN(mins) || mins > 60)
                mins = 0;
            if (hours >= 24)
                hours = 0;
            // noinspection PointlessBooleanExpressionJS
            if (hours != null && mins != null && seconds != null) {
                result = new Date();
                result.setHours(hours);
                result.setMinutes(mins);
                result.setSeconds(seconds);
                result.setMilliseconds(0);
            }
            return result;
        }
        catch (e){
            console.debug(e);
            throw e;
        }
    }
    //#endregion

    //#region object and arrays
    /**
     * Deep clones an object to another object.
     * @param sourceObject - The source object.
     * @param targetObject - The target object.
     * @param deep - If true, it will perform a deep copy.
     */
    static extendObject<T>(objectToExtend:T,extensions:Array<object>, deep:boolean = false):T{
        let clone = <T>{};
        JasonCommon.deepExtend(objectToExtend,clone,deep);
        extensions.forEach((extension)=>{
            JasonCommon.deepExtend(extension,clone,deep);
        });
        return clone;
    }

    /**
     * Deep clones an array of objects.
     * @param sourceArray - The array to clone.
     */
    static cloneArray(sourceArray:Array<any>):Array<any>{
        return sourceArray.map((r)=>{
            return JasonCommon.extendObject(r,[{}]);
        });
    }

    static isJasonWidget(object:any): object is IJasonWidget<any>{
        return object instanceof BaseJasonWidget;
    }

    static isJasonWidgetUIHelper(object:any): object is IJasonWidgetUIHelper{
        return object instanceof  BaseJasonWidgetUIHelper;
    }
    //#endregion

    //#region validation
    /**
     * Returns a validation rule from the rules repository.
     * @param ruleName - The validation rule name.
     */
    static validationRule(ruleName:string):IJasonWidgetValidationRule{
        return defaultRuleRepository[ruleName] || rulesRepository[ruleName];
    }

    /**
     * Registers a validation rule that can be used from any widget.
     * @param newRule - The new rule definition.
     */
    static registerValidationRule(newRule:IJasonWidgetValidationRule){
        if(newRule && newRule.name && !rulesRepository[newRule.name])
            rulesRepository[newRule.name] = newRule;
    }
    //#endregion

    //#region debugging/logging
    /**
     * If set to true, debug message will be printed in the console.
     */
    static debug:boolean = false;

    /**
     * Logs messages to the console, if the debug flag is set to true.
     * @param message - The log message.
     * @param loglevel - The log level.
     */
    static log(message:string, loglevel:JWLogLevel = "info"){
        if(JasonCommon.debug) {
            switch (loglevel) {
                case "debug": {console.debug(message);break;}
                case "info": {console.info(message);break;}
                case "warning": {console.warn(message);break;}
                case "error": {console.error(message);break;}
            }
        }
    }

    /**
     * Convenience method to log information messages.
     * @param message - The message to log.
     */
    static logInfo(message:string){JasonCommon.log(message,"info");}
    /**
     * Convenience method to log warning messages.
     * @param message - The message to log.
     */
    static logWarn(message:string){JasonCommon.log(message,"warning");}
    /**
     * Convenience method to log error messages.
     * @param message - The message to log.
     */
    static logError(message:string){JasonCommon.log(message,"error");}
    /**
     * Convenience method to log debug messages.
     * @param message - The message to log.
     */
    static logDebug(message:string){JasonCommon.log(message,"debug");}

    /**
     * Throws an error.
     * @param errorType - The error type.
     * @param message - The error message.
     */
    static throwError(errorType:JWErrorType,message:string){
        switch (errorType){
            case "error":{throw new Error(message);}
            case "evalError": {throw new EvalError(message);}
            case "rangeError":{throw new RangeError(message);}
            case "referenceError":{throw new ReferenceError(message);}
            case "syntaxError": {throw new SyntaxError(message);}
            case "typeError":{throw new TypeError(message);}
            case "uriError":{throw new URIError(message);}
            default:{throw new Error(message);}
        }
    }
    //#endregion

    //#region initialize
    static initialize(){
        JasonDOM.initializeTemplateElements();
        SBFManager.registerBindingHandler("jasonTextbox",{
            bindingHandler:JasonTextboxBindingHandler,
            validateBindingValue:(bindingValue:ISBFObservable<any> | any)=>{
                return typeof bindingValue  == "string" || (bindingValue.isObservable) || bindingValue.isBindingHandlerOptionsObject == true;
            }
        });
    }
    //#endregion
}
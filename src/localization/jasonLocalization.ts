// noinspection JSUnusedGlobalSymbols,DuplicatedCode
export class JasonLocalization{
    //#region private
    private _localeDateSeparator:string;
    private _localeTimeSeparator:string;
    private _anteMeridiemToken:string;
    private _postMeridiemToken:string;
    private _isTwelveHourClock:boolean;
    private readonly _dateInternationalization : Intl.DateTimeFormat;
    private readonly _numberInternationalization : Intl.NumberFormat;
    private readonly _localeDateFormat:string;
    private readonly _localeTimeFormat:string;
    private readonly _locale:string;
    private determineDateFormat(locale?:string):string{
        let result = "";
        let newDate = new Date();
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);
        newDate.setFullYear(1999);
        newDate.setMonth(11);
        newDate.setDate(31);
        let dateString = newDate.toLocaleDateString(locale).replace(/\u200E/g, "");
        let nonNumeric = dateString.match(/[^0-9]/g);
        let dateSplitter = nonNumeric[0];
        let splitted = dateString.split(dateSplitter);
        this._localeDateSeparator = dateSplitter;
        for (let i = 0 ; i<= splitted.length - 1; i++) {
            if (splitted[i].length > 2) {
                if (i > 0)
                    result = result + dateSplitter;
                result = result + "yyyy";
            }
            if (splitted[i].length == 2) {
                let numericValue = parseInt(splitted[i]);
                if (numericValue == 12) {
                    if (i > 0)
                        result = result + dateSplitter;
                    result = result + "MM";
                }
                if (numericValue == 31){
                    if (i > 0)
                        result = result + dateSplitter;
                    result = result + "dd";
                }
                if (numericValue == 99){
                    if (i > 0)
                        result = result + dateSplitter;
                    result = result + "dd";
                }
            }
        }
        return result;
    }
    private determineTimeFormat(locale?:string):string{
        let result = "";
        let timeDate = new Date();
        let timeDateString;
        let meridiemString;

        timeDate.setHours(11);
        timeDate.setMinutes(59);
        timeDate.setSeconds(59);
        timeDate.setMilliseconds(0);
        let anteMeridiemTimeString = timeDate.toLocaleTimeString(locale);
        anteMeridiemTimeString = anteMeridiemTimeString.replace(/\u200E/g, "");
        for (let i = 0; i <= anteMeridiemTimeString.length - 1; i++) {
            if (anteMeridiemTimeString[i] != "") {
                let charCode = anteMeridiemTimeString.charCodeAt(i);
                if (!isNaN(charCode) && charCode > 64) {
                    meridiemString = anteMeridiemTimeString.substr(i, anteMeridiemTimeString.length - i);
                    break;
                }
            }
        }
        this._anteMeridiemToken  = meridiemString;

        timeDate.setHours(23);
        timeDate.setMinutes(24);
        timeDate.setSeconds(25);
        timeDate.setMilliseconds(26);
        anteMeridiemTimeString = timeDate.toLocaleTimeString(locale);
        anteMeridiemTimeString = anteMeridiemTimeString.replace(/\u200E/g, "");
        for (let i = 0; i <= anteMeridiemTimeString.length - 1; i++) {
            if (anteMeridiemTimeString[i] != "") {
                let charCode = anteMeridiemTimeString.charCodeAt(i);
                if (!isNaN(charCode) && charCode > 64) {
                    meridiemString = anteMeridiemTimeString.substr(i, anteMeridiemTimeString.length - i);
                    break;
                }
            }
        }
        this._postMeridiemToken  = meridiemString;
        timeDateString = timeDate.toLocaleTimeString(locale);
        timeDateString = timeDateString.replace(this._postMeridiemToken, "");
        timeDateString = timeDateString.replace(/\u200E/g, "");
        timeDateString = timeDateString.trim();
        let nonNumeric = timeDateString.match(/\D/g);
        let timeSplitter = nonNumeric[0];
        let splitted = timeDateString.split(timeSplitter);
        this._localeTimeSeparator = timeSplitter;
        for (let i = 0 ; i <= splitted.length - 1; i++) {
            if (splitted[i].length == 2) {
                let numericValue = parseInt(splitted[i]);
                if (numericValue == 23 || numericValue == 11) {
                    this._isTwelveHourClock = numericValue == 11;
                    if (i > 0)
                        result = result + timeSplitter;
                    result = this._isTwelveHourClock ? result + "hh" : result + "HH";
                }
                if (numericValue == 24) {
                    if (i > 0)
                        result = result + timeSplitter;
                    result = result + "mm";
                }
                if (numericValue == 25) {
                    if (i > 0)
                        result = result + timeSplitter;
                    result = result + "ss";
                }
                if (numericValue == 26) {
                    if (i > 0)
                        result = result + timeSplitter;
                    result = result + "f";
                }
            }
        }
        return result;
    }
    //#endregion
    //#region constructor
    /**
     * Creates a localization class for the given locale. If omitted it defaults to the system/browser default.
     * @param locale - The locale.
     * @param dateFormatOptions - Date/time formatting options.
     * @param numberFormatOptions - Number formatting options.
     */
    constructor(locale?:string,dateFormatOptions?:Intl.DateTimeFormatOptions,numberFormatOptions?:Intl.NumberFormatOptions) {
        let resolvedOptions = Intl.DateTimeFormat().resolvedOptions();
        this._locale = locale ? locale : resolvedOptions.locale;
        this._dateInternationalization = new Intl.DateTimeFormat(this._locale,dateFormatOptions);
        this._numberInternationalization = new Intl.NumberFormat(this._locale,numberFormatOptions);
        this._localeDateFormat = this.determineDateFormat(this._locale);
        this._localeTimeFormat = this.determineTimeFormat(this._locale);
        this._isTwelveHourClock = resolvedOptions.hour12
    }
    //#endregion
    //#region public
    /**
     * The date separator string for the given locale.
     */
    get localeDateSeparator():string { return this._localeDateSeparator;}

    /**
     * The time separator string for the given locale.
     */
    get localeTimeSeparator():string { return this._localeTimeSeparator;}

    /**
     * The ante-meridiem (AM) time string token for the given locale.
     */
    get anteMeridiem():string{return this._anteMeridiemToken;}

    /**
     * The post-meridiem (PM) time string token for the given locale.
     */
    get postMeridiem():string{return this._postMeridiemToken;}

    /**
     * The locale of this localization class.
     */
    get locale():string{return this._locale;}

    get localeDateFormat():string{ return this._localeDateFormat;}
    get localeTimeFormat():string{return this._localeTimeFormat;}
    get isTwelveHour():boolean{return this._isTwelveHourClock;}

    /**
     * Formats a date value based on the given format options. Default is the browser's current locale.
     * @param value - The date value.
     * @param options - The format options.
     */
    formatDateTime(value:Date,options?:Intl.DateTimeFormatOptions):string{
        let formatter = options ? new Intl.DateTimeFormat(this.locale,options) : this._dateInternationalization;
        return formatter.format(value);
    }

    /**
     * Formats a numeric value based on the given format options. Default is the browser's current locale.
     * @param value - The number value.
     * @param options - The format options.
     */
    formatNumber(value:any|number,options?:Intl.NumberFormatOptions):string{
        let formatter = options ? new Intl.NumberFormat(this.locale,options) : this._numberInternationalization;
        return formatter.format(value);
    }
    /**
     * Takes in a date value and returns the day long name.
     * @param date - The date value.
     */
    getDayLongName(date:Date):string{
        let formatter = new Intl.DateTimeFormat(this.locale,{weekday:"long"});
        return formatter.format(date);
    }

    /**
     * Takes in a date value and returns the day short name.
     * @param date - The date value.
     */
    getDayShortName(date:Date):string{
        let formatter = new Intl.DateTimeFormat(this.locale,{weekday:"short"});
        return formatter.format(date);
    }

    /**
     * Takes in a date value and returns the month long name.
     * @param date - The date value.
     */
    getMonthLongName(date:Date):string{
        let formatter = new Intl.DateTimeFormat(this.locale,{month:"long"});
        return formatter.format(date);
    }

    /**
     * Takes in a date value and returns the month short name.
     * @param date - The date value.
     */
    getMonthShortName(date:Date):string{
        let formatter = new Intl.DateTimeFormat(this.locale,{month:"short"});
        return formatter.format(date);
    }
    //#endregion
}
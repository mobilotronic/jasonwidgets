import {IJasonEventManager, IJasonWidget, IJasonWidgetOptions, IJasonWidgetUIHelper} from "./interfaces/common";
import { ISBFObservable } from "../../../simplebindingframework/src/common/interfaces";
import { SBFObservable } from "../../../simplebindingframework/src/common/sbfObservable";
import { SBFCommon} from "../../../simplebindingframework/src/common/sbfCommon";
import {JasonEventManager} from "../common/jasonEventManager";
import {JasonCommon} from "../common/jasonCommon";
import {JasonLocalization} from "../localization/jasonLocalization";
import {JasonDOM} from "../common/jasonDOM";


export class BaseJasonWidget<T> implements IJasonWidget<IJasonWidgetOptions>{
    //#region private
    private readonly _htmlElement: HTMLElement;
    private readonly _options: IJasonWidgetOptions;
    private readonly eventManager:IJasonEventManager;
    private readonly uiHelper: IJasonWidgetUIHelper;
    private _errorWhenInvalid:string;
    //#endregion

    //#region protected
    protected initialize(){
        this.initializeOptions();
        this.initializeEvents();
        this.initializeUI();
    }
    protected initializeOptions(){
        if(!SBFCommon.isObservable(this._options.enabled)){
            if(typeof this._options.enabled == "boolean")
                this._options.enabled = new SBFObservable<boolean>(this._options.enabled);
            else
                JasonCommon.throwError("typeError","Enabled property must be a boolean.");
        }
        if(!SBFCommon.isObservable(this._options.readonly)){
            if(typeof this._options.readonly == "boolean")
                this._options.readonly = new SBFObservable<boolean>(this._options.readonly);
            else
                JasonCommon.throwError("typeError","Readonly property must be a boolean.");
        }
        if(!SBFCommon.isObservable(this._options.visible)){
            if(typeof this._options.visible == "boolean")
                this._options.visible = new SBFObservable<boolean>(this._options.visible);
            else
                JasonCommon.throwError("typeError","Visible property must be a boolean.");
        }
        if(typeof this._options.localization == "string")
            this._options.localization = new JasonLocalization(this._options.localization);
        else{
            if(!(this._options.localization instanceof JasonLocalization) || this._options.localization == null){
                this._options.localization = new JasonLocalization();
            }
        }
        for(let r in this._options.validationRules){
            let validationRule = this._options.validationRules[r];
            if(validationRule.name){
                let defaultValidationRule = JasonCommon.validationRule(validationRule.name);
                //if a rule matches one of the default ones, set the validate method,
                //only if not already set.
                if(defaultValidationRule && !validationRule.validate)
                    validationRule.validate = defaultValidationRule.validate;
            }
        }
    }
    protected initializeEvents(){
    }
    protected initializeUI(){
        this.uiHelper.renderUI();
    }
    //#endregion

    //#region constructor
    /**
     * Creates a new JasonWidget.
     * @param htmlElement - The html element.
     * @param options - The options.
     * @param uiHelper - The UI helper.
     */
    constructor(htmlElement:HTMLElement,options?:IJasonWidgetOptions,uiHelper?:IJasonWidgetUIHelper | { new(widget:IJasonWidget<any>):IJasonWidgetUIHelper }) {
        this._htmlElement = htmlElement;
        this._htmlElement.classList.add(JasonDOM.classes.JW_BASECLASS);
        this._options = JasonCommon.extendObject(options,[{
            events: {},
            validationRules: {},
            enabled: new SBFObservable<boolean>(true),
            readonly: new SBFObservable<boolean>(null),
            visible: new SBFObservable<boolean>(true)
        }]);
        this.eventManager = new JasonEventManager();
        this.uiHelper = JasonCommon.isJasonWidgetUIHelper(uiHelper) ? uiHelper : new uiHelper(this);
        this.initialize();

    }
    //#endregion

    addEventListener(eventName: string, eventListener: (sender?: IJasonWidget<IJasonWidgetOptions>, eventData?: any) => void) {
        this.eventManager.addWidgetEvent(this,eventName,eventListener);
    }

    destroy() {
    }

    triggerEvent(eventName: string, eventData?: any, eventsTriggeredCallback?: () => void) {
        this.eventManager.triggerWidgetEvent(this,eventName,eventData);
    }

    validate(): boolean {
        this._errorWhenInvalid = undefined;
        let result = true;
        for(let rule in this.options.validationRules){
            let validationRule = this.options.validationRules[rule];
            result = result && validationRule.validate(this.value.value,validationRule.ruleComparisonValue);
            if(!result) {
                this._errorWhenInvalid = typeof validationRule.message == "function" ? validationRule.message(this.value) : validationRule.message;
                break;
            }
        }
        return result;
    }

    get htmlElement(): HTMLElement { return this._htmlElement;};
    get options(): IJasonWidgetOptions{return this._options;};
    value:ISBFObservable<any> = new SBFObservable(null);
}


export class BaseJasonWidgetUIHelper<T> implements IJasonWidgetUIHelper{
    //#region private
    private readonly _widget:IJasonWidget<T>;
    //#endregion

    //#region protected
    protected initialize(){}
    protected initializeTemplates(){}
    //#endregion

    //#region constructor
    constructor(widget:IJasonWidget<T>) {
        this._widget = widget;
    }
    //#endregion

    clearUI() {
        let parent = this.htmlElement.parentElement;
        parent.removeChild(this.htmlElement);
    }

    renderUI() {
        this.initialize();
        this.initializeTemplates();
        //To be implemented by descendants
    }

    get htmlElement(): HTMLElement{return this._widget.htmlElement;}
    get widget(): IJasonWidget<T>{return this._widget;}
}
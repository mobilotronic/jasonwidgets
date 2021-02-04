import {IJasonWidget, IJasonWidgetDictionary, IJasonWidgetOptions, IJasonWidgetUIHelper} from "../interfaces/common";
import {BaseJasonWidget, BaseJasonWidgetUIHelper} from "../baseJasonWidget";
import { ISBFLocalization } from "../../../../simplebindingframework/src/common/interfaces";
import {SBFBaseBindingHandler} from "../../../../simplebindingframework/src/bindingHandlers/sbfBindingHandler";
import {SBFTemplateBindingHandler} from "../../../../simplebindingframework/src/bindingHandlers/sbfTemplateBindingHandler";
import {SBF_SKIP_CONTEXT_BINDING} from "../../../../simplebindingframework/src/common/sbfCommon";


import {JasonDOM} from "../../common/jasonDOM";
import {ISBFObservable} from "../../../../simplebindingframework/build/production";

export interface IJasonTextBoxOptions extends IJasonWidgetOptions{
    /** Placeholder attribute value.*/
    placeHolder:string | ISBFObservable<string>;
}

const supportedEvents:IJasonWidgetDictionary<boolean> = {};
const ONCHANGE:string = "onChange";
supportedEvents[ONCHANGE] = true;

/** JasonTextbox */
export class JasonTextbox extends BaseJasonWidget<IJasonTextBoxOptions>{
    //#region protected
    protected static ONCHANGE:string = "onChange";

    protected initializeEvents() {
        super.initializeEvents();
        for(let event in this.options.events){
            let eventInstance = this.options.events[event];
            // if()
            // if(event && event.eventName && typeof event.listener == "function" && supportedEvents[event.eventName.toLowerCase()] == true){
            //     this.addEventListener(event.eventName,event.listener);
            // }
        }
        this.value.addNotificationSubscription((newValue)=>{
            this.triggerEvent(JasonTextbox.ONCHANGE,newValue);
        });
    }

    //#endregion
    //#region constructor
    constructor(htmlElement:HTMLElement,options:IJasonTextBoxOptions,uiHelper?:IJasonWidgetUIHelper) {
        super(htmlElement,options,uiHelper ? uiHelper : JasonTextboxUIHelper);
    }
    //#endregion
}

/** JasonTextboxUIHelper */
class JasonTextboxUIHelper extends BaseJasonWidgetUIHelper<IJasonTextBoxOptions>{
    //#region private
    private templateBindingHandler : SBFTemplateBindingHandler;
    protected initialize() {
        super.initialize();
        this.widget.htmlElement[SBF_SKIP_CONTEXT_BINDING] = true;
        this.templateBindingHandler = new SBFTemplateBindingHandler(this.widget.htmlElement,{
           name:JasonDOM.templates.JW_TEXTBOX_TEMPLATE,
           bindingViewModel:this.widget
        });
    }
    //#endregion

    //#region constructor
    /**
     * Creates a JasonTextbox UI helper.
     * @param widget - The JasonTextbox widget instance.
     */
    constructor(widget:IJasonWidget<IJasonTextBoxOptions>) {
        super(widget);
    }
    //#endregion

    //#region public
    /** Renders the widget's UI*/
    renderUI() {
        super.renderUI();
    }
    //#endregion
}

/** JasonTextboxBindingHandler */
export class JasonTextboxBindingHandler extends SBFBaseBindingHandler<IJasonTextBoxOptions>{
    //#region private
    private jasonTextBox:JasonTextbox;

    private initialize(element:HTMLElement){
        this.jasonTextBox = new JasonTextbox(element,this.bindingOptions);
    }
    //#endregion

    //#region constructor
    /**
     * Creates a JasonTextbox SBF binding handler.
     * @param element - The bound element.
     * @param bindingOptions - The binding options.
     * @param localization - The localization.
     */
    constructor(element:HTMLElement,bindingOptions:IJasonTextBoxOptions,localization?:ISBFLocalization) {
        super(element,bindingOptions,localization);
        this.initialize(element);
    }
    //#endregion
}

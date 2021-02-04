import {IJasonEventManager, IJasonWidget, IJasonWidgetEvent} from "../widgets/interfaces/common";
import {JasonCommon} from "./jasonCommon";

// noinspection DuplicatedCode
export class JasonEventManager implements IJasonEventManager{
    //#region private
    private widgetEvents: Array<IJasonWidgetEvent>;
    private elementEvents: Array<IJasonWidgetEvent>;
    private static JW_EVENTS_ARRAY = "_jwEventListeners_";
    private triggerElementEvent(element: HTMLElement, eventName: string, event:Event) {
        if(this.elementEvents && this.elementEvents.length > 0) {
            let events = this.elementEvents.filter((event) => {
                return event.element == element && event.eventName.toLowerCase() == eventName.toLowerCase() && event.listener && event.enabled;
            });
            events.forEach((event) => {
                if (event.callingContext)
                    event.listener.call(event.callingContext, element, event);
                else
                    // @ts-ignore
                    event.listener(element, event);
            });
        }
    }
    //#endregion

    /**
     * Adds a widget event.
     * @param widget - The widget.
     * @param eventName - The event name.
     * @param eventListener - The event listener.
     */
    addElementEvent(element: HTMLElement, eventName: string, eventListener: (sender: HTMLElement, event: Event) => void,useCapture:boolean = false) {
        if (element.nodeType == void 0 || typeof eventListener != "function")
            JasonCommon.throwError("error","Element is not an HTMLElement or eventListener is not a function.");
        //if there is no event listener array on the element, create it.
        if(!element[JasonEventManager.JW_EVENTS_ARRAY])
            element[JasonEventManager.JW_EVENTS_ARRAY] = [];
        //if there is no event attached to this element, then add it.
        if(element[JasonEventManager.JW_EVENTS_ARRAY].indexOf(eventName) < 0){
            let defaultEventListener = (event:Event)=>{
                this.triggerElementEvent(element,eventName,event);
            };
            element.addEventListener(eventName,defaultEventListener,useCapture);
            element[JasonEventManager.JW_EVENTS_ARRAY].push(eventName);
        }
        this.elementEvents.push({
            eventName:eventName,
            enabled:true,
            listener:eventListener,
            useCapture:useCapture,
            element:element
        });
    }

    /**
     * Adds an element event.
     * @param element - The element.
     * @param eventName - The event name.
     * @param eventListener - The event listener.
     */
    addWidgetEvent(widget: IJasonWidget<any>, eventName: string, eventListener: (sender: IJasonWidget<any>) => void) {
        this.widgetEvents.push({
            eventName:eventName,
            enabled:true,
            listener:eventListener,
            widget:widget
        });
    }

    /** Clears all events.*/
    clearEvents() {
    }

    /**
     * Triggers an element event.
     * @param element - The element.
     * @param eventName - The event name.
     * @param eventData - The event data.
     */
    triggerWidgetEvent(widget: IJasonWidget<any>, eventName: string, eventData:any) {
        if(this.widgetEvents && this.widgetEvents.length > 0) {
            let events = this.widgetEvents.filter((event) => {
                return event.widget == widget && event.eventName.toLowerCase() == eventName.toLowerCase() && event.listener && event.enabled;
            });
            events.forEach((event) => {
                if (event.callingContext)
                    event.listener.call(event.callingContext, widget, eventData);
                else
                    // @ts-ignore
                    event.listener(widget, eventData);
            });
        }
    }
}
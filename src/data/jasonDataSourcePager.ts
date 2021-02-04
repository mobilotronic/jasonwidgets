import {JasonCommon} from "../common/jasonCommon";
import {IJasonDataSourcePagerOptions} from "../interfaces";



export class JasonDataSourcePager{
    //#region private
    private _options :IJasonDataSourcePagerOptions;
    private _pageCount:number;
    private calculatePageSize():number{
        let result = this.options.data.length <= this.options.pageSize ? 0 : Math.ceil(this.options.data.length / this.options.pageSize);
        return result <= 0 ? 1 : result;
    }
    private initialize(options : IJasonDataSourcePagerOptions){
        options.pageSize = this.options.pageSize ? this.options.pageSize : 50;
        options.data = this.options.data ? this.options.data : [];
        this._pageCount = this.calculatePageSize();
    }
    //#endregion

    //#region constructor
    /**
     * Creates a JasonDataSourcePager.
     * @param options - Datasource pager options.
     */
    constructor(options:IJasonDataSourcePagerOptions) {
        this._options = options;
        this.initialize(this._options);
    }
    //#endregion
    //#region public
    /**
     * Returns data for the give page number.
     * @param pageNumber - The page number.
     */
    public getPage<T>(pageNumber:number):Array<T>{
        if(pageNumber < 1 || pageNumber > this._pageCount)
            return null;
        let recordStart = (pageNumber -1) * this.options.pageSize;
        let recordStop = recordStart + this.options.pageSize;
        if(recordStop > this.options.data.length)
            recordStop = this.options.data.length -1;
        if(recordStart == recordStop)
            recordStop++;
        return JasonCommon.cloneArray(this.options.data.slice(recordStart,recordStop));
    }

    /**
     * The page count for the given data based on the defined page size.
     */
    get pageCount():number {return this._pageCount;}

    /**
     * Set pager options.
     * @param value
     */
    set options(value:IJasonDataSourcePagerOptions){
        this._options = value;
        this.initialize(this._options);
    }

    /**
     * Get pager options.
     */
    get options():IJasonDataSourcePagerOptions{return this._options;}
    //#endregion
}
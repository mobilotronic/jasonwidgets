import {JasonCommon} from "../common/jasonCommon";
import {JasonLocalization} from "../localization/jasonLocalization";
import {
    IJasonDataSourceFilter,
    IJasonDataSourceFilterOption,
    IJasonDataSourceGrouping,
    IJasonDataSourceOptions,
    IJasonDataSourceSorting
} from "../interfaces";

class ValueEvaluator{
    static compareValues(fieldValue,filterValue,filterOption:IJasonDataSourceFilterOption):boolean{
        let value1;
        let value2;
        //doing any data type conversion if necessary.
        switch (filterOption.dataType){
            case "date": { value1 = JasonCommon.dateOf(fieldValue);value2=JasonCommon.dateOf(filterValue);break;}
            case "time":{ value1 = JasonCommon.timeOf(fieldValue);value2=JasonCommon.timeOf(filterValue);break;}
            default:
            case "number":
            case "boolean":
            case "string":{ value1 = fieldValue; value2 = filterValue; break;}
        }
        switch (filterOption.operator){
            case "=": { return value1 == value2;}
            case ">": { return value1 > value2;}
            case "<": { return value1 < value2}
            case ">=": { return value1 >= value2;}
            case "<=": { return value1 <= value2}
            case "!=": { return value1 != value2;}
            case "startsWith": {return value1.indexOf(filterValue) == 0}
            case "endsWith": {
                let startingIndex = value1.length - value2.length;
                return value1.indexOf(value2,startingIndex) == startingIndex;
            }
            case "contains": {return value1.indexOf(filterValue) >= 0;}
        }
    }
}

// noinspection JSUnusedGlobalSymbols
export class JasonDataSource<T>{
    //#region private
    private grouping:Array<IJasonDataSourceGrouping>;
    private sorting:Array<IJasonDataSourceSorting>;
    private options:IJasonDataSourceOptions<T>;
    //copy of the original data, so the original are always kept intact.
    private workingData :Array<T>;
    private groupingExists(fieldName):boolean{
        return this.grouping.filter((g)=>{return g.fieldName.toLowerCase() == fieldName.toLowerCase()}).length > 0;
    }
    private sortingExists(fieldName):boolean{
        return this.sorting.filter((g)=>{return g.fieldName.toLowerCase() == fieldName.toLowerCase()}).length > 0;
    }
    private defaultSortComparison(value1:any,value2:any):number{
        if(value1 == value2) return 0;
        return value1 < value2 ? -1 : 1;
    }
    private processSortingOptions(fieldName:string | Array<string> | Array<IJasonDataSourceSorting>){
        if(Array.isArray(fieldName)){
            fieldName.forEach((f)=>{
                //if only a string value is passed, then use all the defaults.
                if(typeof f == "string"){
                    if (!this.sortingExists(f))
                        this.sorting.push({fieldName:f,ascending:true,dataTypeConversion:null,comparisonFunction:this.defaultSortComparison});
                }
                else{
                    //if an IJasonDataSourceSorting object is passed and it has a data type conversion method,
                    //then use that inside the comparisonFunction.
                    let comparisonFunction = this.defaultSortComparison;
                    //if sort direction is not defined, set it to ascending.
                    if(f.ascending == undefined)
                        f.ascending = true;
                    //if the sorting object has a data type conversion method, then use it.
                    if(f.dataTypeConversion){
                        comparisonFunction = (value1:any,value2:any)=>{
                            return this.defaultSortComparison(f.dataTypeConversion(value1),f.dataTypeConversion(value2));
                        }
                    }
                    //depending on the sort direction, set the comparison function.
                    f.comparisonFunction = f.ascending == true  ? comparisonFunction : (value1,value2)=>{
                        return -1 * comparisonFunction(value1,value2);
                    };
                    this.sorting.push(f);
                }
            });
        }
        else
        if (!this.sortingExists(fieldName))
            this.sorting.push({fieldName:fieldName,ascending:true,dataTypeConversion:null,comparisonFunction:this.defaultSortComparison});
    }
    private processData(){
        this.workingData = this.options.data;
        if(this.options.fieldDefinitions && this.options.fieldDefinitions.length > 0){
            //process the field definitions to create localization objects.
            this.options.fieldDefinitions.forEach((fld)=>{
                switch (fld.dataType){
                    case "date":case "time":{fld["jasonLocalization"] = new JasonLocalization(fld.locale,fld.dateTimeFormatOptions);break;}
                    case "number":case "currency":{fld["jasonLocalization"] = new JasonLocalization(fld.locale,fld.numberFormatOptions);}
                }
            });
            this.workingData.forEach((row)=>{
                this.options.fieldDefinitions.forEach((fld)=>{
                    let fieldValue = row[fld.fieldName];
                    switch (fld.dataType){
                        case "date":{
                            if(fld.dateTimeFormatOptions){
                                let newValue = null;
                                if( typeof fieldValue == "string")
                                    newValue = JasonCommon.parseDateValue(fieldValue);
                                if(typeof fieldValue == "number")
                                    newValue = new Date(fieldValue);
                                if(newValue) {
                                    row[fld.fieldName] = fld["jasonLocalization"].formatDateTime(newValue);
                                }
                            }
                            break;
                        }
                        case "time":{
                            if(fld.dateTimeFormatOptions){
                                let newValue = null;
                                if( typeof fieldValue == "string")
                                    newValue = JasonCommon.parseTimeValue(fieldValue);
                                if(typeof fieldValue == "number")
                                    newValue = new Date(fieldValue);
                                if(newValue) {
                                    row[fld.fieldName] = fld["jasonLocalization"].formatDateTime(newValue)
                                }
                            }
                            break;
                        }
                        case "currency":{
                            if(fld.numberFormatOptions && (typeof fieldValue == "string" || typeof fieldValue == "number"))
                                row[fld.fieldName] = fld["jasonLocalization"].formatNumber(fieldValue,fld.numberFormatOptions);
                            break;
                        }
                    }
                });
            });
        }
    }
    /**
     * Iterates through an array and creates a Map object, grouping by the given field name.
     * @param dataToGroup - The array to group.
     * @param fieldName - The field name to group by.
     * @private
     */
    private groupDataFromArray(dataToGroup:Array<any>,fieldName:string):Map<any,any>{
        return dataToGroup.reduce((objectMap:Map<any,Array<T>>,value:any)=>{
            //if a key doesn't exist yet, add it and set the value to be an array.
            if(!objectMap.has(value[fieldName]))
                objectMap.set(value[fieldName],[value])
            else {
                //if a key already exists, then just add to the existing key value.
                objectMap.get(value[fieldName]).push(value);
            }
            return objectMap;
        },new Map());
    }
    /**
     * Iterates through a Map object and replaces the value of its keys with an array of T.
     * If the key value is a Map object, then it calls itself recursively till, it finds an array value.
     * @param map - The map object to group values.
     * @param fieldName - The field name to group values.
     * @private
     */
    private groupDataFromMap(map:Map<any,any>,fieldName:string):Map<any,any>{
        map.forEach((value,key,sourceMap)=>{
            if(value instanceof Map)
                this.groupDataFromMap(value,fieldName)
            else {
                let subGroup = this.groupDataFromArray(value, fieldName);
                sourceMap.set(key, subGroup)
            }
        });
        return map;
    }
    //#endregion

    //#region constructor
    /**
     * Instantiates a JasonDataSource.
     * @param options - JasonDataSource options.
     */
    constructor(options:IJasonDataSourceOptions<T>) {
        this.options =options;
        this.grouping = [];
        this.sorting = [];
        this.processData();
    }
    //#endregion

    //#region public
    /**
     * Returns the datasource's data in their original state, when the datasource was created.
     */
    get data():Array<T>{return this.workingData;}
    set data(value:Array<T>){
        this.options.data = value;
        this.processData();
    }
    /**
     * Returns a Map object with values grouped by the given field name(s).
     * @param fieldName - A field or an array of fields to group by.
     */
    public groupBy(fieldName:string | Array<string>):Map<any,any>{
        if(Array.isArray(fieldName)){
            fieldName.forEach((f)=>{
                if (!this.groupingExists(f))
                    this.grouping.push({fieldName:f});
            });
        }
        else
        if (!this.groupingExists(fieldName))
            this.grouping.push({fieldName:fieldName});
        //building an array of Map objects
        let groupLevels :Array<Map<any,any>> = [];
        //create the first group level.
        groupLevels.push(this.groupDataFromArray(this.options.data,this.grouping[0].fieldName));
        //iterate through the rest of the grouping levels and build a map per level.
        for(let i=1;i<=this.grouping.length-1;i++){
            groupLevels.push(this.groupDataFromMap(groupLevels[i-1],this.grouping[i].fieldName));
        }
        return groupLevels[groupLevels.length-1];
    }
    /**
     * Returns a sorted array based on the given sort field(s).
     * @param fieldName - Field name or field names to sort by.
     */
    public sort(fieldName:string | Array<string> | Array<IJasonDataSourceSorting>) : Array<T>{
        this.processSortingOptions(fieldName);
        //to leave the original data intact, use a copy.
        let dataToSort = [].concat(this.options.data);
        return dataToSort.sort((priorItem,nextItem)=>{
            let sortResult;
            for(let i=0;i<=this.sorting.length-1;i++){
                sortResult = this.sorting[i].comparisonFunction(priorItem[this.sorting[i].fieldName],nextItem[this.sorting[i].fieldName]);
                if(sortResult !== 0) break;
            }
            return sortResult;
        });
    }
    /**
     * Returns a subset of data, based on the given filter.
     * It supports filtering with multiple fields, multiple values per field and logical `AND`/`OR` binding.
     * @param filter - An array of IJasonDataSourceFilter objects.
     */
    public filter(filter:Array<IJasonDataSourceFilter>):Array<T>{
        let dataToFilter = [].concat(this.options.data);
        //preparing the filter options.
        filter.forEach((dataSourceFilter)=>{
            dataSourceFilter.values.forEach((filterValue)=>{
                filterValue.evaluator = ValueEvaluator.compareValues;
            });
        });
        let valueInFilter = false;
        let filterResults = new Map();
        let filterMatchCount = 0;
        //iterating through the data.
        dataToFilter.forEach((dataRow,dataRowIndex)=>{
            //iterating through all filters
            filter.forEach((dataSourceFilter)=>{
                let fieldValue = dataRow[dataSourceFilter.fieldName];
                //iterating through all filter values.
                dataSourceFilter.values.forEach((filterOption,filterValueIndex)=>{
                    if(typeof fieldValue == "string")
                        fieldValue = filterOption.caseSensitive ? fieldValue : fieldValue.toLowerCase();
                    let filterValue = filterOption.value;
                    if(typeof filterValue == "string")
                        filterValue = filterOption.caseSensitive ? filterValue : filterValue.toLowerCase();
                    let priorFilterOption = dataSourceFilter.values[filterValueIndex-1];
                    if(priorFilterOption){
                        if(filterValue == undefined)
                            return;
                        let chainLogicalOperator = priorFilterOption.logicalOperator ? priorFilterOption.logicalOperator : "OR";
                        switch (chainLogicalOperator){
                            case "AND":{
                                valueInFilter = valueInFilter && (filterOption.evaluator(fieldValue,filterValue,filterOption));
                                break;
                            }
                            case "OR":{
                                valueInFilter = valueInFilter || (filterOption.evaluator(fieldValue,filterValue,filterOption));
                                break;
                            }
                        }
                    }
                    else{
                        valueInFilter = filterOption.evaluator(fieldValue,filterValue,filterOption);
                    }
                });
                //if there is a match for this filter's values, mark it as true.
                if(valueInFilter)
                    filterMatchCount++;
            });
            //if all filter conditions have met then add the row to the results.
            if(filterMatchCount == filter.length && !filterResults.has(dataRowIndex)){
                filterResults.set(dataRowIndex,dataRow);
                valueInFilter = false;
            }
            filterMatchCount = 0;
        });
        return Array.from(filterResults.values());
    }
    //#endregion
}
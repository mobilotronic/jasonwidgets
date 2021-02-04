//#region data
export type DataType = "string" | "number" | "boolean" | "object" | "date" | "time" | "currency";
export type ComparisonOperator = "=" | ">" | ">=" | "<" | "<=" | "!=" | "startsWith" | "endsWith" |"contains";
export type LogicalOperator = "OR" | "AND";

/**
 * Detailed description for some or all of the fields of the datasource.
 */
export interface IJasonDataSourceFieldDefinition{
    /**
     * The field name.
     */
    fieldName:string;
    /**
     * The field's data type.
     */
    dataType:DataType;
    /**
     * If set it will be used to format number, date and time values.
     */
    locale?:string;
    /**
     * If set it will format date/time values.
     */
    dateTimeFormatOptions?:Intl.DateTimeFormatOptions;
    /**
     * If set it will format number values.
     */
    numberFormatOptions?:Intl.NumberFormatOptions;
}

/**
 * Datasource options.
 */
export interface IJasonDataSourceOptions<T>{
    /**
     * The datasource's data.
     */
    data:Array<T>;
    /**
     * Optionally define details for one or more fields, so data source will treat them accordingly when needed.
     */
    fieldDefinitions?:Array<IJasonDataSourceFieldDefinition>;
}

export interface IJasonDataSourceFilterOption{
    value:any;
    operator:ComparisonOperator;
    logicalOperator?:LogicalOperator;
    evaluator?:(fieldValue:any,filterValue:any,filterOption:IJasonDataSourceFilterOption)=>boolean;
    caseSensitive?:boolean;
    dataType?:DataType;
}

export interface IJasonDataSourceFilter{
    fieldName:string;
    values:Array<IJasonDataSourceFilterOption>;
    logicalOperator?:LogicalOperator;
}

export interface IJasonDataSourceSorting{
    /**
     * Field name to sort on.
     */
    fieldName:string;
    /**
     * Sort direction. If false, sort will be descending. Default is true.
     */
    ascending?:boolean;
    /**
     * Converts passed in value to a data type, to perform specific data type comparisons.
     * @param value
     */
    dataTypeConversion:(value:any)=>any;
    /**
     * Comparison function for the field name, to be used when sorting.
     * @param value1
     * @param value2
     */
    comparisonFunction?:(value1:any,value2:any)=>number;
}

export interface IJasonDataSourceGrouping{
    fieldName:string;
}
//#endregion

//#region pager
export interface IJasonDataSourcePagerOptions{
    /** Page size. Default is 50.*/
    pageSize?:number;
    /** Data to pagify.*/
    data:Array<any>;
}
//#endregion
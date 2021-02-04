import 'mocha';
import {assert} from "chai";
import {JasonDataSource} from "../../src/data/jasonDataSource";


const mockData = require("../mockdata/countries.json");


interface IJasonDataSourceMockData{
    id:string;
    country:string;
    manufacturer:string;
    model:number;
}

describe("Grouping test",()=>{
    it("Multi level grouping",()=>{
        return new Promise<void>((resolve,reject)=>{
            let jasonDataSource = new JasonDataSource<IJasonDataSourceMockData>({data:mockData});
            let result = jasonDataSource.groupBy(["country","manufacturer","model"]);
            try {
                assert.isNotNull(result);
                assert.equal(result.size,126);
                let china :Map<any,any> = result.get("China");
                assert.equal(china.size,42);
                let bmw :Map<any,any> = china.get("BMW");
                assert.equal(bmw.size,4);
                let year2010 :Array<any> = bmw.get(2010);
                assert.equal(year2010.length,2);
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    });
});

describe("Sorting test",()=>{
    it("Simple sort",()=>{
        return new Promise<void>((resolve,reject)=>{
            let jasonDataSource = new JasonDataSource<IJasonDataSourceMockData>({data:mockData});
            let result = jasonDataSource.sort("country");
            try{
                assert.equal(result[0].country,"Afghanistan");
                assert.equal(result[result.length-1].country,"Zimbabwe");
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    });
    it("Multiple sort",()=>{
        return new Promise<void>((resolve,reject)=>{
            let jasonDataSource = new JasonDataSource<IJasonDataSourceMockData>({data:mockData});
            let result = jasonDataSource.sort(["model","country"]);
            try{
                assert.equal(result[0].country,"Brazil");
                assert.equal(result[result.length-1].country,"Sweden");
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    });
    it("Sort value conversion",()=>{
        return new Promise<void>((resolve,reject)=>{
            let jasonDataSource = new JasonDataSource<IJasonDataSourceMockData>({data:mockData});
            let result = jasonDataSource.sort([
                {
                    fieldName:"model",
                    dataTypeConversion:(value)=>{return value},
                    ascending:false
                },
                {
                    fieldName:"country",
                    ascending:true,
                    dataTypeConversion:(value)=>{return value;}
                }
            ]);
            try{
                assert.equal(result[0].country,"China");
                assert.equal(result[result.length-1].country,"Brazil");
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    });
});

describe("Filter test",()=>{
    it("Multi filter",()=>{
        return new Promise<void>((resolve,reject)=>{
            let jasonDataSource = new JasonDataSource<IJasonDataSourceMockData>({data:mockData});
            let result = jasonDataSource.filter([
                {
                    fieldName:"country",
                    values:[
                        {
                            value:"Czech Republic",
                            operator: "="
                        },
                        {
                            value:"Brazil",
                            operator: "="
                        }
                    ],
                    logicalOperator:"AND"
                },
                {
                    fieldName:"manufacturer",
                    values:[{
                        value:"GMC",
                        operator: "="
                    }]
                }
            ]);
            try {
                assert.equal(result.length, 8);
                assert.equal(result[7].model,2005);
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    })
})
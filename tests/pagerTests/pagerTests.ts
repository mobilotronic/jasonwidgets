import 'mocha';
import {assert} from "chai";
import {JasonDataSourcePager} from "../../src/data/jasonDataSourcePager";

const mockData = require("../mockdata/countries.json");


describe("Pager simple test",()=>{
    it("Test page count and get page",()=>{
        return new Promise<void>((resolve,reject)=>{
            let pager = new JasonDataSourcePager({
                data:mockData
            });
            try {
                assert.equal(pager.pageCount,20);
                let page10 = pager.getPage(10);
                assert.equal(page10.length,50);
                resolve();
            }
            catch (e){
                assert.fail(e.message);
                reject();
            }
        });
    });
});
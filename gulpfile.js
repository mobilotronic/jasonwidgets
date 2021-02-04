const configuration = {
    source:{
        js:"src/**/*.js",
        ts:"src/**/*.ts",
        definitionFiles:"src/**/*.d.ts",
        indexDefinitionFile:"src/index.d.ts",
        packageJSON:"./package.json",
        readme:"./README.md"
    },
    environment: {
        production: {
            output:"build/production"
        }
    }
}

const gulp = require("gulp");
const ts = require("gulp-typescript");
const fsExtra = require("fs-extra");
const shellCmd = require("child_process").spawn;
const gulpBump = require("gulp-bump");
const verdaccio = "http://localhost:4873";


//#region shell commands
function runCommand(command,parameters,ignoreError){
    return new Promise((resolve,reject)=>{
        let result = shellCmd(command,parameters,{stdio:'pipe'});
        result.on('error',(error)=>{ console.error(error);reject();});
        result.on('exit',(code,signal)=>{
            if(ignoreError == true)
                resolve();
            else
                code == 0 ?resolve() : reject();
        });
        result.stdout.on('data',(data)=>{
            console.info(data.toString());
        });
        result.stderr.on('data',(data)=>{
            console.log(data.toString());
        });
    });
}
/**
 * Sets the NODE_ENV to development
 * @param {any} done
 */
function developmentEnv(done) {
    process.env.NODE_ENV = 'development';
    done();
}

/**
 * Sets the NODE_ENV to production.
 * @param {any} done
 */
function productionEnv(done) {
    process.env.NODE_ENV = 'production';
    done();
}

/**
 * Returns the correct configuration object based on the current environment.
 */
function getCurrentEnvironment() {
    return  configuration.environment.production;//process.env.NODE_ENV == "development" ? configuration.environment.development : configuration.environment.docker;
}
//#endregion

//#region helper methods
/**
 * Empties the destination build folder.
 */
function cleanBuildFolder(){
    return fsExtra.emptyDir(getCurrentEnvironment().output).catch((error)=>{console.error(error);});
}
/**
 * Copies all necessary files to the build folder.
 */
function copyFiles() {
    return gulp.src([
        configuration.source.js,
        configuration.source.definitionFiles,
        configuration.source.indexDefinitionFile,
        configuration.source.packageJSON,
        configuration.source.readme
    ]).pipe(gulp.dest(getCurrentEnvironment().output));
}
/**
 * Compiles typescript.
 */
function compileTS() {
    //the rootDir option, forces the compiler to generate the JS where the source TS file is
    //this helps as it doesn't break the folder structure by moving files around.
    let tsProject = ts.createProject("tsconfig.json", { rootDir: "./" });
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest("./"));
}
//#endregion

//#region version helper methods
function incrementMajor(){
    return runCommand("npm",["version","--no-git-tag-version","major"]);
}
function incrementMinor(){
    return runCommand("npm",["version","--no-git-tag-version","minor"]);
}
function incrementPatch(){
    return runCommand("npm",["version","--no-git-tag-version","patch"]);
}
async function publishToVerdaccio(){
    process.chdir("build/production");
    // try {
    //     //await incrementPatch();//runCommand("npm", ["unpublish", "--force", "--registry", verdaccio]);
    // }
    // catch{
    //
    // }
    return runCommand("npm",["publish","--registry",verdaccio]);
}
//#endregion


//#region tasks
/**
 * Outputs in a separate folder for testing purposes.
 */
gulp.task("buildProduction", gulp.series([productionEnv, compileTS,cleanBuildFolder, copyFiles]));
gulp.task("publishToVerdaccio", gulp.series([productionEnv, compileTS,cleanBuildFolder,incrementPatch, copyFiles,publishToVerdaccio]));

gulp.task("compileTS", gulp.series([compileTS]));
gulp.task("publishMajor",gulp.series([incrementMajor,"buildProduction"]));
gulp.task("publishMinor",gulp.series([incrementMinor,"buildProduction"]));
gulp.task("publishPatch",gulp.series([incrementPatch,"buildProduction"]));


//#endregion
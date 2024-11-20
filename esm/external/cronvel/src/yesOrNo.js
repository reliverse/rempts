import Promise from "seventh";
// @ts-nocheck
/*
    yesOrNo( [yes] , [no] , callback )
        * options `Object`
            * yes `string` or `Array` contains a key code or an array of key code that will trigger the yes
            * no `string` or `Array` contains a key code or an array of key code that will trigger the no
            * echoYes `string` if defined this will be what will be outputed in case of yes
            * echoNo `string` if defined this will be what will be outputed in case of no
        * callback( error , result )
            * result: true for 'yes' or false for 'no'
*/
export default function yesOrNo(options, callback) {
    if (typeof options === "function") {
        callback = options;
        options = undefined;
    }
    if (!options || typeof options !== "object") {
        options = {
            yes: ["y", "Y"],
            no: ["n", "N"],
            echoYes: "yes",
            echoNo: "no",
        };
    }
    if (typeof options.yes === "string") {
        options.yes = [options.yes];
    }
    if (!Array.isArray(options.yes)) {
        options.yes = ["y", "Y"];
    }
    if (typeof options.no === "string") {
        options.no = [options.no];
    }
    if (!Array.isArray(options.no)) {
        options.no = ["n", "N"];
    }
    if (!this.grabbing) {
        this.grabInput();
    }
    var onKey = (key) => {
        if (options.yes.indexOf(key) !== -1) {
            if (options.echoYes) {
                this(options.echoYes);
            }
            this.removeListener("key", onKey);
            if (callback) {
                callback(undefined, true);
            }
            else {
                controller.promise.resolve(true);
            }
        }
        else if (options.no.indexOf(key) !== -1) {
            if (options.echoNo) {
                this(options.echoNo);
            }
            this.removeListener("key", onKey);
            if (callback) {
                callback(undefined, false);
            }
            else {
                controller.promise.resolve(false);
            }
        }
    };
    this.on("key", onKey);
    var controller = {}; //Object.create( NextGenEvents.prototype ) ;
    // Stop everything and do not even call the callback
    controller.abort = () => {
        this.removeListener("key", onKey);
    };
    controller.promise = new Promise();
    return controller;
}
;

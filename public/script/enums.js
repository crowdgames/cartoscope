"use strict";
/**
 * The cairn that is being shown on the screen currently.
 */
var CairnState;
(function (CairnState) {
    CairnState[CairnState["noCairn"] = 0] = "noCairn";
    CairnState[CairnState["emojiGreet"] = 1] = "emojiGreet";
    CairnState[CairnState["soapstoneGreet"] = 2] = "soapstoneGreet";
    CairnState[CairnState["emojiMain"] = 3] = "emojiMain";
    CairnState[CairnState["soapstoneMsgTypePick"] = 4] = "soapstoneMsgTypePick";
    CairnState[CairnState["soapstoneSign"] = 5] = "soapstoneSign";
    CairnState[CairnState["soapstoneMain"] = 6] = "soapstoneMain";
    CairnState[CairnState["soapstoneThankYou"] = 7] = "soapstoneThankYou";
})(CairnState || (CairnState = {}));
var CairnType;
(function (CairnType) {
    CairnType["none"] = "none";
    CairnType["both"] = "both";
    CairnType["soapstone"] = "soapstone";
    CairnType["emoji"] = "emoji";
    CairnType["graph"] = "graph";
})(CairnType || (CairnType = {}));
var ResponseOptions;
(function (ResponseOptions) {
    ResponseOptions[ResponseOptions["Yes"] = 0] = "Yes";
    ResponseOptions[ResponseOptions["No"] = 1] = "No";
})(ResponseOptions || (ResponseOptions = {}));

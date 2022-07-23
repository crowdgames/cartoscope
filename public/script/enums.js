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
    CairnType[CairnType["none"] = 0] = "none";
    CairnType[CairnType["both"] = 1] = "both";
    CairnType[CairnType["soapstone"] = 2] = "soapstone";
    CairnType[CairnType["emoji"] = 3] = "emoji";
    CairnType[CairnType["graph"] = 4] = "graph";
})(CairnType || (CairnType = {}));

"use strict";
/**
 * Get type of the Cairn given the single letter abbreviation of the same.
 * Return CairnType.none if abbr doesn't match any other type.
 * @param cairnAbbr abbr of the cairn type
 */
const getCairnTypeFromAbbr = (cairnAbbr) => {
    if (!cairnAbbr)
        return CairnType.none;
    switch (cairnAbbr.toLocaleLowerCase()) {
        case "b":
            return CairnType.both;
        case "e":
            return CairnType.emoji;
        case "s":
            return CairnType.soapstone;
        case "g":
            return CairnType.graph;
        default:
            return CairnType.none;
    }
};
// TODO: figure out better nomenclature for the 2 methods below
const defaultIconArray = () => [
    "/images/dots/cs_green_dot.svg",
    "/images/dots/cs_yellow_dot.svg",
    "/images/dots/cs_orange_dot.svg",
    "/images/dots/cs_red_dot.svg",
    "/images/dots/cs_blue_dot.svg",
    "/images/dots/cs_purple_dot.svg",
    "/images/dots/cs_grey_dot.svg",
];
const defaultPointArray = () => [
    "/images/markers/marker_green2.svg",
    "/images/markers/marker_yellow2.svg",
    "/images/markers/marker_orange2.svg",
    "/images/markers/marker_red2.svg",
    "/images/markers/marker_blue2.svg",
    "/images/markers/marker_purple2.svg",
    "/images/markers/marker_grey.svg",
];
const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};
const pickRandomInArray = (arr) => {
    if (!arr)
        return;
    let randomIdx = getRandomIntInclusive(0, arr.length - 1);
    return arr[randomIdx];
};
/**
 * Modifies the look of the progress bar with the ratio provided.
 * @param graph DOM Element for the bar
 * @param ratio  new ration for progress bar.
 */
const modifyGraphCairnBar = (graph, ratio) => {
    graph.innerHTML = `
    <div style="min-height: 5em;"><div style="color: green; text-align: left">YES</div><div class="w3-border">
        <div id="myBar" class="w3-container w3-padding w3-green" style="width:${ratio}%">
            <div class="w3-center" id="demo">${ratio}%</div>
        </div>
    </div></div><div style="float:right; color: red;margin-top: -15px">NO</div></div>`;
};

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
const showToast = (message) => {
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "left",
        escapeMarkup: false,
        style: { background: "#4663ac" },
    }).showToast();
};
const insertSidebarMsg = (message) => {
    let sidebar = document.getElementById("cairn-sidebar-header");
    let messageElement = document.createElement("p");
    messageElement.innerText = message;
    messageElement.setAttribute("class", "cairn-message");
    sidebar === null || sidebar === void 0 ? void 0 : sidebar.insertAdjacentElement("afterend", messageElement);
};
const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
};
let shuffle = (inA) => {
    let a = inA.slice(0);
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
const serialializeQueryParams = (queryParams) => {
    if (!queryParams.length)
        return "";
    let partiallySerialized = queryParams.map((qp) => `${qp.key}=${qp.value}`);
    return partiallySerialized.join("&");
};
const convertLongitudeToTileX = (longitude, zoom) => {
    return Math.floor(((longitude + 180) / 360) * Math.pow(2, zoom));
};
const convertLatitudeToTileY = (latitude, zoom) => {
    return Math.floor(((1 -
        Math.log(Math.tan((latitude * Math.PI) / 180) +
            1 / Math.cos((latitude * Math.PI) / 180)) /
            Math.PI) /
        2) *
        Math.pow(2, zoom));
};
/**
 * @param dataset name of the dataset
 * @param imageName name of the image
 * @returns the URL for the specified task image.
 */
const taskImageUrl = (dataset, imageName) => `/api/tasks/getImage/${dataset}/${imageName}`;
const soapstoneTypesToMessagesMap = {
    Thanks: [
        "Your",
        ["help", "participation", "effort", "time"],
        ["is helping to", "shows that you want to"],
        [
            "understand the world!",
            "fight coastal damage!",
            "save the planet!",
            "benefit science",
            "care for the gulf",
        ],
    ],
    Collaboration: [
        [
            "Together we can",
            "I know we can",
            "Thank you for helping to",
            "You, me, and the rest of this community can work together to",
        ],
        [
            "save the Lousiana wetlands!",
            "fight environmental damage!",
            "advance science!",
        ],
    ],
    Encouragement: [
        "You",
        [
            "are so helpful!",
            "are doing great!",
            "can do it!",
            "are providing so much helpful data!",
        ],
    ],
    Reassurance: [
        [
            "Don't worry about getting it exactly right,",
            "Do your best,",
            "It's ok if you don't know,",
            "It's ok if you mess up,",
        ],
        [
            "just say what you see",
            "being wrong isn't the end of the world",
            "statistical techniques are used to get the most from your answers.",
        ],
    ],
    Concern: [
        "I",
        ["feel bored", "am having trouble", "feel angry"],
        "with",
        [
            "these images",
            "this task",
            "the state of our environment",
            "pollution and habitat loss",
        ],
    ],
};

/**
 * The cairn that is being shown on the screen currently.
 */
enum CairnState {
  noCairn,
  emojiGreet,
  soapstoneGreet,
  emojiMain,
  soapstoneMsgTypePick,
  soapstoneSign,
  soapstoneMain,
  soapstoneThankYou,
}

enum CairnType {
  none = "none",
  both = "both",
  soapstone = "soapstone",
  emoji = "emoji",
  graph = "graph",
}

enum ResponseOptions {
  Yes = 0,
  No = 1
}
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
  none,
  both,
  soapstone,
  emoji,
  graph,
}

enum ResponseOptions {
  Yes = 0,
  No = 1
}
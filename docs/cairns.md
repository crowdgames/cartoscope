Cairns are piles of rocks left by travelers on hikes. They create a sense of community by reminding travelers that there are others, and also encourages them to keep going onwards. 

In this project we will allow players to take breaks by seeing messages and leave messages behind themselves. 

The primary code for this is within ../public/script/task.js and ../public/templates/tasks/taskTemplate.html

Cairns questions 2021-02-18

# What kinds of cairns do we want?

Cairn types that we've prototyped already:

 - Soapstones (simple messages built from a template that are then displayed to others)
 - Emoji ball pit (leave an emoji behind, join the ballpit, like the one I showed in last Friday's meeting)
 - Emoji path (Archana has this in the figma, but essentially it's a static image of a path that is filled in with emojis like the ballpit)

Cairn types I've heard discussed:

 - Fridge Magnets (list of words that you can move around)
 - Emoji stacking (similar to the ballpit, but more like a traditional cairn)

# What should cairns be tied to?

 - Cairns should be put in a pile, and cairns displayed to other users should be picked randomly from that pile
   - Cairns should not be tied to anything, but we should create the illusion that they are, aka telling people that "someone left you a message for this amount of progression" when in reality it comes from anywhere
 - Cairns should be tied to progression (# of images categorized so far)
 - Cairns should be tied to an image

One of my concerns about tying cairns to progression or images is that we may not have enough cairns to display, especially for the first few users. I imagine that "leaving a cairn" for someone is something that will only happen 2-3 times over the entire task, so it will take a while before we actually build up a library of cairns to display to players. One way to get around this is that we could seed the initial library...

# Other, minor questions

 - What kind of logging should we have?
   - Cairn response
   - Time
   - Progression
   - Image cairn was submitted with
 - How often should "leave a cairn" be presented, how often should "here's a cairn for you" be presented?

== CAIRNS TODO ==

 - soapstone messages should be in one bubble
 - soapstone generation should be in one line
 - soapstone generation should be a hidden div, not a modal

Below are emojis selected by other players. You can click the emojis to throw them around. 

You can add an emoji, if you want to. Pick one that describes how you're feeling!

 - maybe allow emojis to change if you reselect

we may need to make changes to the progress bar

home page might need to be changed because get started takes you to LLL but then LLL doesn't take you home...

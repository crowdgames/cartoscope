Basic information
-----------------

Cairns are piles of rocks left by travelers on hikes. They create a sense of community by reminding travelers that there are others, and also encourages them to keep going onwards. 

In this project we will allow players to take breaks by seeing messages and leave messages behind themselves. 

The primary code for this is within ../public/script/task.ts and ../public/templates/tasks/taskTemplate.html. Ostensibly this code should be abstracted out to its own file, but I'm not sure how to do that.

Problems with the cairns projects
---------------------------------

Cairns are retrieved regardless of project name, which might lead to future generic cairns to be retrieved from other projects that don't make sense. Also all of the issues in [The hitID doc](./hitids.md)

Useful links
------------

Gathering raw response data.
cartosco.pe/api/results/votesKiosk/<hitID>

Starting an arbitrary project:
http://cartosco.pe/kioskProject.html#/kioskStart/<projectID>

Testing cairns frequency (amongst [no cairns, soapstone, emojis] x [every 5-20 imgs, every 20-40, 4060]):
http://cartosco.pe/api/trials/cairns_2008/<hitId>

A local project with cairns for testing:
http://localhost:8081/kioskProject.html#/kioskStart/B7LnS7Uy6kYu?trialId=bee

Project IDs
-----------

These projectIDs are 2008 Land Loss Lookout data and is what the current cairns project uses:
["mKSRWYI4E59f", "Z2cg3ppyCsZW", "vOihRaFY2lSS", "ENtBwQQtcK3L", "DQ0RAb6nVgXr", "D1Y4k21Xb9NL"]

These ids are duplicates of the erosion project. When cairn frequency wasn't tied to hitID, these all had different cairn frequencies, but this is no longer necessary.
("WfpKAneXebT1", "J94tYYPMngNk", "qEEKIgFoFh1m", "dDONGlkBAGUO", "Hzp4vca3LZ4a", "OfohqkweDjEB")

Some local projects: 
localhost:8081/api/anon/startAnon/B7LnS7Uy6kYu?hitId=bbb?trialId=aaa
http://localhost:8081/kioskProject.html#/kioskStart/B7LnS7Uy6kYu?trialId=bee

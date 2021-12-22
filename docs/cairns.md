Basic information
-----------------

Cairns are piles of rocks left by travelers on hikes. They create a sense of community by reminding travelers that there are others, and also encourages them to keep going onwards. 

In this project we will allow players to take breaks by seeing messages and leave messages behind themselves. 

The primary code for this is within ../public/script/task.ts and ../public/templates/tasks/taskTemplate.html. Ostensibly this code should be abstracted out to its own file, but I'm not sure how to do that.

Problems with the cairns projects
---------------------------------

Cairns are retrieved regardless of project name, which might lead to future generic cairns to be retrieved from other projects that don't make sense. Also all of the issues in [the hitID doc](./hitids.md)


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
cartosco.pe/api/results/votesKiosk/(hitID)

Starting an arbitrary project:
http://cartosco.pe/kioskProject.html#/kioskStart/(projectID)

Starting the current LLL project:
https://cartosco.pe/landloss

Testing cairns frequency (amongst no cairns vs emojis every 40-60 images **This is the current cairns/LLL project**)
http://cartosco.pe/api/trials/cairns_2008_l/kiosk_landloss

Testing cairns frequency (amongst [no cairns, soapstone, emojis] x [every 5-20 imgs, every 20-40, 4060]):
http://cartosco.pe/api/trials/cairns_2008/kiosk_landloss

A local project with cairns for testing:
http://localhost:8081/kioskProject.html#/kioskStart/B7LnS7Uy6kYu?trialId=bee

Original LLL project:
https://cartosco.pe/kioskProject.html#/hg_landloss

Webinar cairns link:
https://cartosco.pe/api/trials/cairns_webinar/kiosk_webinar

----

[cairns progress timeline](http://cartosco.pe/api/results/cairns_progress_timeline)

[cairns snapshot from today](http://cartosco.pe/api/results/cairns_snapshot_today)

[cairns labels since launch](http://cartosco.pe/api/results/cairns_snapshot_launch)

cairns snapshot from a certain date (replace YYYYMMDD): http://cartosco.pe/api/results/landloss_snapshot_date/YYYYMMDD

### IDA URLS

[Main Ida project](http://cartosco.pe/ida)\
[Ida progress timeline](http://cartosco.pe/api/results/ida_progress_timeline)\
[Ida snapshot launch](http://cartosco.pe/api/results/ida_snapshot_launch)\
[Ida Survey results](https://cartosco.pe/api/results/ida_survey)

Other Notes (organize this)
---------------------------

Users take 3.88 seconds on average to complete an image

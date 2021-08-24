HitIDs are one of the few parameters that "survives" through the various screens, aka it's accessible by the code in the tutorial, the main gameplay, the survey, etc.

The other parameter is the project id (and by extension any information about the project in the databases)

When testing experimental conditions using the project is often a bad idea, since this means that projects have to be duplicated for each experimental condition. For this reason, the cairns project encoded information about how frequently cairns should be presented within the HitID. This is bad design since the hitID is a string and is visible to the user. Future projects should likely come up with a better way to pass information through.

A cairns hitID looks like this: mturk_larger_cairns-s-5-20

The major parts of the hitID are split by underscores.

 - The first section (mturk) indicates that the mturk consent form should be shown. Alternatively, this section could be "kiosk" to show the kiosk consent form.
 - The second section is a project identifier. So in this case, it is the "larger" project.
 - The last part indicates that this is a cairns project, and that "s" (soapstone) cairns should be shown every 5-20 images.

The mturk indicates that the mturk consent form should be shown etc. The cairns-s-5-20 determines that it should be soapstone cairns shown every 5-20 images.

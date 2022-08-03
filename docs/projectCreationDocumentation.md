# Project Creation Documentation


1. [Setting up a User](#user-setup)
2. [Basic Info](#basic-info)
3. [Task Setup](#customizing-task)
4. [Image Upload](#image-upload)
5. [Publish Settings](#publish-settings)
6. [Tutorial Setup](#tutorial)
7. [Survey Setup](#survey)
8. [Hub projects](#hub-projects)

## User Setup

To create a Cartoscope account which can create projects, navigate to `https://cartosco.pe/#/login` and click "Register". After registration, contact the cartoscope team to receive authorization to create projects.

Once your user has been authorized, logging in will take you to a landing page where you can press "New Project" to start building your first project!

## Basic Info

![image](https://user-images.githubusercontent.com/14333910/161303884-b82ab7d9-dd52-44e4-ac30-d53fd8a127b3.png)

This is the tab for setting basic information about your project, like the title (project name) and full description. 
If you wish to make your project available on Tile-o-Scope AR as well (TOSAR), the short description and the friendly name fields will be shown on TOSAR instead. This tab also contains some advanced settings:

- Scistarter: Check this option and paste a valid scistarter form to allow participants to report their contributions on Scistarter projects. A banner at the end of the task will appear, that redirects participants to that form. For example, this is the form link for scistarter land loss lookout: `https://scistarter.org/form/landlosslookout`
- External Sign Up: Check this option and paste a valid form url if you want to embed external forms at the end of the task, or the results page. Useful when creating projects with organizations that would like to set up signing up for memberships,newsletters etc.
- iNaturalist: TOSAR specific. Check this option if you are uploading a iNaturalist dataset for TOSAR, and you'd like to allow participants to be able to report their labels back to iNaturalist.

## Customizing Task

![image](https://user-images.githubusercontent.com/14333910/161305889-2cae98aa-1c77-4968-9ec2-90ec38716457.png)

In this tab, you are able to select what type of task you would like participants to do. We currently support 4 types:

- Tagging: Assign a label to an image, based on the question you choose.
- Mapping: Similar to the tagging task, but also show a map next to the image, pointing to the image's location. Requires images to be geo-tagged. Example use cases for this type of task include using the map as a "before" view of an area, or asking participants to search around the map. 
- NGS Map: This type of task utilizes the National Geodetic Survey map service. Instead of uploading images, in this type of task you will be asked to upload a set of locations with latitude and longitude, as well as a link to a map from NGS (e.g. [NGS map for Hurricane Ida](https://storms.ngs.noaa.gov/storms/ida/index.html) ). Useful for rapidly deploying projects for monitoring points of interests covered in flights on NGS maps.
- Slider (beta): Similar to tagging task, but instead of showing one image, show a slider where participants can switch between two versions. Works best with images that are properly aligned for smooth transitions.
- Markers (advanced): While we don't currently offer it on the project creation UI, we also support a variation of the mapping task, where markers are dropped on the map on various locations. _Information on how to setup this type of task coming soon_

## Image Upload

![image](https://user-images.githubusercontent.com/14333910/161307874-59f1ca6f-1fe7-4e8e-867d-c754130d656b.png)

In this step, you will be asked to upload images. We offer two ways to do so, Dropbox (beta), and local upload from your computer. If you wish to utilize the mapping capabilites of Cartoscope (e.g. showing map results for your project, setting up a mapping task, etc.), your images need to be geo-tagged. Cartoscope reads exif tags of uploaded images to determine latitude and longitude information. Example tools for geo-tagging include [Exiftool](https://exiftool.org/). If you don't want to use the mapping capabilities, uncheck the 'Images have coordinates' option, to make a simple labeling project.

- Tagging/Mapping projects: You must upload a .zip or .tar file that contains the images. 
- NGS Map: You must a) provide a link to the NGS map you want to use and b) upload a .zip file that contains a .csv with names and coordinates of locations that you wish to be monitored.
- Slider: For every image, you should also provide a 'before' version, which is denoted by prepending the name of the image with 'before_'. For example, you for image a.jpg, you should also have a before_a.jpg image. This way the slider will switch between files before_a.jpg (left) and a.jpg (right). 

## Publish Settings

- Public: Project will be showing on the Cartoscope main page.
- Private: Project will only be accessible via link. **Please use this option when testing projects**

## Tutorial

![image](https://user-images.githubusercontent.com/14333910/161312145-babf54cb-aca2-4714-b25f-fecbde619e94.png)


You can set up tutorials for your projects here. We currently offer two ways, choosing from images in the project, and uploading custom tutorials. **When first making the project, you may get an error that no images available yet, as your image upload has not finished yet. Proceed to next steps of the project creation by clicking save. After you've published the project, you can setup the tutorial by editing the project.**. If you continue to receive this error after you've published the project and returned, there may have been something wrong with your image upload.

- Upload Tutorial: Use this option if you wish to use examples that are not in your dataset, or if you wish to show annotations. You will have to upload a .zip file containing the images for the tutorials, along with a csv containing information for every tutorial image.
    - The CSV should have the following columns: image_name, answer, explanation, image_annotation, ask_user
      - image_name: The name of an image file. Must be included within the tutorial zip file
      - answer: The text of the correct answer. e.g. if your project has "Yes" and "No" as potential answers, then "answer" within the tutorial csv can be "Yes". Keep capitalization in mind
      - explanation: HTML describing why the answer is the correct answer.
      - image_annotation: The name of an image file represented an annotated version of the main image. Must be included within the tutorial zip file.
      - ask_user: 0 or 1. 0 if the user should just be shown the correct answer immediately, 1 if the user should be quizzed on the right answer.
- Choose existing: 
  - Click the 'Add item' button to start adding examples. For every example, pick an image from the dataset, the correct answer, and an explanation to show participants. Unchecking the 'ask user' option will set this item in _information_ mode: directly show the image and the explanation.
  - You can change the order of the examples by clicking the arrows on the left.
  - Once you have added all the tutorial items you wish, click the 'Update Tutorial' button.

## Survey

![image](https://user-images.githubusercontent.com/14333910/161313549-9cf6a71c-8ba7-4889-a85d-9558594fe89e.png)

Surveys appear at the end of the task. We currently offer 2 template surveys (NASA TLX, IMI), as well as an option to create your own custom survey. We support various options for questions, such as open ended questions (textarea), radio buttons, checkboxes, and likert scales. For radio buttons and checkboxes, you have to input the options separated in commas (see example above). You can re-order items by clicking the arrows on the left. Once you are done adding questions, click the Add Survey button to set the survey.

## Hub Projects

Cartoscope now supports hub projects! Hub projects are super-projects that contain multiple sub-projects. By creating a hub project, you can redirect participants to multiple sub-projects and see aggregated results from different options across sub-projects, all in one convenient hub page. Examples of hub projects include the LandLoss Lookout projects.

To create a hub project, you must first create the sub-projects for it. **Currently, we only support projects that have the same dataset** The easiest way to do so is to start by creating one project on Cartoscope and duplicating:

1. Create a project on Cartoscope for the first sub-project. Make sure to upload the dataset you want for all subprojects, survey questions, and any advanced settings you want all sub-projects to share (e.g. Scistarted links, external sign ups etc.).
2. Duplicate the first sub-project. The duplicated project will share the same dataset and survey as the first. Edit the duplicated project to set up new questions and answers.
3. Repeat the duplication process for the number of sub-projects you wish to have. **We suggest you restrict the number of sub-projects to at most 7**
4. Set up tutorials for each sub-project.
5. Make a new hub project:
6. 1. Basic Info: Set the title and description that will appear in the hub page. Choose an identifier for your hub project in the URL Link. Your hub project will be accessible at cartosco.pe/hub/URL_LINK 
7. Choose Subprojects: Add the subprojects you wish to be part of the hub project. For each subproject, pick the label you want to be included in the aggregated hub results page. **For best results, make sure you pick distinct label options in the subprojects**. For example, if you have two sub-projects that look at patterns A and B, instead of giving Yes/No options for both, set the options as A/No A and B/No B. 

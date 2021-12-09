# Cartoscope

Cartoscope is a platform for citizen science mapping. By sorting, labelling, and locating images, you can contribute to a variety of projects, including disaster response. Each member’s contribution adds up!

[Click here for the live website](https://cartosco.pe/#/home)

# Installation instructions

 1. Install [Virtualbox](https://www.virtualbox.org/)
 2. Install [Vagrant](https://www.vagrantup.com/downloads)
 3. Clone this repository (`git clone https://github.com/crowdgames/cartoscope.git`)
 4. Using the appropriate command line for your operating system, navigate to where you cloned the repository and run the command `vagrant up; vagrant ssh`. This will ssh you into the virtual machine that will host the website
     1. **If you are using windows, the command line must have administrator privileges.**
 5. Run the command `./run.sh`
 6. Open localhost:8081 on a web browser

## Setting up users

To make projects for testing purposes, you need to create a user on the website.

 1. Your main page is at http://localhost:8081 (where 8081 is the port specified in `Vagrantfile`)
 2. For the remainder of the instructions, we will use port 8081 as the selected port:
 3. In order to start setting up projects, you will need to register a user by going to http://localhost:8081/#/login
 4. Make sure your registered user's name is `cartoproject` for project creation privileges to apply.
 5. Ensure that is_creator=1 for your user in the convergeDB database, table "users". Set is_creator=1 if not so
 6. Login with the user and create a project
 7. **Caution** The current setup does not provide a graphical interface for creating project tutorials. This can be accomplished by adding the image files to the `cartoscope_backend/public/images/Tutorials/` folder and adding the relevant information to the 
	
## Information and recommendations for developers

 - Since this project uses vagrant, it is helpful to know the basics of vagrant, such as `vagrant up`, `vagrant ssh`, `vagrant suspend`, `vagrant halt`, and `vagrant destroy`
 - All of the code for the project will be in `/vagrant`. Going forward, it will be assumed that that is the working directory
 - This project uses typescript, and it is necessary to compile the typescript code with `tsc` every time you make code changes. You can run `tsc --watch` to run a server that will automatically recompile the ts code when you make a code change.
 - `nodemon` is a useful utility when developing.
 - While not strictly necessary, it is recommended that you copy `vagrant-files/config-auth.sh.example` to `vagrant-files/config-auth.sh` and edit the file to your liking. **DO THIS BEFORE RUNNING `vagrant up`**
 - Similarly, it is recommended to look at `vagrant-files/envs.sh` and edit those to your liking. **DO THIS BEFORE RUNNING `vagrant up`**

## Legacy install instructions

[See the legacy install instructions](docs/legacy_install_instructions.md)


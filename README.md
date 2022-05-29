# Cartoscope

Cartoscope is a platform for citizen science mapping. By sorting, labelling, and locating images, you can contribute to a variety of projects, including disaster response. Each member’s contribution adds up!

[Click here for the live website](https://cartosco.pe/#/home)

[Instructions for creating projects on the live website](docs/projectCreationDocumentation.md)

# Installation instructions

 1. Install [Virtualbox](https://www.virtualbox.org/)
 2. Install [Vagrant](https://www.vagrantup.com/downloads)
 3. Clone this repository (`git clone https://github.com/crowdgames/cartoscope.git`)
 4. Using the appropriate command line for your operating system, navigate to where you cloned the repository and run the command `vagrant up; vagrant ssh`. This will ssh you into the virtual machine that will host the website
     1. **If you are using windows, the command line must have administrator privileges.** (i.e. You must run the command line as administrator)
     2. If this does not work, use the polsedit utility to grant the SeCreateSymbolicLink privilige to your user and then restart your computer.

 5. Run the command `./run.sh`
 6. Open localhost:8081 on a web browser
 
Note: In windows installation if you see "not a valid identifier" when logging in, run `dos2unix .bashrc`. Sometimes files are copied over into vagrant with Windows file endings when they are expecting unix file endings.
      
## Setting up users

To make projects for testing purposes, you need to create a user on the website.

 - Your main page is at http://localhost:8081 (where 8081 is the port specified in `Vagrantfile`)
 - For the remainder of the instructions, we will use port 8081 as the selected port:
 - In order to start setting up projects, you will need to register a user by going to http://localhost:8081/#/login
 - Make sure your registered user's name is `cartoproject` for project creation privileges to apply.
 - Ensure that is_creator=1 for your user in the convergeDB database, table "users". Set is_creator=1 if not so
 - Login with the user and create a project. An example dataset can be provided to you upon request.
	
## Information and recommendations for developers

 - Since this project uses vagrant, it is helpful to know the basics of vagrant, such as `vagrant up`, `vagrant ssh`, `vagrant suspend`, `vagrant halt`, and `vagrant destroy`
 - All of the code for the project will be in `/vagrant`. Going forward, it will be assumed that this is the working directory
 - This project uses typescript, and it is necessary to compile the typescript code with `tsc` every time you make code changes. You can run `tsc --watch` to run a server that will automatically recompile the ts code when you make a code change.
 - `nodemon` is a useful utility when developing.
 - While not strictly necessary, it is recommended that you copy `vagrant-files/config-auth.sh.example` to `vagrant-files/config-auth.sh` and edit the file to your liking. **DO THIS BEFORE RUNNING `vagrant up`**
 - Similarly, it is recommended to look at `vagrant-files/envs.sh` and edit those to your liking. **DO THIS BEFORE RUNNING `vagrant up`**

## Legacy install instructions

[See the legacy install instructions](docs/legacy_install_instructions.md)

## Vagrant Developer Instructions
  - Assumed mmmagic module was causing the issue stopping the code base from working in Linux systems and M1 macs and resolved it
  - Removed mmmagic module from the entire code base.
  - Removing mmmagic module partially resolved the issue such that currently the code base is Working in Linux systems.
  - Changed and updated the method using which images are uploaded.
  - Yet to figure out other ways to make it work in M1 mac.


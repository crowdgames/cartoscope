This document is meant for developers and discusses tips and thoughts around testing. We need to ensure that any changes we make won't break important flows or critical code.

Flows
-----

Flows are the steps taken by cartoscope users as they use the site.

#### Common Flows

 - Login / User 
      - Enter the registerd username and password(creator role) 
      - Cick on login
      - If user exists 
        - takes you to http://localhost:8081/UserProfile.html#/profile
   - Registering a user with the appropriate modal.
 - Creating a project as a non-admin
   - mailto link to the cartoscope team pops up.
 - Creating a project as an admin
   - Test each tab of the creation process...
 - Main project flow
   - Tutorial
   - Main Game
   - Survey
   - Results page
 - Cairns

#### Uncommon Flows

#### Rare Flows

Critical Code
-------------

This section is an informal listing of files / functions that are heavily used by the project, and thus deserve heavy scrutiny and testing.

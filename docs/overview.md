This is an overview of the cartoscope project from a technical angle.

 - This project uses mySQL to store information about projects and output data from volunteers. The code that accesses the database is located in the `db/` folder.
 - Code for handling various urls will be in `app.js` or `routes/`
 - Code for the main image labeling task and cairns will be in `public/script/task.ts`
 - Most of the primary code used in the website is in `public/script`


Tutorial/Gaming Code

- Code for Home page (Kiosk Start Project) `public/kioskProject.html`
    - Header Page `public/navbar.html`
    - Content - Home Page `public/templates/kiosk/appModular.html`
    - Footer Page `public/footer.html`
    - Styles in `public/styles/consent_new.css`, `public/styles/consent.css`
- Code of tutorial pages are in `public/templates/kiosk/example.html`

Consent form locations (The consent form is hardcoded in a variety of locations. These are the files which should be changed if the consent form is ever updated. Going forward, this should be centralized.)

 - public/templates/consent/consent.html
 - public/templates/kiosk/appLandLoss.html
 - public/templates/kiosk/appModular.html
 - public/templates/kiosk/consent.html

Also:

 - public/logon.html
 - public/navbar.html
 - public/new_homepage.html
 - public/new_homepage_ar.html
 - public/templates/home/tandc.html
 - public/templates/kiosk/appLandLoss.html
 - public/templates/kiosk/appModular.html
 - public/templates/userProfile/tandc.html
 - public/termsOfUse.html

# QCFirst
## Goal:
- Course enrollment / management system for professors and students.
- Students can enroll, bookmark, and search for courses.
- Professors can manage, add, and edit their courses.

## Design:
### Desktop Visual Design:
- Responsive, built to scale.
- Similar and easily adapted to the Tablet and Mobile versions.
![DesktopDash](https://github.com/snecola/qcfirst/blob/main/Visual%20Design/Desktop%20Visual%20Design.png?raw=true)


### Mobile Visual Design:
- 1 column course view to make it adaptable to any phone screen size.
- Dashboard uses 2 column grid layouts to add buttons for each course. 
![MobileDash](https://github.com/snecola/qcfirst/blob/main/Visual%20Design/Mobile%20Visual%20Design.png?raw=true)

### Tablet Visual Design:
- Copy / Larger scale of a mobile design. with 3 columns instead of 2 for the dashboard.
- 2 column grid layout for the course view.
![TabletDash](https://github.com/snecola/qcfirst/blob/main/Visual%20Design/Tablet%20Visual%20Design.png?raw=true)

## Code:
### HTML Structure:
All HTML files validated by https://validator.w3.org/
#### Login - Signup - Forgot password
Plan is for anything referring to index.html to refer you to the appropriate dashboard is user session is valid. Still have to learn backend development.
- index.html
- forgotpassword.html
- signup.html
#### Dashboard for Instructors - Dashboard for Students
Plan is to set up the dashboard with the appropriate information based on the user. 
The HTML structure is present and ready to insert classes based on user's backend information.
- student-dashboard.html
- instructor-dash.html
#### Course Views
The course view page has different templates to insert information using js for instructors and students, as well as editability options for instructors.
- course-manageinstructor.html
- course-manage-student.html
#### Searching and adding new courses
Students can search and enroll in new courses using an advanced search form or a search bar on the dashboard. They can also drop or swap courses.
- course-search.html
- drop-course.html
- swap-course.html
- search-results.html

Instructors can edit or delete courses from the course view page and add new courses from their dashboard.
- add-new-course.html
- edit-course.html

### CSS Structure:
All css files validated by https://jigsaw.w3.org/css-validator/
#### Bootstrap Framework for responsive design
Using a mobile first approach with Bootstrap's Flexbox grid system, the QCFirst webapp is as functional, accessable, and pleasing to use on every device.
- There are separate CSS style sheets for all non-bootstrap styling rules. Usually consisting of padding, margins, breakpoints, and colors.
- The grid system is reliant on bootstrap and its HTML classes.
- Icons are flush with the design and all SVG files were drawn by me using Google Drawings.


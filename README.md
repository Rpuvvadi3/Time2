# DailyPlannerCS3704 - Time2

## Description
Our project is a unified to-do list and calendar web application that allows users to stay organized by scheduling events and tasks. After logging in or creating an account, users are taken to the calendar page, where they can easily add new events or tasks and assign details, such as name, date, and priority. To-do lists have a separate page where multiple can be created and stored, with each containing a list of tasks. These lists, however, do not have a separate functionality, as they can also be integrated into the calendar, where tasks will be placed into the calendar based on priority.

## Technologies used:
Frontend: JavaScript, React, Tailwind, Vite, Material UI, FullCalendar

Backend: Java, Spring Boot, PostgreSQL (database)

Infrastructure/Cloud: AWS S3 Bucket (hosting static frontend), AWS Elastic Beanstalk (deploying backend), AWS RDS (hosting database)

DevOps: GitLab, Docker (containerization)

## Installation (will run locally)
1. Set up an SSH key on Gitlab AND install Docker Desktop if you haven't already.
2. Open Docker Desktop
3. Clone this repository: `git clone git@code.vt.edu:jchen9896/DailyPlannerCS3704.git`
4. Navigate to frontend: `cd DailyPlannerCS3704/frontend`
5. Install dependencies: `npm install`
6. On a new terminal, navigate to the backend with `cd DailyPlannerCS3704/backend` and run `./mvnw spring-boot:run`
7. On the original terminal (`DailyPlannerCS3704/frontend`), run `npm run dev`
8. Open `http://localhost:5173/` on a browser. Log in with username: `test` and password: `test`.

## For graders: how to run Unit Tests (only works on Windows)
1. Navigate to `DailyPlannerCS3704/backend`
2. Run tests: `./mvnw test`
3. After running, this should be the results: `Tests run: 73, Failures: 0, Errors: 0, Skipped: 0`

## For graders: how to run Acceptance Test Cases
1. Open working system on browser: http://dailyplanner-app-3166.s3-website-us-east-1.amazonaws.com/
2. Log in with username: `test` and password: `test`

### Acceptance Test Case 1: Story 11
Story: As a user I would like to be able to add recurring events. For example, If I have
something I have to do every Tuesday there should be an option to make an event show
up every Tuesday without having to manually add it every week.
Conditions of Satisfaction: When adding an event to the calendar there should be an
option to make it a recurring event where you can set the schedule to be daily, weekly,
monthly, etc.

3. On the Calendar page, click on December 16 to add a recurring event.
4. Set the event details as the following: event name as `Research Meeting`, start and end date as `12/16/2025`, start time as `10:00 AM`, end time as `11:00 AM`, repetition as `Weekly (10 occurrences)`, and leave the rest blank. Click `Create Event`.
5. On the month view, you should be able to see a `Research Meeting` event every Tuesday from 12/16/2025 until 02/17/2025 (only 10 repetitions because infinite events cannot be made).
6. On the weekly and daily views for those Tuesdays, every `Research Meeting` should only take up the 10:00-11:00 AM timeslots.

### Acceptance Test Case 2: Story 13
As a user who enjoys seeing progress I would like for there to be a feature where I
can track what tasks I have already completed.
Conditions of Satisfaction: When a user has completed a task they can cross it off to
indicate the task is completed and the task will turn grayscale.

7. Navigate to the ToDo Board page and click on `GENERATE NEW LIST`.
8. Name the ToDo list `Chores` and the start and end dates as is. Click `GENERATE LIST`.
9. Click `ADD NEW TASK`, title it `Laundry`, leave the rest as is, and click `ADD TASK`.
10. Repeat Step 9 two more times, but with the following titles: `Buy groceries` and `Vacuum`.
11. Click the ← button to go back to the ToDo Board page. You should see `0 / 3 completed` under the `Chores` list.
12. Click on the `Chores` ToDo list. Click on the box next to `Laundry`. The box should be checked, `Laundry` should be crossed out and gray, and the progress bar should get filled a third.
13. Any combination and proportion of completed tasks should also be reflected in the progress bar. When all tasks in a list are completed, the bar should turn green and have a congratulatory message.

## Authors
Joey Chen, David Luu, Mig Magtoto, Raaga Puvvadi, Rohan Chodapunedi, Benjamin Kwak

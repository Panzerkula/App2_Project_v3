<h1>
Game Score Tracker
</h1>
<br>
<h2>
Game Score Tracker is a fullstack web-based application designed to manage turn-based game scoring with role-based access for regular users and administrators.
</h2>
<br>
<p>
Users can create games, enter and track scores across multiple rounds, and review previously completed games. Administrators have elevated privileges, including the ability to view all users and games, as well as remove users or games when necessary.
The project is actively under development, and some features are not yet fully implemented.
</p>
<br>
<p>
The backend is built with Node.js using Express.js, with session handling implemented via express-session. The project intentionally minimizes third-party dependencies and currently avoids external npm libraries beyond core tooling.
</p>
<br>
<p>
API endpoints are tested using Insomnia.
</p>
<p>
Insomnia test collections, middleware documentation, and Terms of Service / Data Protection policies are available in the /documentation directory.
</p>
<br>
<br>
<h3>
Feature planning:
</h3>
<p>
https://miro.com/app/board/uXjVGO-KVU0=/
</p>
<br>
<h3>
Project management:
</h3>
<p>
https://panzerkula.atlassian.net/jira/software/projects/SCRUM/boards/1
</p>
<br>
<br>
<h3>
Current limitations / known issues in order of priority:
</h3>
<br>
<p>
user_app/user-app.mjs is getting large and complicated, so functions should be moved to specific modules (such as user-auth.mjs and so forth) and then be imported to user-app.mjs
</p>
<br>
<p>
Remove logic from routers and see if functions can instead be called upon there, and add that logic to the newly created modules instead
</p>
<br>
<p>
Application not yet wired to a database, using only session storage
</p>
<br>
<p>
Administrator-privileges not yet fully implemented
</p>
<br>
<p>
Users' profile pictures can currently not be changed
</p>
<br>
<p>
No sanitization of inputs yet
</p>
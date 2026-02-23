<h1>
    Game Score Tracker
</h1>
<br>
<h3>
    Game Score Tracker is a fullstack web-based application designed to manage turn-based game scoring with role-based access for regular users and administrators.
</h3>
<br>
<h3>
    Features:
</h3>
<ul>
    <li>Users can create games, enter and track scores across multiple rounds, and review previously completed games. Administrators have elevated privileges, including the ability to view all users and games, as well as remove users or games when necessary.
    The project is actively under development, and some features are not yet fully implemented.</li>
    <li>The backend is built with Node.js using Express.js, with session handling implemented via express-session. The project intentionally minimizes third-party dependencies and currently avoids external npm libraries beyond core tooling.</li>
    <li>API endpoints are tested using Insomnia.</li>
    <li>Insomnia test collections, middleware documentation, and Terms of Service / Data Protection policies are available in the /documentation directory.</li>
</ul>
<br>
<h3>
    Feature planning:
</h3>
<ul>
    <li>https://miro.com/app/board/uXjVGO-KVU0=/</li>
</ul>
<br>
<h3>
    Project management:
</h3>
<ul>
    <li>https://panzerkula.atlassian.net/jira/software/projects/SCRUM/boards/1</li>
</ul>
<br>
<h3>
    Current limitations / known issues in order of priority:
</h3>
<ul>
    <li>Remove logic from routers and see if functions can instead be called upon there, and add that logic to the newly created modules instead</li>
    <li>Application not yet wired to a database, using only session storage</li>
    <li>Administrator-privileges not yet fully implemented</li>
    <li>Users' profile pictures can currently not be changed</li>
    <li>No sanitization of inputs yet</li>
</ul>
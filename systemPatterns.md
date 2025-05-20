# System Patterns

**System Architecture:**
- The dashboard is a web application built using HTML, CSS, and JavaScript.
- Task data is stored in local storage using the TaskTracker class.
- The AI analysis will be performed using a separate Python script (future).
- The dashboard and the AI script will communicate using a REST API (future).
- Cline Memory Bank will be used to store and retrieve task data and generate task prompts/plans (future).
- The dashboard displays content from `progress.md` and `activeContext.md`.
- The `visual-overview.html` file displays an interactive Mermaid diagram of the project status.

**Key Technical Decisions:**
- Using HTML, CSS, and JavaScript for the dashboard to ensure cross-platform compatibility.
- Using local storage for task data persistence.
- Using Python for the AI analysis due to its rich ecosystem of AI libraries (future).
- Using a REST API for communication to allow for flexibility and scalability (future).

**Design Patterns in Use:**
- Model-View-Controller (MVC) for the dashboard's architecture.
- Observer pattern for updating the dashboard in real-time (future).

**Component Relationships:**
- The dashboard consists of several components, including a task list, a progress display, and an active context display.
- The AI script will provide insights and recommendations to these components (future).

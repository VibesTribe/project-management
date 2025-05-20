// Implementation for documentation-updater.js to track failed attempts and mark tasks as red

// Constants
const FAILURE_THRESHOLD = 3; // Number of failed attempts before marking task as red

// Track task attempts and update status
function updateTaskStatus(taskId, status, wasSuccessful = true) {
  // Get the task
  const task = findTaskById(taskId);
  if (!task) return false;
  
  // If task was unsuccessful, increment attempts
  if (!wasSuccessful) {
    task.attempts = (task.attempts || 0) + 1;
    
    // Check if threshold is reached
    if (task.attempts >= FAILURE_THRESHOLD) {
      task.status = 'failed';
      markTaskAsRed(taskId);
      notifyHumanIntervention(taskId, task);
      return true;
    }
    
    // Still under threshold, keep current status
    return false;
  }
  
  // Success case - reset attempts and update status
  task.attempts = 0;
  task.status = status;
  updateDiagram();
  return true;
}

// Find a task or subtask by ID
function findTaskById(taskId) {
  // Check if it's a main task
  if (tasks[taskId]) {
    return tasks[taskId];
  }
  
  // Check if it's a subtask
  for (const mainTaskId in tasks) {
    const mainTask = tasks[mainTaskId];
    if (mainTask.subtasks && mainTask.subtasks[taskId]) {
      return mainTask.subtasks[taskId];
    }
  }
  
  return null;
}

// Mark task as red in the Mermaid diagram
function markTaskAsRed(taskId) {
  // Update the class of the node in the Mermaid diagram
  const diagram = document.getElementById('mermaid-diagram');
  updateDiagram(diagram, taskId, 'failed');
  
  // Also update the task counter
  updateTaskCounters();
}

// Update Mermaid diagram with new task statuses
function updateDiagram(diagramElement, taskId, status) {
  // Request Mermaid to re-render the diagram
  const currentDiagram = diagramElement.textContent;
  
  // Add or update class definition
  let updatedDiagram = currentDiagram.replace(
    `${taskId}:::planned`, 
    `${taskId}:::${status}`
  ).replace(
    `${taskId}:::inProgress`, 
    `${taskId}:::${status}`
  );
  
  // If no replacement was made, it might not have a class yet
  if (updatedDiagram === currentDiagram) {
    // Find the node definition and add the class
    const nodeRegex = new RegExp(`(${taskId}\\[.*?\\])`, 'g');
    updatedDiagram = currentDiagram.replace(
      nodeRegex,
      `$1:::${status}`
    );
  }
  
  // Update the diagram
  diagramElement.textContent = updatedDiagram;
  mermaid.init(undefined, diagramElement);
}

// Notify that human intervention is needed
function notifyHumanIntervention(taskId, task) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'task-notification failed';
  notification.innerHTML = `
    <strong>Task Failed: ${task.title}</strong>
    <p>This task has failed ${task.attempts} times and requires human intervention.</p>
    <button class="btn" onclick="downloadFailedTaskDetails('${taskId}')">Download Task Details</button>
    <button class="btn" onclick="dismissNotification(this.parentElement)">Dismiss</button>
  `;
  
  // Add to notification area
  const notificationArea = document.getElementById('notification-area');
  if (!notificationArea) {
    // Create notification area if it doesn't exist
    const container = document.querySelector('.container');
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.className = 'notification-area';
    container.insertBefore(notificationArea, container.firstChild);
  }
  
  // Add notification to area
  document.getElementById('notification-area').appendChild(notification);
}

// Download details for a failed task
function downloadFailedTaskDetails(taskId) {
  const task = findTaskById(taskId);
  if (!task) return;
  
  // Generate detailed report
  let taskText = `FAILED TASK REPORT\n`;
  taskText += `=================\n\n`;
  taskText += `Task: ${task.title}\n\n`;
  taskText += `Description: ${task.description}\n\n`;
  taskText += `Status: ${task.status}\n`;
  taskText += `Attempts: ${task.attempts}\n\n`;
  
  taskText += `Related Files:\n`;
  task.relatedFiles.forEach(file => {
    taskText += `- ${file}\n`;
  });
  
  // Include code snippets if available
  if (task.codeSnippets) {
    taskText += `\nCode Snippets:\n`;
    for (const file in task.codeSnippets) {
      taskText += `\n--- ${file} ---\n\n`;
      taskText += task.codeSnippets[file];
      taskText += `\n\n`;
    }
  }
  
  // Add error messages if available
  if (task.errorMessages) {
    taskText += `\nError Messages:\n`;
    task.errorMessages.forEach((error, index) => {
      taskText += `\nAttempt ${index + 1}:\n${error}\n`;
    });
  }
  
  // Create and trigger download
  const blob = new Blob([taskText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `failed-task-${taskId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Dismiss a notification
function dismissNotification(element) {
  element.remove();
}

// Add necessary CSS for notifications
function addNotificationStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .notification-area {
      margin-bottom: 20px;
    }
    
    .task-notification {
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .task-notification.failed {
      background-color: #ffeeee;
      border-left: 4px solid #ff0000;
    }
    
    .task-notification button {
      align-self: flex-start;
    }
  `;
  document.head.appendChild(styleElement);
}

// Initialize the notification system
function initializeNotificationSystem() {
  addNotificationStyles();
  
  // Add notification area if it doesn't exist
  if (!document.getElementById('notification-area')) {
    const container = document.querySelector('.container');
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.className = 'notification-area';
    container.insertBefore(notificationArea, container.firstChild);
  }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeNotificationSystem();
});

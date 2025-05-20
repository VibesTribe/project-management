// Enhanced task data with subtasks
const tasks = {
  "RedMarking": {
    title: "Implement Automatic Red Task Marking",
    description: "Modify documentation-updater.js to track failed attempts and mark tasks as 'red' after three failures.",
    relatedFiles: ["scripts/documentation-updater.js"],
    status: "planned",
    attempts: 0,
    subtasks: {
      "RedMarkingCode": {
        title: "Modify documentation-updater.js to track failed attempts",
        description: "Update the JavaScript code to count attempts and mark tasks as failed after three tries.",
        relatedFiles: ["scripts/documentation-updater.js"],
        status: "planned",
        attempts: 0,
        codeSnippets: {
          "documentation-updater.js": "// Current tracking code that needs modification\nfunction updateTaskStatus(taskId, status) {\n  // TODO: Add attempt tracking\n  tasks[taskId].status = status;\n  updateDiagram();\n}"
        }
      }
    }
  },
  "DownloadTask": {
    title: "Implement Download Task Functionality",
    description: "Modify documentation-updater.js to generate a text file with task details and add a 'Download Task' button to visual-overview.html.",
    relatedFiles: ["scripts/documentation-updater.js", "visual-overview.html"],
    status: "planned",
    attempts: 0,
    subtasks: {
      "DownloadButton": {
        title: "Add Download Task button to visual-overview.html",
        description: "Create a button in the UI to download task details.",
        relatedFiles: ["visual-overview.html"],
        status: "planned",
        attempts: 0,
        codeSnippets: {
          "visual-overview.html": "<button class=\"btn btn-download\" id=\"download-task\">Download Task Details</button>"
        }
      },
      "DownloadLogic": {
        title: "Implement logic to generate task detail files",
        description: "Create JavaScript functions to generate and download task files.",
        relatedFiles: ["scripts/documentation-updater.js"],
        status: "planned",
        attempts: 0,
        codeSnippets: {
          "documentation-updater.js": "// Current download function that needs enhancement\nfunction downloadTaskDetails(taskId) {\n  // TODO: Include code snippets in download\n  const task = tasks[taskId];\n  // Rest of the function...\n}"
        }
      }
    }
  },
  // Other tasks would follow the same pattern...
};

// Initialize Mermaid with click events for all nodes
function initializeMermaid() {
  // Standard initialization
  mermaid.initialize({ startOnLoad: true });
  
  // After diagram is rendered, add click handlers to all nodes
  document.addEventListener('DOMContentLoaded', function() {
    // Allow some time for Mermaid to render
    setTimeout(() => {
      // Find all nodes in the diagram
      const nodes = document.querySelectorAll('.mermaid [id]');
      nodes.forEach(node => {
        node.style.cursor = 'pointer';
        node.addEventListener('click', function(event) {
          const nodeId = this.id;
          handleNodeClick(nodeId);
          event.stopPropagation();
        });
      });
    }, 1000);
  });
}

// Handle click on any node in the diagram
function handleNodeClick(nodeId) {
  // Find the task or subtask by ID
  let task, subtask, isSubtask = false;
  
  // Check if this is a main task
  if (tasks[nodeId]) {
    task = tasks[nodeId];
  } else {
    // Check if this is a subtask
    for (const taskId in tasks) {
      if (tasks[taskId].subtasks && tasks[taskId].subtasks[nodeId]) {
        task = tasks[taskId];
        subtask = tasks[taskId].subtasks[nodeId];
        isSubtask = true;
        break;
      }
    }
  }
  
  if (task) {
    showTaskDetails(nodeId, isSubtask ? subtask : task, isSubtask ? task.title : null);
  }
}

// Enhanced function to show task details
function showTaskDetails(nodeId, taskData, parentTitle) {
  const taskDetails = document.getElementById('task-details');
  
  // Set title (with parent info if this is a subtask)
  let titleText = taskData.title;
  if (parentTitle) {
    titleText = `${titleText} (part of ${parentTitle})`;
  }
  document.getElementById('selected-task-title').textContent = titleText;
  
  // Set description
  document.getElementById('selected-task-description').textContent = taskData.description;
  
  // Show related files
  const relatedFilesList = document.getElementById('related-files');
  relatedFilesList.innerHTML = '';
  taskData.relatedFiles.forEach(file => {
    const li = document.createElement('li');
    li.textContent = file;
    
    // Add a download link for each file if code snippets are available
    if (taskData.codeSnippets && taskData.codeSnippets[file]) {
      const downloadLink = document.createElement('a');
      downloadLink.textContent = ' (Download)';
      downloadLink.href = '#';
      downloadLink.className = 'file-download';
      downloadLink.addEventListener('click', function(e) {
        e.preventDefault();
        downloadCodeFile(file, taskData.codeSnippets[file]);
      });
      li.appendChild(downloadLink);
    }
    
    relatedFilesList.appendChild(li);
  });
  
  // Show status and attempts
  document.getElementById('task-status').textContent = taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1);
  document.getElementById('attempt-count').textContent = `Attempts: ${taskData.attempts}`;
  
  // Store the task ID and whether it's a subtask
  taskDetails.dataset.taskId = nodeId;
  taskDetails.dataset.isSubtask = parentTitle ? 'true' : 'false';
  taskDetails.dataset.parentTask = parentTitle ? Object.keys(tasks).find(key => tasks[key].title === parentTitle) : '';
  
  // Show the details panel
  taskDetails.style.display = 'block';
}

// Enhanced download button functionality
document.getElementById('download-task').addEventListener('click', function() {
  const taskDetails = document.getElementById('task-details');
  const nodeId = taskDetails.dataset.taskId;
  const isSubtask = taskDetails.dataset.isSubtask === 'true';
  const parentTaskId = taskDetails.dataset.parentTask;
  
  let taskData;
  if (isSubtask) {
    taskData = tasks[parentTaskId].subtasks[nodeId];
  } else {
    taskData = tasks[nodeId];
  }
  
  if (taskData) {
    downloadTaskDetails(nodeId, taskData, isSubtask ? tasks[parentTaskId].title : null);
  }
});

// Function to download task details as a text file
function downloadTaskDetails(nodeId, taskData, parentTitle) {
  let taskText = `Task: ${taskData.title}\n\n`;
  
  if (parentTitle) {
    taskText += `Parent Task: ${parentTitle}\n\n`;
  }
  
  taskText += `Description: ${taskData.description}\n\n`;
  taskText += `Status: ${taskData.status}\n`;
  taskText += `Attempts: ${taskData.attempts}\n\n`;
  
  taskText += `Related Files:\n`;
  taskData.relatedFiles.forEach(file => {
    taskText += `- ${file}\n`;
  });
  
  // Include code snippets if available
  if (taskData.codeSnippets) {
    taskText += `\nCode Snippets:\n`;
    for (const file in taskData.codeSnippets) {
      taskText += `\n--- ${file} ---\n\n`;
      taskText += taskData.codeSnippets[file];
      taskText += `\n\n`;
    }
  }
  
  // Create and trigger download
  const blob = new Blob([taskText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task-${nodeId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to download individual code files
function downloadCodeFile(filename, codeContent) {
  const blob = new Blob([codeContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.split('/').pop(); // Get just the filename
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize everything
initializeMermaid();

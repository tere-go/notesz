require('dotenv').config();
const express = require('express');
const supabase = require('./config/supabase');
const app = express();
const PORT = process.env.PORT || 3000;

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Webhook configuration
const WEBHOOK_URL = process.env.WEBHOOK_URL || null;

// Middleware for JSON parsing
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasWebhookUrl: !!process.env.WEBHOOK_URL
    }
  });
});

// Serve CSS file
app.get('/styles.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  res.sendFile(__dirname + '/styles.css');
});


// Redirect root to notes app
app.get('/', (req, res) => {
  res.redirect('/api/notes');
});

// Calendar page route
app.get('/calendar', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Calendar - Notes App</title>
        <link rel="stylesheet" href="/styles.css">
        <style>
          .calendar-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .calendar-header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .calendar-title {
            color: white;
            font-size: 2.5rem;
            margin: 0 0 10px 0;
            font-weight: 300;
          }
          
          .calendar-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            margin: 0;
          }
          
          .navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .nav-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
          }
          
          .nav-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          
          .current-month {
            color: white;
            font-size: 1.5rem;
            font-weight: 500;
          }
          
          .calendar-grid {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 30px;
          }
          
          .calendar-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .calendar-table th {
            color: white;
            font-weight: 600;
            padding: 15px;
            text-align: center;
            font-size: 1.1rem;
            border-bottom: 2px solid rgba(255, 255, 255, 0.2);
          }
          
          .calendar-table td {
            padding: 0;
            text-align: center;
            vertical-align: top;
            border: 1px solid rgba(255, 255, 255, 0.1);
            height: 80px;
            position: relative;
          }
          
          .day-cell {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 8px;
          }
          
          .day-cell:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(1.05);
          }
          
          .day-number {
            font-weight: 600;
            font-size: 1.1rem;
            margin-bottom: 5px;
          }
          
          .today {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            font-weight: bold;
          }
          
          .other-month {
            opacity: 0.3;
          }
          
          .event-dot {
            width: 6px;
            height: 6px;
            background: #4CAF50;
            border-radius: 50%;
            margin: 1px;
          }
          
          .events-container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2px;
            margin-top: 5px;
          }
          
          .quick-actions {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
          }
          
          .quick-actions h3 {
            color: white;
            margin: 0 0 20px 0;
            font-size: 1.3rem;
          }
          
          .action-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
            text-decoration: none;
            display: inline-block;
          }
          
          .action-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }
          
          .event-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          
          .event-modal-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          
          .modal-title {
            color: #333;
            font-size: 1.5rem;
            margin: 0;
          }
          
          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          .form-label {
            display: block;
            color: #333;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .form-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #667eea;
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
          
          .attendees-help {
            margin-top: 5px;
          }
          
          .attendees-help small {
            color: #666;
            font-style: italic;
          }
          
          @media (max-width: 768px) {
            .calendar-container {
              padding: 10px;
            }
            
            .calendar-header {
              padding: 20px;
            }
            
            .calendar-title {
              font-size: 2rem;
            }
            
            .navigation {
              flex-direction: column;
              gap: 15px;
            }
            
            .calendar-table td {
              height: 60px;
            }
            
            .day-cell {
              padding: 4px;
            }
            
            .day-number {
              font-size: 0.9rem;
            }
            
            .action-buttons {
              flex-direction: column;
              align-items: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="calendar-container">
          <div class="calendar-header">
            <h1 class="calendar-title">📅 Calendar</h1>
            <p class="calendar-subtitle">Organize your schedule and events</p>
          </div>
          
          <div class="navigation">
            <button class="nav-btn" onclick="previousMonth()">← Previous</button>
            <div class="current-month" id="currentMonth"></div>
            <button class="nav-btn" onclick="nextMonth()">Next →</button>
          </div>
          
          <div class="calendar-grid">
            <table class="calendar-table">
              <thead>
                <tr>
                  <th>Sunday</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                </tr>
              </thead>
              <tbody id="calendarBody">
                <!-- Calendar days will be generated here -->
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Event Modal -->
        <div class="event-modal" id="eventModal">
          <div class="event-modal-content">
            <div class="modal-header">
              <h2 class="modal-title">Add New Event</h2>
              <button class="close-btn" onclick="closeEventModal()">&times;</button>
            </div>
            <form id="eventForm" onsubmit="handleEventSubmit(event)">
              <div class="form-group">
                <label class="form-label" for="eventTitle">Event Title</label>
                <input type="text" id="eventTitle" class="form-input" placeholder="Enter event title..." required>
              </div>
              <div class="form-group">
                <label class="form-label" for="eventDate">Date</label>
                <input type="date" id="eventDate" class="form-input" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="eventTime">Time</label>
                <input type="time" id="eventTime" class="form-input">
              </div>
              <div class="form-group">
                <label class="form-label" for="eventDescription">Description</label>
                <textarea id="eventDescription" class="form-input" rows="3" placeholder="Event description..."></textarea>
              </div>
              <div class="form-group">
                <label class="form-label" for="eventAttendees">Attendees (Email Addresses)</label>
                <textarea id="eventAttendees" class="form-input" rows="2" placeholder="Enter email addresses separated by commas or new lines...&#10;example@email.com, another@email.com&#10;third@email.com"></textarea>
                <div class="attendees-help">
                  <small>💡 Tip: Separate multiple email addresses with commas or new lines</small>
                </div>
              </div>
              <button type="submit" class="btn-primary">💾 Save Event</button>
            </form>
          </div>
        </div>
        
        <script>
          let currentDate = new Date();
          let events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
          const WEBHOOK_URL = '${WEBHOOK_URL || ''}';
          
          function generateCalendar(year, month) {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - firstDay.getDay());
            
            const calendarBody = document.getElementById('calendarBody');
            calendarBody.innerHTML = '';
            
            const today = new Date();
            
            for (let week = 0; week < 6; week++) {
              const row = document.createElement('tr');
              
              for (let day = 0; day < 7; day++) {
                const cellDate = new Date(startDate);
                cellDate.setDate(startDate.getDate() + (week * 7) + day);
                
                const cell = document.createElement('td');
                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                
                if (cellDate.getMonth() !== month) {
                  dayCell.classList.add('other-month');
                }
                
                if (cellDate.toDateString() === today.toDateString()) {
                  dayCell.classList.add('today');
                }
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = cellDate.getDate();
                dayCell.appendChild(dayNumber);
                
                // Add events for this day
                const dayEvents = events.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.toDateString() === cellDate.toDateString();
                });
                
                if (dayEvents.length > 0) {
                  const eventsContainer = document.createElement('div');
                  eventsContainer.className = 'events-container';
                  
                  dayEvents.slice(0, 3).forEach(event => {
                    const eventDot = document.createElement('div');
                    eventDot.className = 'event-dot';
                    eventDot.title = event.title;
                    eventsContainer.appendChild(eventDot);
                  });
                  
                  if (dayEvents.length > 3) {
                    const moreDot = document.createElement('div');
                    moreDot.className = 'event-dot';
                    moreDot.style.background = '#ff9800';
                    moreDot.title = '+' + (dayEvents.length - 3) + ' more';
                    eventsContainer.appendChild(moreDot);
                  }
                  
                  dayCell.appendChild(eventsContainer);
                }
                
                dayCell.onclick = () => selectDate(cellDate);
                cell.appendChild(dayCell);
                row.appendChild(cell);
              }
              
              calendarBody.appendChild(row);
            }
            
            // Update month display
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            document.getElementById('currentMonth').textContent = 
              monthNames[month] + ' ' + year;
          }
          
          function previousMonth() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
          }
          
          function nextMonth() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
          }
          
          function goToToday() {
            currentDate = new Date();
            generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
          }
          
          function selectDate(date) {
            const dateStr = date.toISOString().split('T')[0];
            document.getElementById('eventDate').value = dateStr;
            showEventModal();
          }
          
          function showEventModal() {
            document.getElementById('eventModal').style.display = 'flex';
            document.getElementById('eventTitle').focus();
          }
          
          function closeEventModal() {
            document.getElementById('eventModal').style.display = 'none';
            document.getElementById('eventForm').reset();
          }
          
          async function handleEventSubmit(e) {
            e.preventDefault();
            
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const description = document.getElementById('eventDescription').value;
            const attendeesRaw = document.getElementById('eventAttendees').value;
            
            // Process attendees - split by commas or newlines and clean up
            const attendees = attendeesRaw
              .split(/[,\\\\n]/)
              .map(email => email.trim())
              .filter(email => email.length > 0);
            
            const eventData = {
              id: Date.now(),
              title,
              date,
              time,
              description,
              attendees,
              created: new Date().toISOString()
            };
            
            // Always save to localStorage first
            events.push(eventData);
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            
            // Try to send to webhook if configured
            if (WEBHOOK_URL && WEBHOOK_URL.trim() !== '') {
              try {
                const response = await fetch(WEBHOOK_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(eventData)
                });
                
                if (response.ok) {
                  closeEventModal();
                  generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
                  
                  let message = 'Event saved and sent to webhook successfully! 🎉';
                  if (attendees.length > 0) {
                    message += '\\\\n\\\\nAttendees (' + attendees.length + '): ' + attendees.join(', ');
                  }
                  alert(message);
                  return;
                } else {
                  throw new Error(\`Webhook request failed with status: \$\{response.status}\`);
                }
              } catch (error) {
                console.error('Error sending event to webhook:', error);
                
                closeEventModal();
                generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
                
                alert('Event saved locally, but failed to send to webhook: ' + error.message);
                return;
              }
            } else {
              // No webhook configured, just save locally
              closeEventModal();
              generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
              
              let message = 'Event saved locally! 💾';
              if (attendees.length > 0) {
                message += '\\\\n\\\\nAttendees (' + attendees.length + '): ' + attendees.join(', ');
              }
              message += '\\\\n\\\\nNote: No webhook URL configured. Set WEBHOOK_URL environment variable to enable webhook integration.';
              alert(message);
            }
          }
          
          function showUpcomingEvents() {
            const today = new Date();
            const upcoming = events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate >= today;
            }).sort((a, b) => new Date(a.date) - new Date(b.date));
            
            if (upcoming.length === 0) {
              alert('No upcoming events scheduled.');
              return;
            }
            
            let message = 'Upcoming Events:\\\\n\\\\n';
            upcoming.slice(0, 5).forEach(event => {
              const eventDate = new Date(event.date);
              const dateStr = eventDate.toLocaleDateString();
              message += '📅 ' + event.title + '\\\\n   ' + dateStr;
              if (event.time) message += ' at ' + event.time;
              if (event.attendees && event.attendees.length > 0) {
                message += '\\\\n   👥 Attendees (' + event.attendees.length + '): ' + event.attendees.join(', ');
              }
              message += '\\\\n\\\\n';
            });
            
            if (upcoming.length > 5) {
              message += '... and ' + (upcoming.length - 5) + ' more events';
            }
            
            alert(message);
          }
          
          // Close modal when clicking outside
          document.getElementById('eventModal').addEventListener('click', function(e) {
            if (e.target === this) {
              closeEventModal();
            }
          });
          
          // Close modal with Escape key
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
              closeEventModal();
            }
          });
          
          // Initialize calendar
          generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
        </script>
      </body>
    </html>
  `);
});

// API Routes for Notes
app.get('/api/notes', async (req, res) => {
  try {
    console.log('Fetching notes...');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? 'Set' : 'Not set');
    console.log('Supabase Key:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date_created', { ascending: false });
    
    if (error) throw error;
    
    const notes = data || [];
    
    // Return HTML interface with sidebar
    res.send(`
      <html>
        <head>
          <title>Notes Manager</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <div class="sidebar">
            <div class="sidebar-header">
              <h2>📝 My Notes</h2>
              <div class="search-container">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  class="search-input" 
                  id="searchInput"
                  placeholder="Search notes..."
                  autocomplete="off"
                >
                <button class="clear-search" id="clearSearch" onclick="clearSearch()">×</button>
              </div>
              <button class="add-note-btn" onclick="showAddNoteForm()">+ Add New Note</button>
              <a href="/calendar" class="calendar-btn">📅 Calendar</a>
              <div class="search-results" id="searchResults"></div>
            </div>
            <div id="notesContainer">
              ${notes.length === 0 ? 
                '<div class="empty-state">No notes yet. Create your first note!</div>' :
                notes.map((note, index) => `
                  <div class="note-item ${index === 0 ? 'active' : ''}" onclick="showNote('${note.note_id}')" data-note-id="${note.note_id}">
                    <div class="note-actions">
                      <button class="action-btn edit-btn" onclick="editNote('${note.note_id}', event)" title="Edit note">
                        ✏️
                      </button>
                      <button class="action-btn delete-btn" onclick="confirmDelete('${note.note_id}', '${escapeHtml(note.title)}', event)" title="Delete note">
                        🗑️
                      </button>
                    </div>
                    <div class="note-title">${escapeHtml(note.title)}</div>
                    <div class="note-date">${formatDate(note.date_created)}</div>
                    <div class="note-preview">${escapeHtml(note.content).substring(0, 80)}${note.content.length > 80 ? '...' : ''}</div>
                  </div>
                `).join('')
              }
            </div>
          </div>
          
          <div class="main-content">
            ${notes.length === 0 ? `
              <div class="welcome-message">
                <h1>Welcome to Your Notes App! 📝</h1>
                <p>Start by creating your first note using the sidebar.</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                  Total Notes: 0
                </p>
              </div>
            ` : `
              <div class="welcome-message">
                <h1>Select a Note</h1>
                <p>Choose a note from the sidebar to view its content.</p>
                <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
                  Total Notes: ${notes.length}
                </p>
              </div>
              ${notes.map(note => `
                <div class="note-content" id="note-${note.note_id}">
                  <h1>${escapeHtml(note.title)}</h1>
                  <div class="note-meta">
                    Created: ${formatDate(note.date_created)} | 
                    Last Updated: ${formatDate(note.last_update)}
                  </div>
                  ${note.actions ? `<div class="note-actions-section">
                    <h3>🎯 Actions</h3>
                    <div class="note-actions-content">${escapeHtml(note.actions)}</div>
                  </div>` : ''}
                  <div class="note-body">${escapeHtml(note.content)}</div>
                </div>
              `).join('')}
            `}
          </div>

          <!-- Delete Confirmation Modal -->
          <div class="modal-overlay" id="deleteModal">
            <div class="delete-modal">
              <div class="delete-icon">🗑️</div>
              <h2 class="delete-title">Delete Note</h2>
              <div class="delete-message">
                Are you sure you want to delete this note?
                <div class="note-name" id="deleteNoteName"></div>
                This action cannot be undone.
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeDeleteModal()">
                  Cancel
                </button>
                <button type="button" class="btn btn-danger" id="confirmDeleteBtn" onclick="executeDelete()">
                  🗑️ Delete Note
                </button>
              </div>
            </div>
          </div>

          <!-- Edit Note Modal -->
          <div class="modal-overlay" id="editNoteModal">
            <div class="modal">
              <div class="modal-header">
                <h2 class="modal-title">✏️ Edit Note</h2>
                <button class="close-btn" onclick="closeEditModal()">&times;</button>
              </div>
              
              <form id="editNoteForm" onsubmit="handleEditSubmit(event)">
                <div class="form-group">
                  <label class="form-label" for="editNoteTitle">Title *</label>
                  <input 
                    type="text" 
                    id="editNoteTitle" 
                    class="form-input" 
                    placeholder="Enter note title..."
                    required
                    maxlength="100"
                  >
                  <div class="char-counter">
                    <span id="editTitleCounter">0</span>/100 characters
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="editNoteContent">Content</label>
                  <textarea 
                    id="editNoteContent" 
                    class="form-input form-textarea" 
                    placeholder="Write your note content here..."
                    maxlength="5000"
                  ></textarea>
                  <div class="char-counter">
                    <span id="editContentCounter">0</span>/5000 characters
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="editNoteActions">Actions</label>
                  <button type="button" class="btn btn-ai" id="editGenerateActionsBtn" onclick="generateEditActionsWithAI()">
                    🤖 Generate Actions with AI
                  </button>
                  <textarea 
                    id="editNoteActions" 
                    class="form-input form-textarea-small" 
                    placeholder="Enter action items or next steps...&#10;• Action item 1&#10;• Action item 2&#10;• Action item 3"
                    maxlength="500"
                    rows="4"
                  ></textarea>
                  <div class="char-counter">
                    <span id="editActionsCounter">0</span>/500 characters
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="closeEditModal()">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" id="updateBtn">
                    💾 Update Note
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Add Note Modal -->
          <div class="modal-overlay" id="addNoteModal">
            <div class="modal">
              <div class="modal-header">
                <h2 class="modal-title">📝 Create New Note</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
              </div>
              
              <form id="noteForm" onsubmit="handleSubmit(event)">
                <div class="form-group">
                  <label class="form-label" for="noteTitle">Title *</label>
                  <input 
                    type="text" 
                    id="noteTitle" 
                    class="form-input" 
                    placeholder="Enter note title..."
                    required
                    maxlength="100"
                  >
                  <div class="char-counter">
                    <span id="titleCounter">0</span>/100 characters
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="noteContent">Content</label>
                  <textarea 
                    id="noteContent" 
                    class="form-input form-textarea" 
                    placeholder="Write your note content here..."
                    maxlength="5000"
                  ></textarea>
                  <div class="char-counter">
                    <span id="contentCounter">0</span>/5000 characters
                  </div>
                </div>
                
                <div class="form-group">
                  <label class="form-label" for="noteActions">Actions</label>
                  <button type="button" class="btn btn-ai" id="generateActionsBtn" onclick="generateActionsWithAI()">
                    🤖 Generate Actions with AI
                  </button>
                  <textarea 
                    id="noteActions" 
                    class="form-input form-textarea-small" 
                    placeholder="Enter action items or next steps...&#10;• Action item 1&#10;• Action item 2&#10;• Action item 3"
                    maxlength="500"
                    rows="4"
                  ></textarea>
                  <div class="char-counter">
                    <span id="actionsCounter">0</span>/500 characters
                  </div>
                </div>
                
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" id="saveBtn">
                    💾 Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>

          <script>
            function showNote(noteId) {
              // Hide all notes
              document.querySelectorAll('.note-content').forEach(el => el.style.display = 'none');
              document.querySelector('.welcome-message').style.display = 'none';
              
              // Show selected note
              document.getElementById('note-' + noteId).style.display = 'block';
              
              // Update active state
              document.querySelectorAll('.note-item').forEach(el => el.classList.remove('active'));
              event.currentTarget.classList.add('active');
            }

            function showAddNoteForm() {
              const modal = document.getElementById('addNoteModal');
              modal.style.display = 'flex';
              
              // Focus on title input
              setTimeout(() => {
                document.getElementById('noteTitle').focus();
              }, 100);
              
              // Reset form
              document.getElementById('noteForm').reset();
              updateCharCounters();
            }

            function closeModal() {
              const modal = document.getElementById('addNoteModal');
              modal.style.display = 'none';
              
              // Reset form
              document.getElementById('noteForm').reset();
              updateCharCounters();
            }

            function updateCharCounters() {
              const titleInput = document.getElementById('noteTitle');
              const contentInput = document.getElementById('noteContent');
              const actionsInput = document.getElementById('noteActions');
              const titleCounter = document.getElementById('titleCounter');
              const contentCounter = document.getElementById('contentCounter');
              const actionsCounter = document.getElementById('actionsCounter');
              
              titleCounter.textContent = titleInput.value.length;
              contentCounter.textContent = contentInput.value.length;
              actionsCounter.textContent = actionsInput.value.length;
            }

            async function handleSubmit(event) {
              event.preventDefault();
              
              const title = document.getElementById('noteTitle').value.trim();
              const content = document.getElementById('noteContent').value.trim();
              const actions = document.getElementById('noteActions').value.trim();
              
              if (!title) {
                alert('Please enter a title for your note.');
                return;
              }
              
              const saveBtn = document.getElementById('saveBtn');
              const originalText = saveBtn.innerHTML;
              
              // Show loading state
              saveBtn.innerHTML = '⏳ Saving...';
              saveBtn.disabled = true;
              
              try {
                const response = await fetch('/api/notes', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ title, content, actions })
                });
                
                if (response.ok) {
                  closeModal();
                  location.reload(); // Refresh to show new note
                } else {
                  const errorData = await response.json();
                  alert('Error creating note: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error creating note: ' + error.message);
              } finally {
                // Reset button state
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
              }
            }

            // Close modal when clicking outside
            document.getElementById('addNoteModal').addEventListener('click', function(event) {
              if (event.target === this) {
                closeModal();
              }
            });

            // Close modal with Escape key
            document.addEventListener('keydown', function(event) {
              if (event.key === 'Escape') {
                closeModal();
              }
            });

            // Character counters
            document.getElementById('noteTitle').addEventListener('input', updateCharCounters);
            document.getElementById('noteContent').addEventListener('input', updateCharCounters);
            document.getElementById('noteActions').addEventListener('input', updateCharCounters);

            // Initialize character counters
            document.addEventListener('DOMContentLoaded', updateCharCounters);

            // Helper functions for client-side
            function escapeHtml(text) {
              if (!text) return '';
              const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
              };
              return text.replace(/[&<>"']/g, function(m) { return map[m]; });
            }

            function formatDate(dateString) {
              const date = new Date(dateString);
              return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }

            // Search functionality
            const allNotes = ${JSON.stringify(notes)};
            let filteredNotes = allNotes;

            function performSearch() {
              const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
              const clearBtn = document.getElementById('clearSearch');
              const searchResults = document.getElementById('searchResults');
              
              // Show/hide clear button
              if (searchTerm) {
                clearBtn.style.display = 'flex';
              } else {
                clearBtn.style.display = 'none';
              }
              
              if (searchTerm === '') {
                // Show all notes
                filteredNotes = allNotes;
                searchResults.textContent = '';
              } else {
                // Filter notes by title and content
                filteredNotes = allNotes.filter(note => 
                  note.title.toLowerCase().includes(searchTerm) ||
                  (note.content && note.content.toLowerCase().includes(searchTerm)) ||
                  (note.actions && note.actions.toLowerCase().includes(searchTerm))
                );
                
                // Update search results text
                const resultCount = filteredNotes.length;
                if (resultCount === 0) {
                  searchResults.textContent = 'No notes found';
                } else if (resultCount === 1) {
                  searchResults.textContent = '1 note found';
                } else {
                  searchResults.textContent = \`\$\{resultCount} notes found\`;
                }
              }
              
              updateNotesDisplay();
            }

            function updateNotesDisplay() {
              const container = document.getElementById('notesContainer');
              
              if (filteredNotes.length === 0 && document.getElementById('searchInput').value.trim() === '') {
                container.innerHTML = '<div class="empty-state">No notes yet. Create your first note!</div>';
              } else if (filteredNotes.length === 0) {
                container.innerHTML = '<div class="empty-state">No notes match your search.</div>';
              } else {
                container.innerHTML = filteredNotes.map((note, index) => {
                  return \`
                    <div class="note-item \$\{index === 0 ? 'active' : ''}" onclick="showNote('\$\{note.note_id}')" data-note-id="\$\{note.note_id}">
                      <div class="note-actions">
                        <button class="action-btn edit-btn" onclick="editNote('\$\{note.note_id}', event)" title="Edit note">
                          ✏️
                        </button>
                        <button class="action-btn delete-btn" onclick="confirmDelete('\$\{note.note_id}', '\$\{escapeHtml(note.title)}', event)" title="Delete note">
                          🗑️
                        </button>
                      </div>
                      <div class="note-title">\$\{escapeHtml(note.title)}</div>
                      <div class="note-date">\$\{formatDate(note.date_created)}</div>
                      <div class="note-preview">\$\{escapeHtml(note.content || '').substring(0, 80)}\$\{(note.content || '').length > 80 ? '...' : ''}</div>
                    </div>
                  \`;
                }).join('');
              }
              
              // Auto-select first note if available
              if (filteredNotes.length > 0) {
                showNote(filteredNotes[0].note_id);
              } else {
                // Hide all note content and show welcome message
                document.querySelectorAll('.note-content').forEach(el => el.style.display = 'none');
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) welcomeMsg.style.display = 'block';
              }
            }

            function clearSearch() {
              document.getElementById('searchInput').value = '';
              performSearch();
              document.getElementById('searchInput').focus();
            }

            // Search input event listeners
            document.getElementById('searchInput').addEventListener('input', performSearch);
            document.getElementById('searchInput').addEventListener('keydown', function(event) {
              if (event.key === 'Escape') {
                clearSearch();
              }
            });

            // Delete functionality
            let noteToDelete = null;

            function confirmDelete(noteId, noteTitle, event) {
              event.stopPropagation(); // Prevent note selection
              
              noteToDelete = noteId;
              document.getElementById('deleteNoteName').textContent = noteTitle;
              document.getElementById('deleteModal').style.display = 'flex';
            }

            function closeDeleteModal() {
              document.getElementById('deleteModal').style.display = 'none';
              noteToDelete = null;
            }

            async function executeDelete() {
              if (!noteToDelete) return;
              
              const deleteBtn = document.getElementById('confirmDeleteBtn');
              const originalText = deleteBtn.innerHTML;
              
              // Show loading state
              deleteBtn.innerHTML = '⏳ Deleting...';
              deleteBtn.disabled = true;
              
              try {
                const response = await fetch(\`/api/notes/\$\{noteToDelete}\`, {
                  method: 'DELETE'
                });
                
                if (response.ok) {
                  closeDeleteModal();
                  location.reload(); // Refresh to update the list
                } else {
                  const errorData = await response.json();
                  alert('Error deleting note: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error deleting note: ' + error.message);
              } finally {
                // Reset button state
                deleteBtn.innerHTML = originalText;
                deleteBtn.disabled = false;
              }
            }

            // Edit functionality
            let noteToEdit = null;

            async function editNote(noteId, event) {
              event.stopPropagation(); // Prevent note selection
              
              try {
                // Fetch the note data
                const response = await fetch(\`/api/notes/json\`);
                const result = await response.json();
                
                if (result.success) {
                  const note = result.data.find(n => n.note_id === noteId);
                  if (note) {
                    noteToEdit = noteId;
                    
                    // Populate the edit form
                    document.getElementById('editNoteTitle').value = note.title;
                    document.getElementById('editNoteContent').value = note.content || '';
                    document.getElementById('editNoteActions').value = note.actions || '';
                    
                    // Update character counters
                    updateEditCharCounters();
                    
                    // Show the edit modal
                    document.getElementById('editNoteModal').style.display = 'flex';
                    
                    // Focus on title input
                    setTimeout(() => {
                      document.getElementById('editNoteTitle').focus();
                    }, 100);
                  } else {
                    alert('Note not found');
                  }
                } else {
                  alert('Error loading note: ' + result.error);
                }
              } catch (error) {
                alert('Error loading note: ' + error.message);
              }
            }

            function closeEditModal() {
              document.getElementById('editNoteModal').style.display = 'none';
              noteToEdit = null;
              
              // Reset form
              document.getElementById('editNoteForm').reset();
              updateEditCharCounters();
            }

            function updateEditCharCounters() {
              const titleInput = document.getElementById('editNoteTitle');
              const contentInput = document.getElementById('editNoteContent');
              const actionsInput = document.getElementById('editNoteActions');
              const titleCounter = document.getElementById('editTitleCounter');
              const contentCounter = document.getElementById('editContentCounter');
              const actionsCounter = document.getElementById('editActionsCounter');
              
              titleCounter.textContent = titleInput.value.length;
              contentCounter.textContent = contentInput.value.length;
              actionsCounter.textContent = actionsInput.value.length;
            }

            async function handleEditSubmit(event) {
              event.preventDefault();
              
              if (!noteToEdit) return;
              
              const title = document.getElementById('editNoteTitle').value.trim();
              const content = document.getElementById('editNoteContent').value.trim();
              const actions = document.getElementById('editNoteActions').value.trim();
              
              if (!title) {
                alert('Please enter a title for your note.');
                return;
              }
              
              const updateBtn = document.getElementById('updateBtn');
              const originalText = updateBtn.innerHTML;
              
              // Show loading state
              updateBtn.innerHTML = '⏳ Updating...';
              updateBtn.disabled = true;
              
              try {
                const response = await fetch(\`/api/notes/\$\{noteToEdit}\`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ title, content, actions })
                });
                
                if (response.ok) {
                  closeEditModal();
                  location.reload(); // Refresh to show updated note
                } else {
                  const errorData = await response.json();
                  alert('Error updating note: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error updating note: ' + error.message);
              } finally {
                // Reset button state
                updateBtn.innerHTML = originalText;
                updateBtn.disabled = false;
              }
            }

            // Close delete modal when clicking outside
            document.getElementById('deleteModal').addEventListener('click', function(event) {
              if (event.target === this) {
                closeDeleteModal();
              }
            });

            // Close edit modal when clicking outside
            document.getElementById('editNoteModal').addEventListener('click', function(event) {
              if (event.target === this) {
                closeEditModal();
              }
            });

            // Edit modal character counters
            document.getElementById('editNoteTitle').addEventListener('input', updateEditCharCounters);
            document.getElementById('editNoteContent').addEventListener('input', updateEditCharCounters);
            document.getElementById('editNoteActions').addEventListener('input', updateEditCharCounters);

            // AI Actions Generation
            async function generateActionsWithAI() {
              const content = document.getElementById('noteContent').value.trim();
              const title = document.getElementById('noteTitle').value.trim();
              
              if (!content && !title) {
                alert('Please enter some content or title first to generate actions.');
                return;
              }
              
              const generateBtn = document.getElementById('generateActionsBtn');
              const originalText = generateBtn.innerHTML;
              
              // Show loading state
              generateBtn.innerHTML = '🤖 Generating...';
              generateBtn.disabled = true;
              
              try {
                const response = await fetch('/api/generate-actions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ title, content })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    document.getElementById('noteActions').value = result.actions;
                    updateCharCounters();
                  } else {
                    alert('Error generating actions: ' + result.error);
                  }
                } else {
                  const errorData = await response.json();
                  alert('Error generating actions: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error generating actions: ' + error.message);
              } finally {
                // Reset button state
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
              }
            }

            async function generateEditActionsWithAI() {
              const content = document.getElementById('editNoteContent').value.trim();
              const title = document.getElementById('editNoteTitle').value.trim();
              
              if (!content && !title) {
                alert('Please enter some content or title first to generate actions.');
                return;
              }
              
              const generateBtn = document.getElementById('editGenerateActionsBtn');
              const originalText = generateBtn.innerHTML;
              
              // Show loading state
              generateBtn.innerHTML = '🤖 Generating...';
              generateBtn.disabled = true;
              
              try {
                const response = await fetch('/api/generate-actions', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ title, content })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.success) {
                    document.getElementById('editNoteActions').value = result.actions;
                    updateEditCharCounters();
                  } else {
                    alert('Error generating actions: ' + result.error);
                  }
                } else {
                  const errorData = await response.json();
                  alert('Error generating actions: ' + (errorData.error || 'Unknown error'));
                }
              } catch (error) {
                alert('Error generating actions: ' + error.message);
              } finally {
                // Reset button state
                generateBtn.innerHTML = originalText;
                generateBtn.disabled = false;
              }
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching notes:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.details || 'Unknown error'
    });
  }
});

// Add JSON API endpoint for programmatic access
app.get('/api/notes/json', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date_created', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper functions for HTML rendering
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, actions } = req.body;
    
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          title: title || 'Untitled Note',
          content: content || '',
          actions: actions || ''
        }
      ])
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT endpoint for updating notes
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, actions } = req.body;
    
    // Validate input
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const { data, error } = await supabase
      .from('notes')
      .update({
        title: title.trim(),
        content: content ? content.trim() : '',
        actions: actions ? actions.trim() : '',
        last_update: new Date().toISOString()
      })
      .eq('note_id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Note updated successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE endpoint for notes
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('note_id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Note deleted successfully',
      data: data[0]
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/notes/test', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('notes')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Database connection successful!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed. Please check your Supabase configuration.'
    });
  }
});

// AI Actions Generation endpoint
app.post('/api/generate-actions', async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.'
      });
    }
    
    if (!title && !content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either title or content to generate actions.'
      });
    }
    
    const prompt = `Based on the following note, generate a list of actionable items in the format "(numbering) Name : Task". Each action should be consice, specific and actionable.

Title: ${title || 'No title'}
Content: ${content || 'No content'}

Please format the response as:
• Name - Task
• Name - Task
etc.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates actionable items from notes. Always format responses as bullet points with "Name - Task" format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const generatedActions = data.choices[0]?.message?.content?.trim();

    if (!generatedActions) {
      throw new Error('No actions generated from OpenAI');
    }

    res.json({
      success: true,
      actions: generatedActions
    });

  } catch (error) {
    console.error('Error generating actions with AI:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate actions'
    });
  }
});

// Start server (for local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
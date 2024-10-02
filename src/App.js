import React, { useState, useEffect } from 'react';
import './App.css';
import Display from './assets/icons_FEtask/Display.svg';
import Down from './assets/icons_FEtask/down.svg';
import urgentIcon from './assets/icons_FEtask/SVG - Urgent Priority colour.svg';
import highIcon from './assets/icons_FEtask/Img - High Priority.svg';
import mediumIcon from './assets/icons_FEtask/Img - Medium Priority.svg';
import lowIcon from './assets/icons_FEtask/Img - Low Priority.svg';
import noPriorityIcon from './assets/icons_FEtask/No-priority.svg';
import backlogIcon from './assets/icons_FEtask/Backlog.svg';
import todoIcon from './assets/icons_FEtask/To-do.svg';
import inProgressIcon from './assets/icons_FEtask/in-progress.svg';
import doneIcon from './assets/icons_FEtask/Done.svg';
import cancelledIcon from './assets/icons_FEtask/Cancelled.svg';

const API_URL = 'https://api.quicksell.co/v1/internal/frontend-assignment';

// Function to get the correct priority icon based on priority value
const getPriorityIcon = (priority) => {
  switch (priority) {
    case 4:
      return urgentIcon;
    case 3:
      return highIcon;
    case 2:
      return mediumIcon;
    case 1:
      return lowIcon;
    default:
      return noPriorityIcon;
  }
};

// Function to get the correct status icon based on status
const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'backlog':
      return backlogIcon;
    case 'todo':
      return todoIcon;
    case 'inprogress':
      return inProgressIcon;
    case 'done':
      return doneIcon;
    case 'cancelled':
      return cancelledIcon;
    default:
      return noPriorityIcon;
  }
};

function Navbar({ onGroupingChange, onOrderingChange }) {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [grouping, setGrouping] = useState('Status');
  const [ordering, setOrdering] = useState('Priority');

  const toggleCard = () => {
    setIsCardVisible(!isCardVisible);
  };

  const handleGroupingChange = (event) => {
    setGrouping(event.target.value);
    onGroupingChange(event.target.value);
  };

  const handleOrderingChange = (event) => {
    setOrdering(event.target.value);
    onOrderingChange(event.target.value);
  };

  return (
    <nav className="navbar">
      <div className="display-button" onClick={toggleCard}>
        <div className="menu-icon">
          <img
            src={Display}
            alt="Menu"
            className="icon"
          />
          Display 
          <img src={Down} alt="" />
        </div>
      </div>
      {isCardVisible && (
        <div className="dropdown-card">
          <div className="card-section">
            <label>Grouping:</label>
            <select value={grouping} onChange={handleGroupingChange}>
              <option value="Status">Status</option>
              <option value="User">User</option>
            </select>
          </div>
          <div className="card-section">
            <label>Ordering:</label>
            <select value={ordering} onChange={handleOrderingChange}>
              <option value="Priority">Priority</option>
            </select>
          </div>
        </div>
      )}
    </nav>
  );
}

function KanbanBoard({ tickets, grouping, ordering, users }) {
  const [groupedTickets, setGroupedTickets] = useState({});

  useEffect(() => {
    const groupTickets = () => {
      if (grouping === 'Status') {
        setGroupedTickets(groupByStatus(tickets));
      } else if (grouping === 'User') {
        setGroupedTickets(groupByUser(tickets, users));
      } else {
        setGroupedTickets(groupByPriority(tickets));
      }
    };
    groupTickets();
  }, [tickets, grouping, ordering, users]);

  const groupByStatus = (tickets) => {
    const grouped = {
      backlog: [],
      todo: [],
      inprogress: [],
      done: [],
      cancelled: [],
    };

    tickets.forEach((ticket) => {
      const status = ticket.status.toLowerCase().replace(' ', '');
      if (grouped[status]) {
        grouped[status].push(ticket);
      }
    });

    return grouped;
  };

  const groupByUser = (tickets, users) => {
    const grouped = {};

    users.forEach((user) => {
      grouped[user.name] = tickets.filter((ticket) => ticket.userId === user.id);
    });

    return grouped;
  };

  const groupByPriority = (tickets) => {
    const grouped = {
      Urgent: [],
      High: [],
      Medium: [],
      Low: [],
      'No Priority': [],
    };

    tickets.forEach((ticket) => {
      const priorityMapping = {
        4: 'Urgent',
        3: 'High',
        2: 'Medium',
        1: 'Low',
        0: 'No Priority',
      };
      const priority = priorityMapping[ticket.priority];
      grouped[priority].push(ticket);
    });

    return grouped;
  };

  return (
    <div className="kanban-board">
      {Object.keys(groupedTickets).map((group) => (
        <div key={group} className="kanban-column">
          <div className="kanban-column-header">
            <img src={getStatusIcon(group)} alt="Status" className="status-icon" />
            <span>{group}</span>
          </div>
          {groupedTickets[group].map((ticket) => (
            <div key={ticket.id} className="kanban-card">
              <p>{ticket.id}</p>
              <h3>{ticket.title}</h3>
              <span className="kanban-card-footer">
                <img style={{ marginRight: '10px' }} src={getPriorityIcon(ticket.priority)} alt="Priority" className="priority-icon" />
                <span>{ticket.tag.join(', ')}</span>
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('Status');
  const [ordering, setOrdering] = useState('Priority');

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="app">
      <Navbar
        onGroupingChange={(group) => setGrouping(group)}
        onOrderingChange={(order) => setOrdering(order)}
      />
      <KanbanBoard tickets={tickets} grouping={grouping} ordering={ordering} users={users} />
    </div>
  );
}

export default App;

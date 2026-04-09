import React from 'react'
import {
  type EventApi,
  type DateSelectArg,
  type EventClickArg,
  type EventContentArg,
  type EventMountArg,
  formatDate,
} from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import './Calendar.css'
import { Box, Snackbar, Alert } from '@mui/material';
import AddEventPopup from '../components/EventPopUp';
import { eventApi, type CalendarEvent } from '../services/api';
import { getCurrentUserId } from '../utils/auth';

interface DemoAppState {
  weekendsVisible: boolean
  currentEvents: EventApi[]
  isPopupOpen: boolean
  popupMode: 'create' | 'edit'
  selectedEventData: any
  contextMenu: {
    x: number
    y: number
    event: EventApi
  } | null
  snackbar: {
    open: boolean
    message: string
    severity: 'success' | 'error' | 'info'
  }
  isLoading: boolean
}

type FormDataType = {
  name: string;
  isTask: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  dueDate: string;
  repetition: string;
  location: string;
  color: string;
  priority: string;
  notes: string;
};

export default class Calendar extends React.Component<{}, DemoAppState> {
  calendarRef = React.createRef<FullCalendar>()

  state: DemoAppState = {
    weekendsVisible: true,
    currentEvents: [],
    isPopupOpen: false,
    popupMode: 'create',
    selectedEventData: null,
    contextMenu: null,
    snackbar: {
      open: false,
      message: '',
      severity: 'info'
    },
    isLoading: false
  }

  componentDidMount() {
    document.addEventListener('click', this.handleCloseContextMenu);
    this.loadEventsFromDatabase();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleCloseContextMenu);
  }

  loadEventsFromDatabase = async () => {
    this.setState({ isLoading: true });
    try {
      const events = await eventApi.getByUser(getCurrentUserId());
      const calendarApi = this.calendarRef.current?.getApi();
      
      if (calendarApi) {
        // Clear existing events
        calendarApi.removeAllEvents();
        
        // Add events from database
        events.forEach((event: CalendarEvent) => {
          if (event.task) {
            // Task - all day event on due date
            calendarApi.addEvent({
              id: String(event.eventId),
              title: `✓ ${event.title}`,
              start: event.dueDate,
              allDay: true,
              extendedProps: {
                dbEventId: event.eventId,
                isTask: true,
                location: event.location,
                priority: event.priority,
                notes: event.description,
                color: event.color || '#8b5cf6',
              },
              backgroundColor: event.color || '#8b5cf6',
              borderColor: event.color || '#8b5cf6'
            });
          } else {
            // Event - with time range
            calendarApi.addEvent({
              id: String(event.eventId),
              title: event.title,
              start: event.startTime,
              end: event.endTime,
              allDay: !event.startTime?.includes('T') || event.startTime?.endsWith('T00:00:00'),
              extendedProps: {
                dbEventId: event.eventId,
                isTask: false,
                location: event.location,
                priority: event.priority,
                notes: event.description,
                repetition: event.repeating ? 'weekly' : 'none',
                color: event.color || '#3b82f6',
              },
              backgroundColor: event.color || '#3b82f6',
              borderColor: event.color || '#3b82f6'
            });
          }
        });
        
        this.showSnackbar('Events loaded successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      this.showSnackbar('Failed to load events from server', 'error');
    } finally {
      this.setState({ isLoading: false });
    }
  }

  showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    this.setState({
      snackbar: { open: true, message, severity }
    });
  }

  handleCloseSnackbar = () => {
    this.setState(prev => ({
      snackbar: { ...prev.snackbar, open: false }
    }));
  }

  handleEventDidMount = (info: EventMountArg) => {
    // Ensure color persists from extendedProps
    const color = info.event.extendedProps.color;
    if (color && (!info.event.backgroundColor || info.event.backgroundColor !== color)) {
      info.event.setProp('backgroundColor', color);
      info.event.setProp('borderColor', color);
    }
    
    info.el.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.setState({
        contextMenu: {
          x: e.clientX,
          y: e.clientY,
          event: info.event
        }
      });
    });
  }

  handleCloseContextMenu = () => {
    if (this.state.contextMenu) {
      this.setState({ contextMenu: null });
    }
  }

  handleEditFromContextMenu = () => {
    const event = this.state.contextMenu?.event;
    if (event) {
      const isTask = event.extendedProps.isTask;
      
      if (isTask) {
        const dueDate = event.start ? new Date(event.start).toISOString().split('T')[0] : '';
        this.setState({
          isPopupOpen: true,
          popupMode: 'edit',
            selectedEventData: {
            eventApi: event,
            initialData: {
              name: event.title.replace('✓ ', ''),
              isTask: true,
              dueDate: dueDate,
              startDate: '',
              startTime: '',
              endDate: '',
              endTime: '',
              repetition: '',
              location: event.extendedProps.location || '',
              color: event.extendedProps.color || event.backgroundColor || '',
              priority: event.extendedProps.priority || '',
              notes: event.extendedProps.notes || '',
            }
          },
          contextMenu: null
        });
      } else {
        const startDate = new Date(event.start!);
        const endDate = event.end ? new Date(event.end) : startDate;
        
        this.setState({
          isPopupOpen: true,
          popupMode: 'edit',
            selectedEventData: {
            eventApi: event,
            initialData: {
              name: event.title,
              isTask: false,
              dueDate: '',
              startDate: startDate.toISOString().split('T')[0],
              startTime: event.allDay ? '' : startDate.toTimeString().slice(0, 5),
              endDate: endDate.toISOString().split('T')[0],
              endTime: event.allDay ? '' : endDate.toTimeString().slice(0, 5),
              repetition: event.extendedProps.repetition || '',
              location: event.extendedProps.location || '',
              color: event.extendedProps.color || event.backgroundColor || '',
              priority: event.extendedProps.priority || '',
              notes: event.extendedProps.notes || '',
            }
          },
          contextMenu: null
        });
      }
    }
  }

  handleDeleteFromContextMenu = async () => {
    const event = this.state.contextMenu?.event;
    if (event && confirm(`Are you sure you want to delete '${event.title}'?`)) {
      try {
        const dbEventId = event.extendedProps.dbEventId;
        if (dbEventId) {
          await eventApi.delete(dbEventId);
        }
        event.remove();
        this.showSnackbar('Deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete:', error);
        this.showSnackbar('Failed to delete', 'error');
      }
      this.setState({ contextMenu: null });
    }
  }

  render() {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: '#f3f4f6',
        }}
      >
        <div className='demo-app'>
          {this.renderSidebar()}
          <div className='demo-app-main'>
            <FullCalendar
              ref={this.calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              initialView='dayGridMonth'
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={this.state.weekendsVisible}
              select={this.handleDateSelect}
              eventContent={renderEventContent}
              eventClick={this.handleEventClick}
              eventsSet={this.handleEvents}
              eventDidMount={this.handleEventDidMount}
              eventDrop={this.handleEventDrop}
              eventResize={this.handleEventResize}
            />
          </div>
        </div>

        {/* Context Menu */}
        {this.state.contextMenu && (
          <div
            style={{
              position: 'fixed',
              left: `${this.state.contextMenu.x}px`,
              top: `${this.state.contextMenu.y}px`,
              zIndex: 9999,
              transform: this.state.contextMenu.x > window.innerWidth - 200 ? 'translateX(-100%)' : 'none'
            }}
            className="bg-[#1e293b] border border-[#475569] rounded-lg shadow-xl py-1 min-w-[160px]"
          >
            <button
              onClick={this.handleEditFromContextMenu}
              className="w-full px-4 py-2 text-left hover:bg-[#334155] text-sm text-white flex items-center gap-2"
            >
              <span>✏️</span>
              <span>Edit</span>
            </button>
            <button
              onClick={this.handleDeleteFromContextMenu}
              className="w-full px-4 py-2 text-left hover:bg-[#7f1d1d] text-[#ef4444] text-sm flex items-center gap-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Add Event Popup */}
        <AddEventPopup
          isOpen={this.state.isPopupOpen}
          onClose={() => this.setState({ isPopupOpen: false, selectedEventData: null })}
          onSubmit={this.handlePopupSubmit}
          mode={this.state.popupMode}
          initialData={this.state.selectedEventData?.initialData}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={this.state.snackbar.open}
          autoHideDuration={4000}
          onClose={this.handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={this.handleCloseSnackbar} 
            severity={this.state.snackbar.severity}
            sx={{ width: '100%' }}
          >
            {this.state.snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  renderSidebar() {
    return (
      <div className='demo-app-sidebar'>
        <div className='demo-app-sidebar-section'>
          <h2>Instructions</h2>
          <ul>
            <li>Select dates to create an event or task</li>
            <li>Choose "Event" for scheduled times, "Task" for due dates</li>
            <li>Drag, drop, and resize events</li>
            <li>Right-click to edit or delete</li>
            <li>Tasks are shown with ✓ prefix</li>
          </ul>
        </div>
        <div className='demo-app-sidebar-section'>
          <label>
            <input
              type='checkbox'
              checked={this.state.weekendsVisible}
              onChange={this.handleWeekendsToggle}
            ></input>
            toggle weekends
          </label>
        </div>
        <div className='demo-app-sidebar-section'>
          <h2>All Items ({this.state.currentEvents.length})</h2>
          <ul>
            {this.state.currentEvents.map(renderSidebarEvent)}
          </ul>
        </div>
      </div>
    )
  }

  handleWeekendsToggle = () => {
    this.setState({
      weekendsVisible: !this.state.weekendsVisible
    })
  }

  handleDateSelect = (selectInfo: DateSelectArg) => {
    const startDate = new Date(selectInfo.start);
    const endDate = new Date(selectInfo.end);
    
    this.setState({
      isPopupOpen: true,
      popupMode: 'create',
      selectedEventData: {
        selectInfo,
        initialData: {
          name: '',
          isTask: false,
          dueDate: startDate.toISOString().split('T')[0],
          startDate: startDate.toISOString().split('T')[0],
          startTime: selectInfo.allDay ? '' : startDate.toTimeString().slice(0, 5),
          endDate: endDate.toISOString().split('T')[0],
          endTime: selectInfo.allDay ? '' : endDate.toTimeString().slice(0, 5),
          repetition: '',
          location: '',
          color: '',
          priority: '',
          notes: '',
        }
      }
    });
  }

  handleEventClick = async (clickInfo: EventClickArg) => {
    if (confirm(`Are you sure you want to delete '${clickInfo.event.title}'`)) {
      try {
        const dbEventId = clickInfo.event.extendedProps.dbEventId;
        if (dbEventId) {
          await eventApi.delete(dbEventId);
        }
        clickInfo.event.remove();
        this.showSnackbar('Deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete:', error);
        this.showSnackbar('Failed to delete', 'error');
      }
    }
  }

  handleEventDrop = async (info: any) => {
    await this.updateEventInDatabase(info.event);
  }

  handleEventResize = async (info: any) => {
    await this.updateEventInDatabase(info.event);
  }

  updateEventInDatabase = async (event: EventApi) => {
    const dbEventId = event.extendedProps.dbEventId;
    if (!dbEventId) return;

    const isTask = event.extendedProps.isTask;

    try {
      if (isTask) {
        await eventApi.update(dbEventId, {
          userId: getCurrentUserId(),
          title: event.title.replace('✓ ', ''),
          description: event.extendedProps.notes,
          task: true,
          dueDate: event.start?.toISOString().split('T')[0],
          priority: event.extendedProps.priority,
          color: event.extendedProps.color || event.backgroundColor
        });
      } else {
        await eventApi.update(dbEventId, {
          userId: getCurrentUserId(),
          title: event.title,
          description: event.extendedProps.notes,
          task: false,
          startTime: event.start?.toISOString() || '',
          endTime: event.end?.toISOString() || event.start?.toISOString() || '',
          location: event.extendedProps.location,
          repeating: event.extendedProps.repetition === 'weekly',
          priority: event.extendedProps.priority,
          color: event.extendedProps.color || event.backgroundColor
        });
      }
      this.showSnackbar('Updated', 'success');
    } catch (error) {
      console.error('Failed to update:', error);
      this.showSnackbar('Failed to update', 'error');
    }
  }

  handlePopupSubmit = async (data: FormDataType) => {
    const { selectedEventData, popupMode } = this.state;

    if (popupMode === 'create' && selectedEventData?.selectInfo) {
      const calendarApi = selectedEventData.selectInfo.view.calendar;
      calendarApi.unselect();

      if (data.name) {
        try {
          if (data.isTask) {
            // Create a task (returns array for repetition support)
            const savedEvents = await eventApi.create({
              userId: getCurrentUserId(),
              title: data.name,
              description: data.notes,
              task: true,
              dueDate: data.dueDate,
              priority: data.priority as 'low' | 'medium' | 'high',
              color: data.color || '#8b5cf6',
              repetitionType: data.repetition as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
              repetitionCount: data.repetition && data.repetition !== 'none' ? 10 : 1
            });

            // Add all created events to calendar
            savedEvents.forEach((savedEvent) => {
              calendarApi.addEvent({
                id: String(savedEvent.eventId),
                title: `✓ ${savedEvent.title}`,
                start: savedEvent.dueDate,
                allDay: true,
                extendedProps: {
                  dbEventId: savedEvent.eventId,
                  isTask: true,
                  priority: data.priority,
                  notes: data.notes,
                  color: data.color || '#8b5cf6',
                },
                backgroundColor: data.color || '#8b5cf6',
                borderColor: data.color || '#8b5cf6'
              });
            });
          } else {
            // Create an event (returns array for repetition support)
            const startDateTime = `${data.startDate}${data.startTime ? 'T' + data.startTime + ':00' : 'T00:00:00'}`;
            const endDateTime = `${data.endDate}${data.endTime ? 'T' + data.endTime + ':00' : 'T23:59:59'}`;

            const savedEvents = await eventApi.create({
              userId: getCurrentUserId(),
              title: data.name,
              description: data.notes,
              task: false,
              startTime: startDateTime,
              endTime: endDateTime,
              location: data.location,
              priority: data.priority as 'low' | 'medium' | 'high',
              color: data.color || '#3b82f6',
              repetitionType: data.repetition as 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly',
              repetitionCount: data.repetition && data.repetition !== 'none' ? 10 : 1
            });

            // Add all created events to calendar
            savedEvents.forEach((savedEvent) => {
              calendarApi.addEvent({
                id: String(savedEvent.eventId),
                title: savedEvent.title,
                start: savedEvent.startTime,
                end: savedEvent.endTime,
                allDay: !data.startTime,
                extendedProps: {
                  dbEventId: savedEvent.eventId,
                  isTask: false,
                  location: data.location,
                  priority: data.priority,
                  notes: data.notes,
                  repetition: data.repetition,
                  color: data.color || '#3b82f6',
                },
                backgroundColor: data.color || '#3b82f6',
                borderColor: data.color || '#3b82f6'
              });
            });
          }

          const count = data.repetition && data.repetition !== 'none' ? ' (with repetitions)' : '';
          this.showSnackbar(`${data.isTask ? 'Task' : 'Event'} created successfully${count}`, 'success');
        } catch (error) {
          console.error('Failed to create:', error);
          this.showSnackbar('Failed to save', 'error');
        }
      }
    } else if (popupMode === 'edit' && selectedEventData?.eventApi) {
      const event = selectedEventData.eventApi;
      const dbEventId = event.extendedProps.dbEventId;

      try {
        if (data.isTask) {
          if (dbEventId) {
            await eventApi.update(dbEventId, {
              userId: getCurrentUserId(),
              title: data.name,
              description: data.notes,
              task: true,
              dueDate: data.dueDate,
              priority: data.priority as 'low' | 'medium' | 'high',
              color: data.color || '#8b5cf6'
            });
          }

          event.setProp('title', `✓ ${data.name}`);
          event.setStart(data.dueDate);
          event.setEnd(null);
          event.setAllDay(true);
          event.setExtendedProp('isTask', true);
          event.setExtendedProp('priority', data.priority);
          event.setExtendedProp('notes', data.notes);
          const taskColor = data.color || '#8b5cf6';
          event.setExtendedProp('color', taskColor);
          event.setProp('backgroundColor', taskColor);
          event.setProp('borderColor', taskColor);
        } else {
          const startDateTime = `${data.startDate}${data.startTime ? 'T' + data.startTime + ':00' : 'T00:00:00'}`;
          const endDateTime = `${data.endDate}${data.endTime ? 'T' + data.endTime + ':00' : 'T23:59:59'}`;

          if (dbEventId) {
            await eventApi.update(dbEventId, {
              userId: getCurrentUserId(),
              title: data.name,
              description: data.notes,
              task: false,
              startTime: startDateTime,
              endTime: endDateTime,
              location: data.location,
              repeating: data.repetition === 'weekly',
              priority: data.priority as 'low' | 'medium' | 'high',
              color: data.color || '#3b82f6'
            });
          }

          event.setProp('title', data.name);
          event.setStart(startDateTime);
          event.setEnd(endDateTime);
          event.setAllDay(!data.startTime);
          event.setExtendedProp('isTask', false);
          event.setExtendedProp('location', data.location);
          event.setExtendedProp('priority', data.priority);
          event.setExtendedProp('notes', data.notes);
          event.setExtendedProp('repetition', data.repetition);
          const eventColor = data.color || '#3b82f6';
          event.setExtendedProp('color', eventColor);
          event.setProp('backgroundColor', eventColor);
          event.setProp('borderColor', eventColor);
        }

        this.showSnackbar('Updated successfully', 'success');
      } catch (error) {
        console.error('Failed to update:', error);
        this.showSnackbar('Failed to update', 'error');
      }
    }

    this.setState({ 
      isPopupOpen: false, 
      selectedEventData: null 
    });
  }

  handleEvents = (events: EventApi[]) => {
    this.setState({
      currentEvents: events
    });
  }
}

function renderEventContent(eventContent: EventContentArg) {
  const isTask = eventContent.event.extendedProps.isTask;
  return (
    <>
      <b>{eventContent.timeText}</b>
      <i style={{ 
        fontStyle: isTask ? 'normal' : 'italic',
        fontWeight: isTask ? 500 : 'normal'
      }}>{eventContent.event.title}</i>
    </>
  )
}

function renderSidebarEvent(event: EventApi) {
  return (
    <li key={event.id}>
      <b>{formatDate(event.start!, { year: 'numeric', month: 'short', day: 'numeric' })}</b>
      <i>{event.title}</i>
    </li>
  )
}

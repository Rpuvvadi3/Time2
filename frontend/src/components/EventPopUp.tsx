import React, { useState, useEffect } from "react";

type FormDataType = {
  name: string;
  isTask: boolean;    // true = task (no time), false = event (with time)
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  dueDate: string;    // for tasks only
  repetition: string;
  location: string;
  color: string;
  priority: string;
  notes: string;
};

type AddEventPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormDataType) => void;
  initialData?: Partial<FormDataType>;
  mode?: 'create' | 'edit';
};

const AddEventPopup: React.FC<AddEventPopupProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    isTask: false,
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    dueDate: "",
    repetition: "",
    location: "",
    color: "",
    priority: "",
    notes: "",
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } else if (!isOpen) {
      setFormData({
        name: "",
        isTask: false,
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        dueDate: "",
        repetition: "",
        location: "",
        color: "",
        priority: "",
        notes: "",
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      // Removed onClick to prevent closing when clicking outside
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          border: '1px solid #334155'
        }}
      >
        {/* Close button - ONLY way to close */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: 'white',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{
          backgroundColor: formData.isTask ? '#8b5cf6' : '#2563EB',
          color: 'white',
          padding: '20px 24px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            margin: 0 
          }}>
            {mode === 'edit' 
              ? (formData.isTask ? 'Edit Task' : 'Edit Event')
              : (formData.isTask ? 'Add New Task' : 'Add New Event')
            }
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Task/Event Toggle */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '20px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isTask: false }))}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: !formData.isTask ? '#2563EB' : 'transparent',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              📅 Event
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isTask: true }))}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: formData.isTask ? '#8b5cf6' : 'transparent',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >
              ✓ Task
            </button>
          </div>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.isTask ? "Task name" : "Event name"}
              required
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: '#0f172a',
                color: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = formData.isTask ? '#8b5cf6' : '#2563EB'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
            />
          </div>

          {/* Task: Due Date Only */}
          {formData.isTask ? (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'white',
                marginBottom: '4px'
              }}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  colorScheme: 'dark'
                }}
              />
            </div>
          ) : (
            <>
              {/* Event: Start Date and Time */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: 'white',
                    marginBottom: '4px'
                  }}>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: 'white',
                    marginBottom: '4px'
                  }}>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>

              {/* Event: End Date and Time */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: 'white',
                    marginBottom: '4px'
                  }}>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '500', 
                    color: 'white',
                    marginBottom: '4px'
                  }}>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      backgroundColor: '#0f172a',
                      color: 'white',
                      colorScheme: 'dark'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Repetition - available for both tasks and events */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: formData.isTask ? '1fr' : '1fr 1fr', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'white',
                marginBottom: '4px'
              }}>Repetition</label>
              <select
                name="repetition"
                value={formData.repetition}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select...</option>
                <option value="none">None (Single occurrence)</option>
                <option value="daily">Daily (10 occurrences)</option>
                <option value="weekly">Weekly (10 occurrences)</option>
                <option value="monthly">Monthly (10 occurrences)</option>
                <option value="yearly">Yearly (10 occurrences)</option>
              </select>
              {formData.repetition && formData.repetition !== 'none' && (
                <p style={{ 
                  fontSize: '11px', 
                  color: '#94a3b8', 
                  marginTop: '4px',
                  marginBottom: 0 
                }}>
                  This will create 10 {formData.isTask ? 'tasks' : 'events'} with {formData.repetition} intervals
                </p>
              )}
            </div>
            {/* Location (Events only) */}
            {!formData.isTask && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '500', 
                  color: 'white',
                  marginBottom: '4px'
                }}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#0f172a',
                    color: 'white'
                  }}
                />
              </div>
            )}
          </div>

          {/* Color and Priority */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'white',
                marginBottom: '4px'
              }}>Color</label>
              <select
                name="color"
                value={formData.color}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select...</option>
                <option value="#3b82f6">Blue</option>
                <option value="#10b981">Green</option>
                <option value="#ef4444">Red</option>
                <option value="#f59e0b">Orange</option>
                <option value="#8b5cf6">Purple</option>
                <option value="#ec4899">Pink</option>
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '12px', 
                fontWeight: '500', 
                color: 'white',
                marginBottom: '4px'
              }}>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">Select...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              fontWeight: '500', 
              color: 'white',
              marginBottom: '4px'
            }}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                backgroundColor: '#0f172a',
                color: 'white'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              backgroundColor: formData.isTask ? '#8b5cf6' : '#2563EB',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = formData.isTask ? '#7c3aed' : '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.isTask ? '#8b5cf6' : '#2563EB'}
          >
            {mode === 'edit' 
              ? (formData.isTask ? 'Update Task' : 'Update Event')
              : (formData.isTask ? 'Create Task' : 'Create Event')
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEventPopup;

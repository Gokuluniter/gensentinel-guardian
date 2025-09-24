import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { toast } from '@/hooks/use-toast';

const Calendar = () => {
  const { profile } = useAuth();
  const { logActivity } = useActivityLogger();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock events for demonstration
  const events = [
    {
      id: '1',
      title: 'Security Review Meeting',
      description: 'Monthly security assessment and threat analysis',
      date: '2024-01-16',
      time: '09:00',
      duration: '2 hours',
      type: 'meeting',
      attendees: ['John Smith', 'Sarah Johnson', 'Mike Wilson'],
      location: 'Conference Room A'
    },
    {
      id: '2',
      title: 'Project Deadline',
      description: 'GenSentinel Phase 2 implementation deadline',
      date: '2024-01-18',
      time: '17:00',
      duration: 'All day',
      type: 'deadline',
      attendees: ['IT Department'],
      location: 'Remote'
    },
    {
      id: '3',
      title: 'Training Session',
      description: 'Cybersecurity awareness training for all staff',
      date: '2024-01-20',
      time: '14:00',
      duration: '3 hours',
      type: 'training',
      attendees: ['All Staff'],
      location: 'Main Auditorium'
    },
    {
      id: '4',
      title: 'Department Meeting',
      description: 'Weekly department sync and updates',
      date: '2024-01-17',
      time: '10:30',
      duration: '1 hour',
      type: 'meeting',
      attendees: ['Department Team'],
      location: 'Conference Room B'
    }
  ];

  const handleCreateEvent = async () => {
    await logActivity('system_config', 'Created new calendar event', 'event');
    toast({
      title: "Create Event",
      description: "Event creation form would be implemented here",
    });
  };

  const handleViewEvent = async (event: any) => {
    await logActivity('document_view', `Viewed event: ${event.title}`, 'event', event.id);
    toast({
      title: "Event Details",
      description: `Viewing details for ${event.title}`,
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'deadline': return 'bg-red-100 text-red-800';
      case 'training': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTodayEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => event.date === today);
  };

  const getUpcomingEvents = () => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => event.date > today).slice(0, 5);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <Button onClick={handleCreateEvent} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simplified calendar grid for demonstration */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center p-2 font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <div
                  key={day}
                  className={`text-center p-3 border rounded cursor-pointer hover:bg-accent transition-colors ${
                    day === new Date().getDate() ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {day}
                  {events.some(e => new Date(e.date).getDate() === day) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTodayEvents().length > 0 ? (
                getTodayEvents().map(event => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.time} ({event.duration})
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No events scheduled for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getUpcomingEvents().map(event => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewEvent(event)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={getEventTypeColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time} ({event.duration})
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {Array.isArray(event.attendees) ? event.attendees.join(', ') : event.attendees}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {getUpcomingEvents().length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
              <p className="text-muted-foreground">
                Create your first event to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
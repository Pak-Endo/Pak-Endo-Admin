export interface EventModel {
  _id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  featuredImage: string;
  gallery: Gallery;
  deletedCheck: boolean;
  eventStatus: EventStatus;
  agenda: AgendaInterface;
  location: string;
  organizer: string;
  organizerContact: string;
  type: string
  rating: number
}

export interface EventData {
  events: EventModel,
  totalCount: number
}

export interface Gallery {
  _id: string;
  eventID: string;
  mediaUrl: string[];
}

export enum EventStatus {
  ONGOING = 'ongoing',
  UPCOMING = 'upcoming',
  FINSIHED = 'finished'
}
export interface AgendaInterface {
  _id: string;
  day: number;
  agendaTitle: string;
  from: string;
  to: string;
  venue: string;
  streamUrl?: string;
  speaker?: string,
  speakerImg?: string;
  attachments?: any[];
}
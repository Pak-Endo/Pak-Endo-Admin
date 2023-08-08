export interface EventModel {
  _id: string;
  title: string;
  description: string;
  startDate: number;
  endDate: number;
  featuredImage: string;
  gallery: Gallery;
  deletedCheck: boolean;
  eventStatus: EventStatus
  streamUrl: string;
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
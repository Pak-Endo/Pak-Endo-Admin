import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EventsService } from '../events/services/events.service';
import { TuiButtonModule } from '@taiga-ui/core';

@Component({
  selector: 'app-agendas',
  standalone: true,
  imports: [
    CommonModule,
    LayoutComponent,
    TuiButtonModule
  ],
  templateUrl: './agendas.component.html',
  styleUrls: ['./agendas.component.scss']
})
export class AgendasComponent {
  destroy = new Subject();
  eventID: string | null = null;
  event: any;

  constructor(
    private ac: ActivatedRoute,
    private eventsService: EventsService
  ) {
    this.ac.params.pipe(takeUntil(this.destroy)).subscribe(value => {
      this.eventID = value['id']
      this.eventsService.getEventByID(value['id'])
      .pipe(takeUntil(this.destroy)).subscribe((data: any) => {
        console.log(data)
        this.event = data
      })
    })
  }
}

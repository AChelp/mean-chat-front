import { Component, Input, OnChanges } from '@angular/core';
import * as moment from 'moment';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-new-message',
  templateUrl: './new-message.component.html',
  styleUrls: ['./new-message.component.scss']
})
export class NewMessageComponent implements OnChanges {
  @Input() roomName: string;
  @Input() username: string;
  message: string;

  constructor(private socketService: SocketService) {
  }

  ngOnChanges(): void {
    this.message = '';
  }

  sendMessage(): void {
    if (!this.message.replace(/\s+/, '')) {
      this.message = '';
      return;
    }

    this.socketService.sendMessage({
      room: this.roomName,
      message: {
        user: this.username,
        message: this.message,
        sendAt: moment().format('h:mm A'),
      },
    });

    this.message = '';
  }

  typing(): void {
    this.socketService.typing({
      roomName: this.roomName,
      user: this.username,
    });
  }
}

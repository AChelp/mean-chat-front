import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild
} from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { serverUrl } from '../../constants';
import * as moment from 'moment';
import { Message } from '../../interfaces/message';
import { User } from '../../interfaces/user';

// @ts-ignore
@Component({
  selector: 'app-active-dialog',
  templateUrl: './active-dialog.component.html',
  styleUrls: ['./active-dialog.component.scss'],
})
export class ActiveDialogComponent implements OnInit, OnChanges, AfterViewChecked {

  @ViewChild('messagesContainer', { static: false }) private messagesContainer: ElementRef;
  @Input() userToChat: User;
  @Input() username: string;
  @Input() roomName: string;
  serverUrl = serverUrl;
  userIsTyping: string;
  lastMessagesLength = 0;
  lastReceivedMessage: string;
  prevRoom: string;
  messages: Message[] = [];
  seen = { message: '', time: '' };
  skipAmount = 0;

  constructor(
    private socketService: SocketService,
    private chatService: ChatService
  ) {
    this.socketService.connect();

    this.socketService.receiveNewMessages().subscribe((data: Message) => {
      this.messages.push(data);
      this.userIsTyping = '';
      this.lastReceivedMessage = data.message;
    });

    this.socketService.receivedTyping().subscribe(({ user }): void => {
      this.userIsTyping = user;
      setTimeout(() => {
        this.userIsTyping = '';
      }, 3000);
    });

    this.socketService
      .receivedReadNotification()
      .subscribe((data: { message: '', time: '' }): void => {
        this.seen = data;
      });
  }

  ngOnInit(): void {
    this.socketService.showUserOnline(this.username);
  }

  ngOnChanges(): void {
    this.messages = [];
    this.lastMessagesLength = 0;
    this.skipAmount = 0;
    this.socketService
      .joinRoom({
        user: this.username,
        room: this.roomName,
        prevRoom: this.prevRoom
      })
      .subscribe(data => {
        if (data.isReady) {
          this.prevRoom = this.roomName;

          if (this.skipAmount === 0) {
            this.loadMoreTen();
          }
        }
      });
  }

  loadMoreTen(): void {
    this.chatService.getRoomHistory(this.roomName, this.skipAmount)
      .subscribe((messages: Message[]) => {

        if (this.skipAmount === 0) {
          this.scrollbottom();
        }

        this.messages = [...messages, ...this.messages];
      });

    this.lastMessagesLength += 10;
    this.skipAmount += 10;
  }

  onScroll(event): void {
    if (event.target.scrollTop === 0) {
      this.loadMoreTen();
    }
  }

  ngAfterViewChecked(): void {
    if (this.skipAmount === 0) {
      setTimeout(() => {
        this.scrollbottom();
      }, 1000);
    }

    if (this.lastMessagesLength < this.messages.length) {
      this.lastMessagesLength = this.messages.length;
      this.scrollbottom();

      this.socketService.sendReadNotification({
        roomName: this.roomName,
        message: this.lastReceivedMessage,
        time: moment().format('h:mm A')
      });
    }

    if (this.skipAmount === 0 && this.messagesContainer) {
      this.scrollbottom();
    }
  }

  scrollbottom() {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }
}


import {
  AfterViewChecked, AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  ViewChild
} from '@angular/core';
import { ChatService } from '../chat.service';
import { SocketService } from '../socket.service';
import { serverUrl } from '../../constants';
import * as moment from 'moment';

// @ts-ignore
@Component({
  selector: 'app-active-dialog',
  templateUrl: './active-dialog.component.html',
  styleUrls: ['./active-dialog.component.scss'],
})
export class ActiveDialogComponent implements OnInit, OnChanges, AfterViewChecked, AfterViewInit {

  @ViewChild('messagesContainer', { static: false }) private messagesContainer: ElementRef;
  @Input() userToChat: { name: string, email: string, password: string, avatar: string, description?: string };
  @Input() username: string;
  @Input() roomName: string;
  serverUrl = serverUrl;
  userIsTyping: string;
  lastMessagesLength = 0;
  lastReceivedMessage: string;
  prevRoom: string;
  messages: { user: string, message: string, sendAt: string }[] = [];
  seen = { message: '', time: '' };
  skipAmount = 0;

  constructor(
    private socketService: SocketService,
    private chatService: ChatService
  ) {
    this.socketService.connect();

    this.socketService.recieveNewMessages().subscribe(data => {
      this.messages.push(data);
      this.userIsTyping = '';
      this.lastReceivedMessage = data.message;
    });

    this.socketService.receivedTyping().subscribe(data => {
      this.userIsTyping = data.user;
      setTimeout(() => {
        this.userIsTyping = '';
      }, 3000);
    });

    this.socketService.receivedReadNotification().subscribe(data => {
      this.seen = data;
    });
  }

  ngOnInit(): void {
    this.socketService.showUserOnline(this.username);
  }

  ngOnChanges() {
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

  loadMoreTen() {
    this.chatService.getRoomHistory(this.roomName, this.skipAmount)
      .subscribe((messages: { user: string, message: string, sendAt: string }[]) => {

        if (this.skipAmount === 0) {
          console.log('scrolling down');
          this.scrollbottom();
        }

        this.messages = [...messages, ...this.messages];
      });

    this.lastMessagesLength += 10;
    this.skipAmount += 10;
  }

  ngAfterViewInit() {
    console.log('handling scroll');
    this.messagesContainer.nativeElement.addEventListener('scroll', () => {
      if (this.messagesContainer.nativeElement.scrollTop === 0) {
        this.loadMoreTen();
      }
    });
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
      console.log('view checked');
      this.scrollbottom();
    }
  }

  scrollbottom() {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
  }
}


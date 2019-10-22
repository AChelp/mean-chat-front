import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { serverUrl } from '../constants';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Message } from '../interfaces/message';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket;

  constructor(private router: Router, private http: HttpClient) {
  }

  joinRoom(data) {
    this.socket.emit('join', data);

    return new Observable<{ isReady: boolean }>(observer => {
      this.socket.on('room ready', (res) => {
        observer.next(res);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  connect() {
    const token = sessionStorage.getItem('token');
    this.socket = io(serverUrl);
    this.socket.on('connect', () => {
      this.socket
        .emit('authenticate', { token });
    });

    this.socket.on('unauthorized', (error, callback) => {
      this.router.navigate(['']);
    });
  }

  sendMessage(data: {room: string, message: Message}): void {
    this.socket.emit('message', data);
  }

  showUserOnline(username: string): void {
    this.socket.emit('say hello', username);
  }

  receiveNewMessages() {
    return new Observable<any>(observer => {
      this.socket.on('new message', data => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  updateOnlineUsers() {
    return new Observable<any>(observer => {
      this.socket.on('online users updated', users => {
        observer.next(users);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  typing(data) {
    this.socket.emit('typing', data);
  }

  receivedTyping() {
    return new Observable<any>(observer => {
      this.socket.on('typing', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }

  sendReadNotification(data) {
    this.socket.emit('seen', data);
  }

  receivedReadNotification() {
    return new Observable<any>(observer => {
      this.socket.on('seen', (data) => {
        observer.next(data);
      });
      return () => {
        this.socket.disconnect();
      };
    });
  }
}

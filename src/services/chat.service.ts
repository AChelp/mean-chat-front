import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { serverUrl } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  public getUsers() {
    return this.http.get(`${serverUrl}/users`);
  }

  public getRoomHistory(room, skipAmount) {
    return this.http.get(`${serverUrl}/chatroom/${room}/${skipAmount}`);
  }
}

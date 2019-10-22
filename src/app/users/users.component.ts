import { Component, Input, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { SocketService } from '../../services/socket.service';
import { first } from 'rxjs/operators';
import { serverUrl } from '../../constants';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @Input() username: string;
  @Input() setActiveRoom: (user: User) => void;
  usersToShow: User[];
  users: User[];
  onlineUsers: string[];
  userSearchQuery = '';
  isShowOnline = false;
  serverUrl = serverUrl;

  constructor(private chatService: ChatService, private socketService: SocketService) {
  }

  ngOnInit(): void {
    this.chatService.getUsers()
      .pipe(
        first()
      )
      .subscribe((data: any) => {
        this.users = data.users.filter(user => user.name !== this.username);
        this.setActiveRoom(this.users.find(user => user.name === 'General room'));
        this.usersToShow = this.users;
        this.onlineUsers = data.onlineUsers;

        this.socketService.updateOnlineUsers().subscribe(usersOnline => {
          this.onlineUsers = usersOnline;
        });
      });
  }

  showAll(): void {
    this.isShowOnline = false;
    this.usersToShow = this.users;
  }

  showOnline(): void {
    this.isShowOnline = true;
    this.usersToShow = this.users.filter(user => this.onlineUsers.includes(user.name));
  }
}

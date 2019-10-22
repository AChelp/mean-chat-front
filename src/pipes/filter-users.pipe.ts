import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../interfaces/user';

@Pipe({
  name: 'filterUsers'
})
export class FilterUsersPipe implements PipeTransform {

  transform(users: User[], filter: string): User[] {
    if (!filter) {
      return users;
    }

    return users.filter(user => user.name.includes(filter));
  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterUsers'
})
export class FilterUsersPipe implements PipeTransform {

  transform(users: any[], filter: string): any {
    if (!filter) {
      return users;
    }

    return users.filter(user => user.name.includes(filter));
  }

}

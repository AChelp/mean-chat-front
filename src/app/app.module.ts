import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GreetingComponent } from './greeting/greeting.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxErrorsModule } from '@hackages/ngxerrors';
import { HttpClientModule } from '@angular/common/http';
import { DynamicModule } from 'ng-dynamic-component';
import { ChatComponent } from './chat/chat.component';
import { ActiveDialogComponent } from './active-dialog/active-dialog.component';
import { UsersComponent } from './users/users.component';
import { NewMessageComponent } from './new-message/new-message.component';
import { FilterUsersPipe } from '../pipes/filter-users.pipe';

@NgModule({
  declarations: [
    AppComponent,
    GreetingComponent,
    ChatComponent,
    ActiveDialogComponent,
    UsersComponent,
    NewMessageComponent,
    FilterUsersPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxErrorsModule,
    HttpClientModule,
    DynamicModule.withComponents([ActiveDialogComponent])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

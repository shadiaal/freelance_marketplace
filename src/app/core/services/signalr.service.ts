import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { MessageDto } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: HubConnection | undefined;
  private messageReceivedSubject = new BehaviorSubject<MessageDto | null>(null);
  
  public messageReceived = this.messageReceivedSubject.asObservable();

  constructor() { }

  public startConnection(userId: string): Promise<void> {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5021/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (message: MessageDto) => {
      console.log('SignalR received message:', message);
      message.isFromMe = message.senderId === userId;
      this.messageReceivedSubject.next(message);
    });

    return this.hubConnection.start();
  }

  public joinChatRoom(chatId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('Hub connection not established');
    }
    console.log(`Joining chat room: ${chatId}`);
    return this.hubConnection.invoke('JoinChat', chatId.toString());
  }

  public leaveChatRoom(chatId: number): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject('Hub connection not established');
    }
    console.log(`Leaving chat room: ${chatId}`);
    return this.hubConnection.invoke('LeaveChat', chatId.toString());
  }

  public stopConnection(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.resolve();
    }
    return this.hubConnection.stop();
  }
}
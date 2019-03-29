import {Component, ElementRef, OnDestroy, Optional, ViewChild} from '@angular/core';
import {NgTalkChannelComponent} from '../ng-talk-channel.component';
import {ChatMessage, ChatMessageType} from '../../../models/chat-message';
import {NgTalkChannelsComponent} from '@projects/ng-talk/components/ng-talk-channels/ng-talk-channels.component';
import {Subscription} from 'rxjs';
import {ChatChannel} from '@projects/ng-talk/models/chat-channel';


@Component({
    template: `
        <form (ngSubmit)="sendMessage()">
            <input #textInput class="input" [(ngModel)]="newMessage" name="newMessage" maxlength="1000" autocomplete="off"
                   [placeholder]="chat.settings.writePlaceholder" (focus)="onInputFocus()"/>
            <i class="send-icon fas fa-paper-plane" (click)="sendMessage()"></i>
        </form>
    `,
    styleUrls: ['ng-talk-send-message.component.less']
})
export class NgTalkSendMessageComponent implements OnDestroy {

    @ViewChild('textInput') public textInput: ElementRef<HTMLElement>;
    public newMessage: string;

    private _channelChangedSubscription: Subscription;

    constructor(public chat: NgTalkChannelComponent, @Optional() channelList: NgTalkChannelsComponent) {
        if (channelList) { // Detectar cambio de canal si estamos en un listado
            this._channelChangedSubscription = channelList.channelChanged.subscribe((c) => this._onChannelChanged(c));
        }
    }

    public sendMessage() {
        if (this.newMessage) {
            const message: ChatMessage = {
                type: ChatMessageType.Text,
                from: this.chat.user,
                content: this.newMessage
            };
            this.chat.adapter.sendMessage(this.chat.channel, message)
                .then(() => this.chat.messageSent.emit(message));

            this.newMessage = '';
        }
    }

    public focus() {
        if (this.textInput) {
            this.textInput.nativeElement.focus();
        }
    }

    public onInputFocus() {
        // Mark as read if component is focused
        if (this.chat.channel && this.chat.channel.unread > 0 && document.hasFocus()) {
            this.chat.adapter.markAsRead(this.chat.channel);
        }
    }

    private _onChannelChanged(c: ChatChannel) {
        this.focus();
    }

    public ngOnDestroy() {
        if (this._channelChangedSubscription) {
            this._channelChangedSubscription.unsubscribe();
        }
    }
}

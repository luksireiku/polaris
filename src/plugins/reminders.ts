import { Bot, Message } from '..';
import { Conversation } from '../conversation';
import { DatabaseReminder } from '../database';
import { db } from '../main';
import { PluginBase } from '../plugin';
import { allButNWord, catchException, generateCommandHelp, getInput, getWord, isInt, now } from '../utils';

export class RemindersPlugin extends PluginBase {
  constructor(bot: Bot) {
    super(bot);
    this.commands = [
      {
        command: '/remindme',
        parameters: [
          {
            name: 'delay',
            required: true,
          },
          {
            name: 'unit',
            required: true,
          },
          {
            name: 'text',
            required: true,
          },
        ],
        description: 'Remind you things after a delay.',
      },
    ];
    this.cronExpression = '*/10 * * * * *';
  }
  async run(msg: Message): Promise<void> {
    const input = getInput(msg, false);
    if (!input) {
      return this.bot.replyMessage(msg, generateCommandHelp(this, msg.content), 'text', null, { format: 'HTML' });
    }

    if (msg.sender.constructor.name == 'Conversation') {
      return;
    }

    const delay = getWord(input, 1);
    const unit = getWord(input, 2);
    const text = allButNWord(input, 2);
    const alarm = this.generateAlarm(delay, unit);

    if (!isInt(delay)) {
      return this.bot.replyMessage(msg, this.bot.errors.invalidArgument);
    }

    const reminder: DatabaseReminder = {
      bot: this.bot.user.id,
      alarm: alarm,
      chatId: msg.conversation.id,
      firstName: msg.sender['firstName'],
      username: msg.sender['username'],
      text: text,
    };
    try {
      let delayText = delay;
      if (unit == 's' || unit == 'sec' || unit == 'secs' || unit == 'second' || unit == 'seconds') {
        delayText = `${delay} seconds`;
      } else if (unit == 'm' || unit == 'min' || unit == 'mins' || unit == 'minute' || unit == 'minutes') {
        delayText = `${delay} minutes`;
      } else if (unit == 'h' || unit == 'hour' || unit == 'hours') {
        delayText = `${delay} hours`;
      } else if (unit == 'd' || unit == 'day' || unit == 'days') {
        delayText = `${delay} days`;
      } else {
        return this.bot.replyMessage(msg, this.bot.errors.invalidArgument);
      }
      db.remindersSnap.child(String(alarm).split('.')[0]).ref.set(reminder);

      const message = `<b>${msg.sender['firstName']}</b>, I'll remint you in <b>${delayText}</b> to <i>${text}</i>.`;
      this.bot.replyMessage(msg, message);
    } catch (e) {
      catchException(e, this.bot);
      this.bot.replyMessage(msg, this.bot.errors.exceptionFound);
    }
  }

  async cron(): Promise<void> {
    if (db.reminders) {
      // Reminders are indexed by alarm time so there os no need to check more than one
      const index = Object.keys(db.reminders)[0];
      const reminder = db.reminders[index];

      if (String(reminder.bot) == String(this.bot.user.id) && reminder.alarm < now()) {
        let chat;
        if (+reminder.chatId > 0) {
          chat = new Conversation(reminder.chatId, db.users[reminder.chatId].first_name);
        } else {
          chat = new Conversation(reminder.chatId, db.groups[reminder.chatId].title);
        }

        let text = `<i>${reminder.text}</i>\n - ${reminder.firstName}`;
        if (reminder.username && reminder.username.length > 0) {
          text += ` (@${reminder.username})`;
        }
        this.bot.sendMessage(chat, text);
        db.remindersSnap.child(index).ref.set(null);
      }
    }
  }

  generateAlarm(delay: string, unit: string): number {
    const alarm = now();
    if (unit == 's' || unit == 'sec' || unit == 'secs' || unit == 'second' || unit == 'seconds') {
      return now() + parseFloat(delay);
    } else if (unit == 'm' || unit == 'min' || unit == 'mins' || unit == 'minute' || unit == 'minutes') {
      return now() + parseFloat(delay) * 60;
    } else if (unit == 'h' || unit == 'hour' || unit == 'hours') {
      return now() + parseFloat(delay) * 60 * 60;
    } else if (unit == 'd' || unit == 'day' || unit == 'days') {
      return now() + parseFloat(delay) * 60 * 60 * 24;
    }
    return alarm;
  }
}
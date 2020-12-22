import { Bot, Message } from '..';
import { PluginBase } from '../plugin';
import { generateCommandHelp, getInput, hasTag, random, sendRequest } from '../utils';

export class ImagePlugin extends PluginBase {
  constructor(bot: Bot) {
    super(bot);
    this.commands = [
      {
        command: '/image',
        shortcut: '/i',
        friendly: '^Image of ',
        parameters: [
          {
            name: 'query',
            required: false,
          },
        ],
        description: 'Returns an image on the internet',
      },
    ];
  }
  async run(msg: Message): Promise<void> {
    const input = getInput(msg, false);
    if (!input) {
      return this.bot.replyMessage(msg, generateCommandHelp(this, msg.content));
    }
    const searchUrl = 'https://duckduckgo.com/';
    const searchParams = {
      q: input,
    };
    const searchRes = await sendRequest(searchUrl, searchParams);
    if (!searchRes) {
      return this.bot.replyMessage(msg, this.bot.errors.connectionError);
    }
    const searchContent = await searchRes.text();
    const searchObj = new RegExp('vqd=([\\d-]+)&', 'gim').exec(searchContent);
    if (!searchObj || searchObj.length == 0) {
      return this.bot.replyMessage(msg, this.bot.errors.unknown);
    }

    const headers = {
      authority: 'duckduckgo.com',
      accept: 'application/json, text/javascript, */*; q=0.01',
      'sec-fetch-dest': 'empty',
      'x-requested-with': 'XMLHttpRequest',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      referer: 'https://duckduckgo.com/',
      'accept-language': this.bot.config.locale + ';q=0.9',
    };
    const params = {
      l: this.bot.config.locale,
      dl: this.bot.config.locale.slice(0, 2),
      ct: this.bot.config.locale.slice(0, 2).toUpperCase(),
      ss_mkt: this.bot.config.locale.slice(0, 2),
      o: 'json',
      q: input,
      vqd: searchObj[1],
      f: ',,,',
      p: '1',
      v7exp: 'a',
    };
    if (!hasTag(this.bot, msg.conversation.id, 'nonsfw')) {
      params['kp'] = -2;
    }

    const url = searchUrl + 'i.js';
    const res = await sendRequest(url, params, headers);
    const content = await res.json();

    if (!content || content['results'] == undefined) {
      return this.bot.replyMessage(msg, this.bot.errors.connectionError);
    }
    if (content.results.length == 0) {
      return this.bot.replyMessage(msg, this.bot.errors.noResults);
    }
    const photo = content.results[random(0, content.results.length - 1)].image;
    return this.bot.replyMessage(msg, photo, 'photo');
  }
}

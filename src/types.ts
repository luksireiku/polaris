import { Config } from '.';

export class ErrorMessages {
  adminRequired?: string;
  apiLimitExceeded?: string;
  connectionError?: string;
  disabled?: string;
  downloadFailed?: string;
  exceptionFound?: string;
  failed?: string;
  groupOnly?: string;
  idiotKicked?: string;
  invalidArgument?: string;
  missingId?: string;
  missingParameter?: string;
  needsReply?: string;
  noResults?: string;
  notImplemented?: string;
  permissionRequired?: string;
  privateOnly?: string;
  spammerDetected?: string;
}

export class Errors extends ErrorMessages {
  static adminRequired = 'Only works with <b>admin privileges</b>';
  static apiLimitExceeded = 'The API limits have been exceeded';
  static connectionError = 'Connection error';
  static disabled = 'That feature is disabled';
  static downloadFailed = 'Download failed';
  static exceptionFound = 'Exception found';
  static failed = 'Failed';
  static groupOnly = 'Only works with <b>groups</b>';
  static idiotKicked = 'Idiot kicked';
  static invalidArgument = 'Invalid argument';
  static missingId = 'Missing ID';
  static missingParameter = 'Missing parameter';
  static needsReply = 'Only works with <b>replies</b>';
  static noResults = 'No results';
  static notImplemented = 'Function not implemented';
  static permissionRequired = 'Permission required';
  static privateOnly = 'Only works in <b>private</b>';
  static spammerDetected = 'Spammer detected, proceed to commit death';
}

export interface ApiKeys {
  telegramPhoneNumber?: string;
  telegramBotToken?: string;
  telegramApiHash?: string;
  telegramAppId?: number;
  databaseEncryptionKey?: string;
  discordBotToken?: string;
  discordClientId?: number;
  blizzardClientId?: string;
  blizzardClientSecret?: string;
  catApi?: string;
  giphy?: string;
  googleDeveloperConsole?: string;
  lastfm?: string;
  openWeather?: string;
  tenor?: string;
  riotApi?: string;
  wolframAlpha?: string;
  matrixAccessToken?: string;
  matrixHomeserverUrl?: string;
  facebookPageAccessToken?: string;
  facebookVerifyToken?: string;
}

export interface Instance {
  translation?: string;
  bindings?: string;
  owner?: string;
  adminConversationId?: string;
  alertsConversationId?: string;
  plugins?: string | string[];
  apiKeys?: ApiKeys;
}

export abstract class Command {
  command: string;
  friendly?: string;
  shortcut?: string;
  parameters?: Parameter[];
  hidden?: boolean;
  description?: string;
  keepDefault?: boolean;
  skipHelp?: boolean;

  constructor() {
    this.friendly = null;
    this.shortcut = null;
    this.parameters = null;
    this.hidden = false;
    this.description = null;
    this.keepDefault = false;
  }
}

export abstract class Parameter {
  name: string;
  required: boolean;
}

export class User {
  id: number | string;
  firstName: string;
  lastName: string;
  username: string;
  isBot: boolean;

  constructor(id: number | string, firstName?: string, lastName?: string, username?: string, isBot = false) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.isBot = isBot;
  }
}

export class Conversation {
  id: number | string;
  title: string;

  constructor(id: number | string, title?: string) {
    this.id = id;
    this.title = title;
  }
}

export class ConversationInfo extends Conversation {}

export class Message {
  id: number | string;
  conversation: Conversation;
  sender: User | Conversation;
  content: string;
  type: string;
  date: number;
  reply: Message;
  extra: Extra;

  constructor(
    id: number | string,
    conversation: Conversation,
    sender: User | Conversation,
    content: string,
    type?: string,
    date?: number,
    reply?: Message,
    extra?: Extra,
  ) {
    this.id = id;
    this.conversation = conversation;
    this.sender = sender;
    this.content = content;
    this.type = type;
    this.date = date;
    this.reply = reply;
    this.extra = extra;
  }
}

export abstract class Extra extends Object {
  input?: string;
  inputReply?: string;
  addPing?: boolean;
  format?: string;
  preview?: boolean;
  caption?: string;
  message?: number | string;
  title?: string;
  description?: string;
  photo?: string;
  conversation?: number | string;
  commands?: string;
  stickerSetName?: string;
  messageId?: number | string;
  userId?: number | string;
  fromChatId?: number | string;
  customTitle?: string;
  urls?: string[];
  mentions?: string[];
  hashtags?: string[];
  viaBotUserId?: number | string;
  restrictionReason?: string;
  replyMarkup?: any;
}

export interface CoordinatesResult {
  status: string;
  lat: number;
  lng: number;
  locality: string;
  country: string;
}

export interface DatabaseUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  description?: string;
  is_bot?: boolean;
  is_scam?: boolean;
}

export interface DatabaseConversation {
  title?: string;
  description?: string;
  username?: string;
  invite_link?: string;
  member_count?: number;
  is_scam?: boolean;
  is_channel?: boolean;
  linked_chat_id?: number;
  date?: number;
  restriction_reason?: string;
}

export interface DatabaseReminder {
  alarm?: number;
  chatId?: number | string;
  text?: string;
  firstName?: string;
  username?: string;
  bot?: number | string;
}

export interface DatabasePin {
  content?: string;
  creator?: number | string;
  type?: string;
  bot?: number | string;
}

export interface DatabasePoleList {
  [id: string]: DatabasePole;
}

export interface DatabasePole {
  pole?: number | string;
  subpole?: number | string;
  fail?: number | string;
  iron?: number | string;
  canaria?: number | string;
  andaluza?: number | string;
}

export interface SortedPole extends DatabasePole {
  uid?: number | string;
  points?: number;
}

export interface iString {
  [id: string]: string;
}

export interface iStringNested {
  [id: string]: iString;
}

export interface iConfig {
  [id: string]: Config;
}

export interface iUser {
  [id: string]: DatabaseUser;
}

export interface iConversation {
  [id: string]: DatabaseConversation;
}

export interface iPin {
  [id: string]: DatabasePin;
}

export interface iPole {
  [id: string]: DatabasePoleList;
}

export interface iReminder {
  [id: string]: DatabaseReminder;
}

export interface iTag {
  [id: string]: iString;
}

export interface PluginTranslation {
  commands?: Command[];
  strings?: iString;
  data?: any;
}

export interface iPluginTranslation {
  [id: string]: PluginTranslation;
}

export interface GroupAdministration {
  alias?: string;
  link?: string;
  motd?: string;
  public?: boolean;
  rules?: iString;
}

export interface iGroupAdministration {
  [id: string]: GroupAdministration;
}

export interface Translation {
  extends?: string;
  errors?: ErrorMessages;
  plugins?: iPluginTranslation;
}

export interface iTranslation {
  [id: string]: Translation;
}

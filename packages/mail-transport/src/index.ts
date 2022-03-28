import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Transport from 'winston-transport';

type MessageOptions = Partial<Mail.Options>;

export default class MailTransport extends Transport {
    private readonly _transportOptions: Transport.TransportStreamOptions;
    private readonly _messageOptions: MessageOptions;
    private readonly _mailConfig: SMTPTransport.Options;

    constructor(options: {
        transportOptions: Transport.TransportStreamOptions;
        messageOptions: MessageOptions;
        config: SMTPTransport.Options;
    }) {
        options = options || {};
        super(options.transportOptions);

        this._transportOptions = options.transportOptions || { jsonTransport: true };
        this._messageOptions = options.messageOptions || {};
        this._mailConfig = options.config;
    }

    log(
        info: {
            level: string;
            message: string;
        },
        next: () => void,
    ): void {
        const { level, message, ...meta } = info;

        const messageOptions = { ...this._messageOptions };
        messageOptions.subject = `${level.toUpperCase()} level logg`;

        // @ts-ignore
        messageOptions.html = meta[Symbol.for('message')];

        const transporter = nodemailer.createTransport(this._mailConfig);
        transporter.sendMail(
            messageOptions,
            /**
             * @fires Mail#error
             * @fires Mail#logged
             * @param {?Error} err
             * @param {Object} info
             */
            (err, info) => {
                setImmediate(next);
                if (err) {
                    this.emit('error', err);
                } else {
                    this.emit('logged', info);
                }
            },
        );
    }
}

# Mail Transport

Mail transport for [Winston](https://github.com/winstonjs/winston)
It can send email to the given configuration when the log level matches the one you provide in the config

## Usage

```typescript
const mailTransport = new MailTransport({
    transportOptions: {
        level: 'error',
        format: htmlFormat,
    },
    messageOptions: {
        from: {
            name: process.env.LOGGER_EMAIL_NAME as string,
            address: process.env.LOGGER_EMAIL as string,
        },
        to: `example@test.com`,
    },
    config: {
        host: process.env.LOGGER_MAIL_HOST,
        port: parseInt(process.env.LOGGER_MAIL_PORT as string),
        auth: {
            user: process.env.LOGGER_MAIL_USERNAME,
            pass: process.env.LOGGER_MAIL_PASSWORD,
        },
    },
});

const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
    ),
    transports: [mailTransport],
});
```

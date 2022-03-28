import MailTransport from '../src';

describe('MailTransport', () => {
    describe('constructor', () => {
        it('works', () => {
            new MailTransport({
                transportOptions: {
                    level: 'error',
                },
                messageOptions: {
                    from: {
                        name: 'example',
                        address: 'logger-exmaple@test.com',
                    },
                    to: `example@test.com`,
                },
                config: {
                    port: 333,
                    auth: {
                        user: 'user@test.com',
                        pass: 'superpassword',
                    },
                },
            });
        });
    });
});

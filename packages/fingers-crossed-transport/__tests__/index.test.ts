import { Logger, createLogger } from 'winston';
import TransportStream from 'winston-transport';
import { ConsoleTransportInstance } from 'winston/lib/winston/transports';

import { FingersCrossedTransport, LEVEL, LogMessageInfo } from '../src';

function makeLog(level: string, message: string): LogMessageInfo {
    const log = { level } as LogMessageInfo;
    log[LEVEL] = level;
    // @ts-ignore
    return {
        level: level,
        message: message,
        [LEVEL]: level,
        [Symbol.for('message')]: `{"level":"${level}","message":"${message}"}`,
    };
}

let consoleLogMock: jest.MockedFunction<(info: LogMessageInfo, next: () => void) => unknown>;
let consoleMock: jest.Mocked<ConsoleTransportInstance>;
let transport: FingersCrossedTransport;
let logger: Logger;

const maxItemsInBuffer = 100;
const nextExpect = expect.anything();

describe('FingersCrossedTransport', () => {
    beforeEach(() => {
        jest.resetAllMocks();

        consoleLogMock = jest.fn().mockImplementation((info, next) => {
            next();
        });

        consoleMock = {
            log: consoleLogMock,
        } as unknown as jest.Mocked<ConsoleTransportInstance>;

        transport = new FingersCrossedTransport(consoleMock, {
            standardLevel: 'info',
            activationLevel: 'warn',
            maxItemsInBuffer: maxItemsInBuffer,
        });

        logger = createLogger({
            transports: [transport],
        });
    });

    describe('constructor', () => {
        it('should fail if the decorated transport has no .log() method', () => {
            expect(
                () =>
                    new FingersCrossedTransport({} as TransportStream, {
                        standardLevel: 'info',
                        activationLevel: 'warn',
                    }),
            ).toThrow(new Error('Decorated Transport has no log method'));
        });

        it('should fail if the activation log level is not defined', () => {
            expect(() => new FingersCrossedTransport(consoleMock, { standardLevel: 'info' })).toThrow(
                new Error('Activation logging level is missing from the configuration'),
            );
        });

        it('should fail if the standard log level is not defined', () => {
            expect(() => new FingersCrossedTransport(consoleMock, { activationLevel: 'warn' })).toThrow(
                new Error('Standard logging level is missing from the configuration'),
            );
        });

        it('should fail if the activation log level has higher rank than the standard logging level', () => {
            expect(
                () =>
                    new FingersCrossedTransport(consoleMock, {
                        standardLevel: 'warn',
                        activationLevel: 'info',
                    }),
            ).toThrow(
                new Error(
                    'The activation logging level (info) must be higher priority than the standard logging level (warn)',
                ),
            );
        });
    });

    describe('log', () => {
        it.each([['warn'], ['error']])(
            'should log messages with level higher or equal to the fingers crossed threshold: %s',
            (level: string) => {
                const info = makeLog('warn', `${level} msg`);
                logger.log(level, info);

                expect(consoleMock.log).toHaveBeenCalledWith(info, nextExpect);
            },
        );

        it.each([['silly'], ['debug'], ['verbose'], ['http']])(
            'should not log messages with level lower than the threshold: %s',
            (level: string) => {
                logger.log(level, 'A Message');

                expect(consoleMock.log).not.toHaveBeenCalled();
            },
        );

        it('should flush buffer when threshold is reached', () => {
            const expectedParamsForCalls: [unknown, unknown][] = [];
            const nrItemsInBuffer = maxItemsInBuffer / 2;
            for (let i = 0; i < nrItemsInBuffer; i++) {
                const epc = makeLog('info', `info msg ${i}`);
                expectedParamsForCalls.push([epc, nextExpect]);
                logger.info(epc.message);
            }

            const warnLog = makeLog('warn', `warn msg ${Date.now()}`);
            logger.warn(warnLog.message); // activate threshold

            expectedParamsForCalls.forEach((params, index) =>
                expect(consoleMock.log).toHaveBeenNthCalledWith(index + 1, ...params),
            );
            expect(consoleMock.log).toHaveBeenNthCalledWith(nrItemsInBuffer + 1, warnLog, nextExpect);
            expect(consoleMock.log).toHaveBeenCalledTimes(nrItemsInBuffer + 1);

            const errLog = makeLog('error', `error msg ${Date.now()}`);
            logger.error(errLog.message); // activate threshold
            expect(consoleMock.log).toHaveBeenNthCalledWith(nrItemsInBuffer + 2, errLog, nextExpect);
            expect(consoleMock.log).toHaveBeenCalledTimes(nrItemsInBuffer + 2);
        });

        it('maxItemsInBuffer works correctly', () => {
            for (let i = 0; i < maxItemsInBuffer; i++) {
                logger.info(`info msg ${i}`);
            }
            logger.warn('warn msg');
            expect(consoleMock.log).toHaveBeenNthCalledWith(1, makeLog('info', `info msg 99`), nextExpect);
            expect(consoleMock.log).toHaveBeenNthCalledWith(2, makeLog('warn', `warn msg`), nextExpect);
        });
    });

    describe('reset', () => {
        it('should start storing messages again after reset when resetOnActivation is set to false', () => {
            transport = new FingersCrossedTransport(consoleMock, {
                standardLevel: 'info',
                activationLevel: 'warn',
                resetOnActivation: false,
            });
            logger = createLogger({
                transports: transport,
            });

            const warnLog = makeLog('warn', 'warn msg');
            logger.warn(warnLog);
            expect(consoleMock.log).toHaveBeenNthCalledWith(1, warnLog, nextExpect);
            expect(transport.loggingEnabled).toBe(true);

            // should never not log messages below standard level even when activation threshold is reached
            const debugLog = makeLog('debug', 'debug msg');
            logger.debug(debugLog.message);
            expect(consoleMock.log).toHaveBeenCalledTimes(1);

            const infoLog = makeLog('info', 'info msg');
            logger.info(infoLog.message);
            expect(consoleMock.log).toHaveBeenNthCalledWith(2, infoLog, nextExpect);

            transport.reset();
            consoleLogMock.mockReset();

            // after reset do not log until threshold is reached again
            logger.debug(debugLog.message);
            expect(consoleMock.log).not.toHaveBeenCalled();

            logger.info(infoLog.message);
            expect(consoleMock.log).not.toHaveBeenCalled();

            const warnLog1 = makeLog('warn', `warn msg ${Date.now()}`);
            logger.warn(warnLog1.message);
            expect(consoleMock.log).toHaveBeenCalledWith(warnLog1, nextExpect);
        });

        it('resetOnActivate is true', () => {
            transport = new FingersCrossedTransport(consoleMock, {
                standardLevel: 'info',
                activationLevel: 'warn',
                resetOnActivation: true,
            });
            logger = createLogger({
                transports: transport,
            });

            const infoLog1 = makeLog('info', `info ${Date.now()}`);
            logger.info(infoLog1.message);

            const warnLog = makeLog('warn', 'warn msg');
            logger.warn(warnLog);

            // logger reset automatically when reached activation threshold and flushed previous messages
            expect(transport.loggingEnabled).toBe(false);
            expect(consoleMock.log).toHaveBeenNthCalledWith(1, infoLog1, nextExpect);
            expect(consoleMock.log).toHaveBeenNthCalledWith(2, warnLog, nextExpect);

            // should never not log messages below standard level even when activation threshold is reached
            const debugLog = makeLog('debug', 'debug msg');
            logger.debug(debugLog.message);
            expect(consoleMock.log).toHaveBeenCalledTimes(2);

            // is already reset and will not print anymore until it reaches activation threshold again
            const infoLog = makeLog('info', 'info msg');
            logger.info(infoLog.message);
            expect(consoleMock.log).not.toHaveBeenNthCalledWith(2, infoLog, nextExpect);
        });
    });
});

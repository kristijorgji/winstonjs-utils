import { setImmediate } from 'timers';

import { TransformableInfo } from 'logform';
import Transport from 'winston-transport';

const LEVEL_PRIORITIES = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};

export interface FingersCrossedTransportOptions extends Transport.TransportStreamOptions {
    standardLevel?: string;
    activationLevel?: string;
    maxItemsInBuffer?: number;
    resetOnActivation?: boolean;
}

export const LEVEL = Symbol.for('level');
export const SPLAT = Symbol.for('splat');

export interface LogMessageInfo extends TransformableInfo {
    [LEVEL]: string;
    [SPLAT]: unknown[];
}

/*
 * This transport works as follows:
 * - All messages with level which priority greater than standardLevel are logged immediately
 * - All messages with level which priority is lower than standardLevel are not be logged but are stored
 * - When a message with level priority greater then activationLevel arrives, all stored messages
 *   are logged in one go
 *
 */
export class FingersCrossedTransport extends Transport {
    private decoratedTransport: Transport;
    private storedMessages: LogMessageInfo[] = [];
    private readonly standardLevelRank: number;
    private readonly activationLevelRank: number;
    private readonly maxItemsInBuffer?: number;
    private readonly resetOnActivation: boolean = true;

    private _loggingEnabled = false;

    constructor(decoratedTransport: Transport, options: FingersCrossedTransportOptions) {
        super({ level: 'debug', ...options });

        if (!decoratedTransport.log) {
            throw new Error('Decorated Transport has no log method');
        }

        if (!options.standardLevel) {
            throw new Error('Standard logging level is missing from the configuration');
        }

        if (!options.activationLevel) {
            throw new Error('Activation logging level is missing from the configuration');
        }

        if (options.maxItemsInBuffer !== undefined) {
            this.maxItemsInBuffer = options.maxItemsInBuffer;
        }

        if (options.resetOnActivation !== undefined) {
            this.resetOnActivation = options.resetOnActivation;
        }

        this.standardLevelRank = FingersCrossedTransport.rankOf(options.standardLevel);
        this.activationLevelRank = FingersCrossedTransport.rankOf(options.activationLevel);

        if (this.standardLevelRank < this.activationLevelRank) {
            throw new Error(
                `The activation logging level (${options.activationLevel}) must be higher priority than the standard logging level (${options.standardLevel})`,
            );
        }

        this.decoratedTransport = decoratedTransport;
    }

    log(info: LogMessageInfo, next: () => void): void {
        setImmediate(() => {
            this.emit('logged', info);
        });

        const infoLevelRank = FingersCrossedTransport.rankOf(info[LEVEL]);

        if (this.activationLevelRank >= infoLevelRank) {
            if (!this.resetOnActivation) {
                this._loggingEnabled = true;
            }

            this.flushStoredMessages();
            this.decoratedTransport.log!(info, next);
        } else if (this.standardLevelRank >= infoLevelRank) {
            if (this.maxItemsInBuffer && this.storedMessages.length >= this.maxItemsInBuffer - 1) {
                this.storedMessages = [];
            }
            if (this._loggingEnabled) {
                this.decoratedTransport.log!(info, next);
            } else {
                this.storedMessages.push(info);
                return next();
            }
        } else {
            return next();
        }
    }

    get loggingEnabled(): boolean {
        return this._loggingEnabled;
    }

    private flushStoredMessages(): void {
        this.storedMessages.forEach(infoStoreObject => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            this.decoratedTransport.log!(infoStoreObject, () => {});
        });

        this.storedMessages = [];
    }

    private static rankOf(level: string): number {
        return LEVEL_PRIORITIES[level];
    }

    reset(): void {
        this.storedMessages = [];
        this._loggingEnabled = false;
    }
}

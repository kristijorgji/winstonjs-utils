import * as fs from 'fs';

import htmlFormat from '../src';

describe('htmlFormat', () => {
    it('transforms', () => {
        // @ts-ignore
        const r: {
            level: string;
            message: string;
        } = htmlFormat.transform({
            level: 'warn',
            message: 'ookk',
        });
        expect(r.level).toBe('warn');
        expect(r.message).toBe('ookk');
        expect(r[Symbol.for('message')]).toBe(
            fs.readFileSync(`${__dirname}/__fixtures/transformed.txt`, { encoding: 'utf-8' }),
        );
    });
});

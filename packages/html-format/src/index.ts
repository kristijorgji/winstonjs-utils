import { format } from 'winston';

const trStyle = 'padding: 10px; text-align: left;';
const tdStyle = 'padding: 4px;text-align: left;vertical-align: top;background: #eee;color: #000';

type ExtraType = undefined | Record<string, unknown>;

const htmlFormat = format(info => {
    const { level, message, timestamp, stack } = info;
    const extra: ExtraType = info.extra;

    const newMsg = `
    <html lang="en">     
        <body>
            <h1 style="text-align: left; color: #ffffff; padding: 5px; font-size: 1.8rem; margin-bottom: 1.4rem; background-color: ${colorForLevel(
                level,
            )}">${level.toUpperCase()}</h1>
            <table>
                <tbody>
                    <tr style="${trStyle}">
                        <td style="${tdStyle}">Message:</td>
                        <td style="${tdStyle}">${message}</td>
                    </tr>
                    <tr style="${trStyle}">
                        <td style="${tdStyle}">Time:</td>
                        <td style="${tdStyle}">${timestamp}</td>
                    </tr>
                    ${
                        stack === undefined
                            ? ''
                            : `
                        <tr style="${trStyle}">
                            <td style="${tdStyle}">Stack Trace:</td>
                            <td style="${tdStyle}">${stack}</td>
                        </tr>`
                    }
                    ${renderExtra(extra)}
                </tbody>
            </table>
        </body>
    </html>`;

    // @ts-ignore
    info[Symbol.for('message')] = newMsg;

    return info;
})();
export default htmlFormat;

function renderExtra(extra: ExtraType): string {
    if (extra === undefined) {
        return '';
    }

    return Object.keys(extra).reduce(
        (p, key) => `
        ${p}
        <tr style="${trStyle}">
            <td style="${tdStyle}">extra.${key}:</td>
            <td style="${tdStyle}">${extra[key]}</td>                                
        </tr>`,
        '',
    );
}

function colorForLevel(level: string) {
    switch (level) {
        case 'error':
            return 'red';
        case 'info':
            return 'blue';
        default:
            return 'transparent';
    }
}

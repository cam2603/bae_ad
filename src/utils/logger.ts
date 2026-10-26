// Logger tối giản: in ra console có thời gian để đối chiếu với appium log khi điều tra lỗi.
type Level = 'INFO' | 'WARN' | 'ERROR' | 'STEP';

function write(level: Level, message: string): void {
  const time = new Date().toISOString().slice(11, 23);
  const line = `[${time}] [${level}] ${message}`;
  if (level === 'ERROR') console.error(line);
  else console.log(line);
}

export const logger = {
  info: (m: string) => write('INFO', m),
  warn: (m: string) => write('WARN', m),
  error: (m: string) => write('ERROR', m),
  step: (m: string) => write('STEP', m),
};

import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { act } from 'react';
import type { Root } from 'react-dom/client';

const GLOBAL_KEYS = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLInputElement',
  'HTMLButtonElement',
  'Node',
  'Event',
  'getComputedStyle',
] as const;

type AppModule = typeof import('@/App');
type ReactDomClient = typeof import('react-dom/client');

let dom: JSDOM;
let container: HTMLElement;
let root: Root | null = null;
let App: AppModule['default'];
let createRoot: ReactDomClient['createRoot'];

before(async () => {
  dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
  });
  const win = dom.window as unknown as Record<string, unknown>;
  for (const key of GLOBAL_KEYS) {
    Object.defineProperty(globalThis, key, {
      value: key === 'window' ? dom.window : win[key],
      configurable: true,
      writable: true,
    });
  }
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

  // react-dom must load after the DOM globals exist, or its input-event handling is disabled.
  ({ createRoot } = await import('react-dom/client'));
  ({ default: App } = await import('@/App'));
});

after(() => {
  dom.window.close();
});

beforeEach(() => {
  container = document.getElementById('root') as HTMLElement;
  root = createRoot(container);
  act(() => root?.render(<App />));
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container.innerHTML = '';
});

function setValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  act(() => {
    setter?.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}

function fieldByLabel(labelText: string): HTMLInputElement {
  const label = Array.from(container.querySelectorAll('label')).find(
    (l) => l.querySelector('span')?.textContent === labelText,
  );
  const input = label?.querySelector('input');
  if (!input) throw new Error(`No field labelled "${labelText}"`);
  return input;
}

function buttonContaining(text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((b) =>
    b.textContent?.includes(text),
  );
  if (!button) throw new Error(`No button containing "${text}"`);
  return button;
}

function click(element: HTMLElement) {
  act(() => element.click());
}

function toggleEquipment(item: string) {
  const label = Array.from(container.querySelectorAll('label')).find(
    (l) => l.textContent?.trim() === item,
  );
  const input = label?.querySelector('input');
  if (!input) throw new Error(`No equipment checkbox "${item}"`);
  click(input);
}

function roomNames(): string[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')).map(
    (b) => b.querySelector('p')?.textContent ?? '',
  );
}

function resultText(): string {
  return container.querySelector('aside')?.textContent ?? '';
}

describe('UI: conflict, stale-result clearing, available room and blocked room', () => {
  test('Athena Hall conflicts at 09:30-10:30, Newton Lab clears then is available, Da Vinci is blocked', () => {
    setValue(fieldByLabel('Start time'), '09:30');
    setValue(fieldByLabel('End time'), '10:30');

    click(buttonContaining('Athena Hall'));
    click(buttonContaining('Check availability'));
    assert.match(resultText(), /Unavailable/);
    assert.match(resultText(), /Intro to Algorithms/);

    click(buttonContaining('Newton Lab'));
    assert.doesNotMatch(resultText(), /Unavailable|Available/);
    assert.match(resultText(), /Select a room and time range/);

    click(buttonContaining('Check availability'));
    assert.match(resultText(), /Available/);
    assert.match(resultText(), /Newton Lab is available from 09:30 to 10:30/);

    click(buttonContaining('Da Vinci Studio'));
    click(buttonContaining('Check availability'));
    assert.match(resultText(), /Unavailable/);
    assert.match(resultText(), /Da Vinci Studio is currently blocked/);
  });

  test('40 attendees with Projector and Whiteboard shows Newton Lab; 41 shows the empty state and disables Check', () => {
    const attendees = container.querySelector<HTMLInputElement>('input[type="number"]');
    if (!attendees) throw new Error('No attendee input');

    setValue(attendees, '40');
    toggleEquipment('Projector');
    toggleEquipment('Whiteboard');
    assert.deepEqual(roomNames(), ['Newton Lab']);
    assert.equal(buttonContaining('Check availability').disabled, false);

    setValue(attendees, '41');
    assert.deepEqual(roomNames(), []);
    assert.match(container.textContent ?? '', /No rooms match these filters/);
    assert.equal(buttonContaining('Check availability').disabled, true);
  });
});

import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register();
import { vi } from 'bun:test';
vi.mocked = (fn) => fn;

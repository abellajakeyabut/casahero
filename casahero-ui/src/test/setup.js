import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {setupServer} from 'msw/node';
import { handlers } from '../mocks/handlers';
import { beforeAll, vi } from 'vitest';
import axios from 'axios';

// the mock handlers wait 1-2s to feel like a real server; skip that in tests
vi.mock('msw', async (importOriginal) => ({
    ...(await importOriginal()),
    delay: () => Promise.resolve(),
}));

// jsdom's XMLHttpRequest turns MSW's mocked responses into "Network Error",
// so send requests through axios's Node http adapter instead (MSW intercepts that too).
// Set on the axios defaults, which every axios.create() copies, including fresh instances after vi.resetModules().
axios.defaults.adapter = 'http';

// jsdom has no ResizeObserver (TopBanner uses it)
if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
}

export const server = setupServer(...handlers)

beforeAll(()=>server.listen({onUnhandledRequest:'error'})); //fails when api call is wrong

afterEach(()=>{
    server.resetHandlers();
    cleanup();
    localStorage.clear();
    delete document.documentElement.dataset.role;
})
afterAll(()=>{
    server.close();
})

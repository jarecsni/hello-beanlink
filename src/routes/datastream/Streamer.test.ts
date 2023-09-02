// Import the necessary modules and dependencies for the testing environment
import { DataPump, Streamer } from './Streamer'; // Update the path to your module here
import type { onStreamDataHandler } from './Streamer';
import { it, expect, describe, beforeEach, afterEach, vi } from 'vitest';

// Mock the setTimeout function for testing purposes
vi.useFakeTimers();

describe('DataPump Unit Tests', () => {
    let dataPump: DataPump;

    beforeEach(() => {
        // Create a new instance of DataPump for each test
        const numbers = [1, 2, 3, 4, 5];
        const handler: onStreamDataHandler = vi.fn();
        dataPump = new DataPump('TEST_SYMBOL', numbers, handler);
    });

    afterEach(() => {
        // Clean up timers and reset index after each test
        vi.clearAllTimers();
        dataPump.stop();
    });

    it('should loop through the numbers array and call the handler with the correct number', () => {
        dataPump.start();
        vi.advanceTimersByTime(5000); // Advance the timer by 5 seconds to trigger multiple calls

        // Ensure the handler was called with the correct number
        dataPump['handler'].mock.calls.forEach((call, i) => {
            expect(call[0]).toEqual('TEST_SYMBOL');
            expect(call[1]).toEqual((i > 2 ? 0 : i) + 1);
        });
    });

    it('should stop the data pumping', () => {
        dataPump.start();
        dataPump.stop();
        expect(dataPump['handler']).toHaveBeenCalled(); // 1 data element will be pushed out
        dataPump['handler'].mockClear();

        // Ensure that the data pump does not call the handler after stopping
        vi.advanceTimersByTime(5000);
        expect(dataPump['handler']).not.toHaveBeenCalled();
    });
});

describe('Streamer Unit Tests', () => {
    let streamer: Streamer;
    const testData = {
        TEST_SYMBOL_1: [10, 20, 30],
        TEST_SYMBOL_2: [100, 200, 300],
    };

    beforeEach(() => {
        // Create a new instance of Streamer for each test
        streamer = Streamer.getInstance();
        streamer.initialise();
        streamer['data'] = testData; // Private property should be accessed this way only for testing
    });

    afterEach(() => {
        streamer.stopStreaming();
    });

    it('should connect and disconnect handlers correctly', () => {
        const handler1: onStreamDataHandler = vi.fn();
        const handler2: onStreamDataHandler = vi.fn();

        // Connect handlers to symbols
        streamer.connect('TEST_SYMBOL_1', handler1);
        streamer.connect('TEST_SYMBOL_1', handler2);
        streamer.connect('TEST_SYMBOL_2', handler1);

        // Disconnect handlers from symbols
        streamer.disconnect('TEST_SYMBOL_1', handler1);

        // Ensure handlers were added and removed correctly
        expect(streamer['handlerMap'].get('TEST_SYMBOL_1')).toEqual([handler2]);
        expect(streamer['handlerMap'].get('TEST_SYMBOL_2')).toEqual([handler1]);
    });

    it('should start and stop streaming', () => {
        const handler: onStreamDataHandler = vi.fn();

        // Connect handler and start streaming
        streamer.connect('TEST_SYMBOL_1', handler);
        streamer.startStreaming();
        vi.advanceTimersByTime(10000);

        handler.mock.calls.forEach((call, i) => {
            expect(call[0]).toEqual('TEST_SYMBOL_1');
            expect(call[1]).toEqual((i > 2 ? 0 : i) * 10 + 10);
        });

        // Stop streaming and ensure no more calls to handler
        streamer.stopStreaming();
    });

    it('should not call handlers when streaming is stopped', () => {
        const handler: onStreamDataHandler = vi.fn();

        // Connect handler, start streaming, and then stop streaming
        streamer.connect('TEST_SYMBOL_1', handler);
        streamer.startStreaming();
        streamer.stopStreaming();
        expect(handler).toHaveBeenCalled(); // startStreaming results in 1 data element pushed out
        handler.mockClear();
        vi.advanceTimersByTime(5000);

        // Ensure no calls to handler after stopping
        expect(handler).not.toHaveBeenCalled();
    });
});
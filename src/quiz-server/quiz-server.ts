import { ChildProcess, fork } from 'child_process';
import * as path from 'path';

/**
 * Manages the quiz/poll server lifecycle
 */
export class QuizServer {
    private serverProcess: ChildProcess | null = null;
    private port: number;

    constructor(port: number = 4433) {
        this.port = port;
    }

    /**
     * Start the quiz/poll server
     * @returns Promise that resolves when server is started
     */
    public async start(): Promise<void> {
        if (this.serverProcess) {
            console.log('Quiz/Poll server is already running');
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                // Point to the source file since server.js is not compiled
                const serverPath = path.join(__dirname, '../../src/quiz-server/server.js');

                // Fork the server as a child process
                this.serverProcess = fork(serverPath, [], {
                    env: { ...process.env, PORT: this.port.toString() },
                    stdio: 'pipe'
                });

                // Handle server output
                this.serverProcess.stdout?.on('data', (data) => {
                    const message = data.toString();
                    console.log(`[Quiz Server] ${message}`);

                    // Resolve when server is running
                    if (message.includes('Server running on port')) {
                        resolve();
                    }
                });

                this.serverProcess.stderr?.on('data', (data) => {
                    console.error(`[Quiz Server Error] ${data}`);
                });

                this.serverProcess.on('error', (error) => {
                    console.error('Failed to start quiz server:', error);
                    this.serverProcess = null;
                    reject(error);
                });

                this.serverProcess.on('exit', (code) => {
                    if (code !== 0) {
                        console.log(`Quiz server exited with code ${code}`);
                    }
                    this.serverProcess = null;
                });

                // Timeout if server doesn't start within 10 seconds
                setTimeout(() => {
                    if (this.serverProcess && !this.serverProcess.killed) {
                        console.log(`Quiz/Poll server starting on port ${this.port}...`);
                        resolve();
                    }
                }, 1000);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Stop the quiz/poll server
     */
    public stop(): void {
        if (this.serverProcess) {
            console.log('Stopping quiz/poll server...');
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }

    /**
     * Check if the server is running
     */
    public isRunning(): boolean {
        return this.serverProcess !== null && !this.serverProcess.killed;
    }

    /**
     * Get the server port
     */
    public getPort(): number {
        return this.port;
    }
}

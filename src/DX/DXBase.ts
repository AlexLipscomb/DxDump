import fs from 'fs';
import {DX21Voice} from './DX21.types';


/**
 * The base class for the DX family of synthesizers.
 */
export default abstract class DXBase {
    protected data: number[] | null = null;
    public voices: DX21Voice[] | null = null; // TODO other DX voices

    /**
     * Save the patch as a .syx file.
     * @param {string} p
     * @return {Promise<void>}
     */
    public save(p: string): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * Read a .syx file.
     * @param {string} p The path of the file.
     * @return {Promise<void>}
     */
    public read(p: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (p.slice(p.length - 4) !== '.syx') {
                reject(new Error('Invalid file format'));
            }

            fs.readFile(p, (err, data) => {
                if (err) reject(err);
                this.data = [...new Uint32Array(data)];
                resolve();
            });
        });
    }

    /**
     * Write a .syx file.
     * @param {string} p The path of the file.
     * @return {Promise<void>}
     */
    public write(p: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (p.slice(p.length - 4) !== '.syx') {
                reject(new Error('Invalid file format'));
            }

            // TODO Finish write()
            resolve();
        });
    }
}

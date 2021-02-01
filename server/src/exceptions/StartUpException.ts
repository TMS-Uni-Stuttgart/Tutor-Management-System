/**
 * Indicates that some exception occured during the start up routine of the server.
 */
export class StartUpException {
    constructor(readonly message: string) {}
}

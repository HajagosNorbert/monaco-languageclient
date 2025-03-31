/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference lib="WebWorker" />

import { BrowserMessageReader, BrowserMessageWriter, createConnection, TextDocumentSyncKind, type InitializeResult } from 'vscode-languageserver/browser.js';

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);

messageReader.listen((message) => {
    console.log('Received message from main thread:', message);
});

const connection = createConnection(messageReader, messageWriter);


connection.onCompletion((_a) => [{ label: 'hi' }, { label: 'there' }]);
connection.onInitialize((params: InitializeParams) => {
    connection.console.log("initing!")

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ["<", "/"],
            },

            hoverProvider: true,
        }
    };
    return result;
});

connection.onHover((s) => {
    return { contents: { value: "hihihihihi",kind:"plaintext" } }
})

// Start listening for incoming messages from the client.
connection.listen();

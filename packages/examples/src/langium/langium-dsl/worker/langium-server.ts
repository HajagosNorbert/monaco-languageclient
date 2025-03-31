/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */
/// <reference lib="WebWorker" />

import { EmptyFileSystem } from 'langium';
import { type DefaultSharedModuleContext, startLanguageServer } from 'langium/lsp';
import { createLangiumGrammarServices } from 'langium/grammar';
import { BrowserMessageReader, BrowserMessageWriter, createConnection } from 'vscode-languageserver/browser.js';

/* browser specific setup code */
const messageReader = new BrowserMessageReader(self as DedicatedWorkerGlobalScope);
const messageWriter = new BrowserMessageWriter(self as DedicatedWorkerGlobalScope);

messageReader.listen((message) => {
    console.log('Received message from main thread:', message);
});

// Inject the shared services and language-specific services
const context = {
    connection: createConnection(messageReader, messageWriter),
    ...EmptyFileSystem
} as unknown as DefaultSharedModuleContext;
const { shared } = createLangiumGrammarServices(context);

// Start the language server with the shared services
// startLanguageServer(shared);
const services = shared;
const connection = services.lsp.Connection;
if (!connection) {
    throw new Error('Starting a language server requires the languageServer.Connection service to be set.');
}

connection.onCompletion((_a) => [{ label: 'hi' }, { label: 'there' }]);
connection.onInitialize(params => {
    return services.lsp.LanguageServer.initialize(params);
});
connection.onInitialized(params => {
    services.lsp.LanguageServer.initialized(params);
});

// Make the text document manager listen on the connection for open, change and close text document events.
const documents = services.workspace.TextDocuments;
documents.listen(connection);

// Start listening for incoming messages from the client.
connection.listen();

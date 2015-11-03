/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
/**
 * The shutdown command is send from the client to the worker.
 * It is send once when the client descides to shutdown the
 * worker. The only event that is send after a shudown request
 * is the exit event.
 */
var ShutdownRequest;
(function (ShutdownRequest) {
    ShutdownRequest.type = { command: 'shutdown' };
})(ShutdownRequest = exports.ShutdownRequest || (exports.ShutdownRequest = {}));
/**
 * The exit event is send from the client to the worker to
 * ask the worker to exit its process.
 */
var ExitEvent;
(function (ExitEvent) {
    ExitEvent.type = { event: 'exit' };
})(ExitEvent = exports.ExitEvent || (exports.ExitEvent = {}));
var InitializeRequest;
(function (InitializeRequest) {
    InitializeRequest.type = { command: 'initialize' };
})(InitializeRequest = exports.InitializeRequest || (exports.InitializeRequest = {}));
/**
 * The configuration change event is send from the client to the worker
 * when the client's configuration has changed. The event contains
 * the changed configuration as defined by the language worker statically
 * in it's extension manifest.
 */
var DidChangeConfigurationEvent;
(function(DidChangeConfigurationEvent) {
  DidChangeConfigurationEvent.type = { event: 'workspace/didChangeConfiguration' };
})(DidChangeConfigurationEvent = exports.DidChangeConfigurationEvent || (exports.DidChangeConfigurationEvent = {}));
var MessageSeverity;
(function (MessageSeverity) {
    MessageSeverity.Error = 1;
    MessageSeverity.Warning = 2;
    MessageSeverity.Info = 3;
})(MessageSeverity = exports.MessageSeverity || (exports.MessageSeverity = {}));
/**
 * The show message event is send from a worker to a client to ask
 * the client to display a particular message in the user interface
 */
var ShowMessageEvent;
(function(ShowMessageEvent) {
    ShowMessageEvent.type = { event: 'shell/showMessage' };
})(ShowMessageEvent = exports.ShowMessageEvent || (exports.ShowMessageEvent = {}));
var LogMessageEvent;
(function(LogMessageEvent) {
    LogMessageEvent.type = { event: 'shell/logMessage' };
})(LogMessageEvent = exports.LogMessageEvent || (exports.LogMessageEvent = {}));
/**
 * The document event is send from the client to the worker to signal
 * newly opened, changed and closed documents.
 */
var DidOpenDocumentEvent;
(function (DidOpenDocumentEvent) {
    DidOpenDocumentEvent.type = { event: 'document/didOpen' };
})(DidOpenDocumentEvent = exports.DidOpenDocumentEvent || (exports.DidOpenDocumentEvent = {}));
var DidChangeDocumentEvent;
(function (DidChangeDocumentEvent) {
    DidChangeDocumentEvent.type = { event: 'document/didChange' };
})(DidChangeDocumentEvent = exports.DidChangeDocumentEvent || (exports.DidChangeDocumentEvent = {}));
var DidCloseDocumentEvent;
(function (DidCloseDocumentEvent) {
    DidCloseDocumentEvent.type = { event: 'document/didClose' };
})(DidCloseDocumentEvent = exports.DidCloseDocumentEvent || (exports.DidCloseDocumentEvent = {}));
/**
 */
var DidChangeFilesEvent;
(function (DidChangeFilesEvent) {
    DidChangeFilesEvent.type = { event: 'workspace/didChangeFiles' };
})(DidChangeFilesEvent = exports.DidChangeFilesEvent || (exports.DidChangeFilesEvent = {}));
var FileChangeType;
(function (FileChangeType) {
    FileChangeType.Created = 1;
    FileChangeType.Changed = 2;
    FileChangeType.Deleted = 3;
})(FileChangeType = exports.FileChangeType || (exports.FileChangeType = {}));
/**
 * Diagnostics events are send from the worker to clients to signal
 * results of validation runs
 */
var PublishDiagnosticsEvent;
(function (PublishDiagnosticsEvent) {
    PublishDiagnosticsEvent.type = { event: 'document/publishDiagnostics' };
})(PublishDiagnosticsEvent = exports.PublishDiagnosticsEvent || (exports.PublishDiagnosticsEvent = {}));
var Severity;
(function (Severity) {
    Severity.Error = 1;
    Severity.Warning = 2;
    Severity.Info = 3;
})(Severity = exports.Severity || (exports.Severity = {}));

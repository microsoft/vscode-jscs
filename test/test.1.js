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


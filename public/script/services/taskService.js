"use strict";
// TODO: All such calls to our API can be refactored to be carried out via a service.
// TODO: Better error handling?
/**
 * TaskService handles all the API requests for /api/tasks endpoint.
 */
class TaskService {
    constructor(http) {
        this._http = http;
    }
    /**
     * Submit the cairn by posting to /api/tasks/submitCairn
     * @returns response data from the request in a promise
     * */
    submitCairn(projectID, hitID, message, cairnType, progress, timeWhenCairnShownToPlayer, timeCairnSubmitted, taskName) {
        const url = `${TaskService.BASE_URL}/submitCairn`;
        const body = {
            projectID,
            hitID,
            message,
            cairnType,
            progress,
            timeWhenCairnShownToPlayer,
            timeCairnSubmitted,
            taskName,
        };
        return new Promise((resolve, reject) => this._http
            .post(url, body)
            .then((data) => resolve(data.data))
            .catch((err) => reject(err)));
    }
    /**
     * Queries /api/tasks/getresponsecount and returns the count data.
     */
    getResponseCount(projectID, taskID, option) {
        const url = `${TaskService.BASE_URL}/getresponsecount`;
        const config = {
            params: {
                projectID,
                taskID,
                option,
            },
        };
        return new Promise((resolve, reject) => this._http
            .get(url, config)
            .then((data) => resolve(data.data))
            .catch((err) => {
            console.error("Couldn't fetch the response count " + err.message);
            reject(err);
        }));
    }
    /**
     * Flags an image by posting to /api/tasks/flagimage
     * @returns whether the image was successfully flagged.
     */
    flagImage(projectID, taskID) {
        const url = `${TaskService.BASE_URL}/flagimage`;
        const body = {
            projectID,
            taskID,
        };
        return new Promise((resolve, reject) => this._http
            .post(url, body)
            .then((data) => resolve(true))
            .catch((err) => reject(err)));
    }
    /**
     * gets the cairns by posting to /api/tasks/getCairns
     * @returns the response data else null if there is an error
     */
    getCairns(body) {
        const url = `${TaskService.BASE_URL}/getCairns`;
        return new Promise((resolve, reject) => this._http
            .post(url, body)
            .then((data) => resolve(data.data))
            .catch((err) => reject(err)));
    }
    /**
     * Gets the next task. If loop is set to true, we will fetch looped tasks.
     * @param loop if true, we hit the /gettaskloop endpoint, else /gettask.
     * @returns response data from the api call.
     */
    getTask(code, loop = false) {
        let url = TaskService.BASE_URL;
        url += loop ? `/gettaskloop` : `/gettask`;
        url += `/${code}`;
        return new Promise((resolve, reject) => this._http.get(url).then((data) => resolve(data.data)));
    }
    submit(body) {
        const url = `${TaskService.BASE_URL}/submit`;
        return new Promise((resolve, reject) => this._http
            .post(url, body)
            .then((data) => resolve(data.data))
            .catch((err) => reject(err)));
    }
    /**
     * Gets the task info by calling /api/tasks/getInfo/{code}
     *
     * @returns the task info data
     */
    getInfo(code) {
        if (!code)
            return null;
        const url = `${TaskService.BASE_URL}/getInfo/${code}`;
        return new Promise((resolve, reject) => this._http
            .get(url)
            .then((data) => resolve(data.data))
            .catch((err) => reject(err)));
    }
    /**
     * Saves the params by posting to /api/tasks/saveParams endpoint.
     * @param workerID workerID for the participant
     * @param params JS object containing the params to be saved
     * @returns response data
     */
    saveParams(workerID, params) {
        const url = `${TaskService.BASE_URL}/saveParams`;
        const body = {
            workerID,
            params,
        };
        return new Promise((resolve, reject) => this._http
            .post(url, body)
            .then((data) => resolve(data.data))
            .catch((err) => reject(err)));
    }
}
TaskService.BASE_URL = "/api/tasks";

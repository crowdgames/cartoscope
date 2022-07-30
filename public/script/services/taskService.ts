// TODO: All such calls to our API can be refactored to be carried out via a service.

// TODO: Better error handling?

/**
 * TaskService handles all the API requests for /api/tasks endpoint.
 */
class TaskService {
  private _http: any; //TODO figure out the type of $http
  private static BASE_URL = "/api/tasks";

  public constructor(http: any) {
    this._http = http;
  }

  /**
   * Submit the cairn by posting to /api/tasks/submitCairn
   * @returns response from the request
   * */
  public submitCairn(
    projectID: string,
    hitID: string,
    message: string,
    cairnType: string,
    progress: number,
    timeWhenCairnShownToPlayer: any,
    timeCairnSubmitted: any,
    taskName: string
  ): any {
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

    const response = this._http
      .post(url, body)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }

  /**
   * Queries /api/tasks/getresponsecount and returns the count data. returns null if we encounter any errors.
   */
  public getResponseCount(
    projectID: string,
    taskID: string,
    option: number
  ): any {
    const url = `${TaskService.BASE_URL}/getresponsecount`;

    const config = {
      params: {
        projectID,
        taskID,
        option,
      },
    };

    const data = this._http
      .get(url, config)
      .then((data) => data.data)
      .catch((err) => {
        console.error("Couldn't fetch the response count " + err.message);
        return null;
      });

    return data;
  }

  /**
   * Flags an image by posting to /api/tasks/flagimage
   * @returns whether the image was successfully flagged.
   */
  public flagImage(projectID: string, taskID: string): boolean {
    const url = `${TaskService.BASE_URL}/flagimage`;

    const body = {
      projectID,
      taskID,
    };

    const response = this._http
      .post(url, body)
      .then((data) => true)
      .catch((err) => false);

    return response;
  }

  /**
   * gets the cairns by posting to /api/tasks/getCairns
   * @returns the response data else null if there is an error
   */
  public getCairns(body: IGetCairnsBody): any {
    const url = `${TaskService.BASE_URL}/getCairns`;

    const response = this._http
      .post(url, body)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }

  /**
   * Gets the next task. If loop is set to true, we will fetch looped tasks.
   * @param loop if true, we hit the /gettaskloop endpoint, else /gettask.
   * @returns response data from the api call. In case of an error, returns null.
   */
  public getTask(code: string, loop: boolean = false) {
    let url = TaskService.BASE_URL;

    url += loop ? `/gettaskloop` : `/gettask`;
    url += `/${code}`;

    const response = this._http
      .get(url)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }

  public submit(body: ISubmitTaskBody): any {
    const url = `${TaskService.BASE_URL}/submit`;

    const response = this._http
      .post(url, body)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }

  /**
   * Gets the task info by calling /api/tasks/getInfo/{code}
   * 
   * @returns the task info data or null if there was an error.
   */
  public getInfo(code: string): any {
    if (!code) return null;

    const url = `${TaskService.BASE_URL}/getInfo/${code}`;

    const response = this._http
      .get(url)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }

  /**
   * Saves the params by posting to /api/tasks/saveParams endpoint.
   * @param workerID workerID for the participant
   * @param params JS object containing the params to be saved
   * @returns response data or null if there was an error
   */
  public saveParams(workerID: string, params: any): any {
    const url = `${TaskService.BASE_URL}/saveParams`;

    const body = {
      workerID,
      params,
    };
    const response = this._http
      .post(url, body)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }
}

interface IGetCairnsBody {
  projectID: string;
  cairnType: CairnType;
  numberRequested?: number;
  random?: boolean;
}

interface ISubmitTaskBody {
  projectID: string;
  option: number;
  taskID: { name: string };
  mapCenterLat: number;
  mapCenterLon: number;
  multiple?: number;
  option_text?: string;
}

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
      .catch((err) => false);

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
  public getCairns(
    projectID: string,
    cairnType: string,
    numberRequested: number,
    random: boolean
  ): any {
    const url = `${TaskService.BASE_URL}/getCairns`;

    const body = {
      projectID,
      cairnType,
      numberRequested,
      random,
    };

    const response = this._http
      .post(url, body)
      .then((data) => data.data)
      .catch((err) => null);

    return response;
  }
}

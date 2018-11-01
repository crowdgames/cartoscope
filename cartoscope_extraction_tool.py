import os,random,sys,glob,csv,string,json
import mysql.connector
import pandas as pd


# executes query and returns results as a dataframe
def execute_mysql_query(query):
    #Connect to db
    print("Connecting to DB...")
    mydb = mysql.connector.connect(
      host="localhost",
      user=os.environ['CARTO_DB_USER'],
      passwd=os.environ['CARTO_DB_PASSWORD'],
      database=os.environ['CARTO_DB_NAME']
    )
    return(pd.read_sql_query(query,con=mydb))


# get survey results by HITID (tlx survey)
def get_survey_resultsTLX(HITID):
    q_string = """ SELECT m.workerID, m.assignmentID, m.hitID,
    json_extract(a.response, \'$.why_text\') AS why_text,
    json_extract(a.response, \'$.tech_diff\') AS tech_diff,
    json_extract(a.response, \'$.tech_diff_text\') AS tech_diff_text,
    json_extract(a.response, \'$.additional_feedback\') AS additional_feedback,
    json_extract(a.response, \'$.instructions_ckb\') AS instructions_ckb,
    json_extract(a.response, \'$.paid_ckb\') AS paid_ckb,
    json_extract(a.response, \'$.reject_ckb\') AS reject_ckb,
    json_extract(a.response, \'$.why_more\') AS why_more,
    json_extract(a.response, \'$.pref_interface\') AS pref_interface,
    json_extract(a.response, \'$.pref_interface_text\') AS pref_interface_text,
    json_extract(a.response, \'$.map_diff\') AS map_diff,
    json_extract(a.response, \'$.map_diff_text\') AS map_diff_text,
    json_extract(a.response, \'$.image_desc\') AS image_desc,
    json_extract(a.response, \'$.image_location\') AS image_location,
    json_extract(a.response, \'$.mental\') AS mental,
    json_extract(a.response, \'$.physical\') AS physical,
    json_extract(a.response, \'$.temporal\') AS temporal,
    json_extract(a.response, \'$.performance\') AS performance,
    json_extract(a.response, \'$.effort\') AS effort,
    json_extract(a.response, \'$.frustration\') AS frustration
    FROM survey as a left join mturk_workers as m on m.workerID=a.user_id
    WHERE  m.hitID=\'{}\' ORDER BY (CASE WHEN a.response IS NULL then 1 ELSE 0 END) """.format(HITID)
    return(execute_mysql_query(q_string))


# get the votes given specific HIT and project list
#TODO: MARKER TASK HAS TO BE IFELSE
def get_votes_results(HITID,projects_info):

    code_votes = [];
    for index, row in projects_info.iterrows():
        code = row["unique_code"]
        dataset_id = row["dataset_id"]
        project_id = row["project_id"]
        print("Extracting data for code " + code )
        q_string = """select distinct r.task_id,r.center_lat, r.center_lon, r.timestamp, pr.id as workerid, p.unique_code,
                      IF(response = -1 , \"dummy\", JSON_EXTRACT(p.template, CONCAT(\'$.options[\', r.response, \'].text\'))) as answer,
                      JSON_EXTRACT(p.template, \'$.question\') as question, r.response,
                      d.x ,d.y,
                      m.hitID,m.projectID,m.genetic_id,
                      q.seq, q.label_project,q.map_project,q.marker_project,q.progress_type,q.method,q.generated_from
                      from response as r
                      left join projects as p
                      on r.project_id=p.id
                      left join progress as pr
                      on pr.id = r.user_id and pr.project_id=p.id
                      left join mturk_workers as m
                      on m.workerID=pr.id
                      left join dataset_{} as d
                      on r.task_id=d.name
                      left join task_genetic_sequences as q
                      on q.id=m.genetic_id
                      where hitID=\'{}\' and unique_code=\'{}\'
 """.format(dataset_id,HITID,code)
        u_votes = execute_mysql_query(q_string)
        print("Total votes: " + str(len(u_votes.index)))
        code_votes.append(u_votes)
    return(pd.concat(code_votes))


# get all project codes
def get_all_projects(HITID):
    q_string = """select distinct q.project_id, p.unique_code, p.dataset_id, m.hitID
                  from progress as q
                  left join projects as p
                  on q.project_id=p.id
                  left join mturk_workers as m
                  on m.workerID=q.id
                  where hitID=\'{}\'""".format(HITID)
    return(execute_mysql_query(q_string))


def write_json_to_csv(file,data):
    pd.read_json(data).to_csv()

if __name__ == '__main__':

    #main folder to keep data
    DIR = "../mturk_data/mturk_data"
    if os.path.isdir(DIR) == False:
        os.mkdir(DIR)


    #get the arguments from cmd
    options = sys.argv

    if len(options) == 1:
        print("Usage: python cartoscope_extraction_tool <hit_id> ")
        print("-genetic: export genetic information on tasks as well")
    else:
        hit_id = options[1]
        #Makedir if not already there

        folder = os.path.join(DIR,hit_id)
        if os.path.isdir(folder) == False:
            os.mkdir(folder)

        #get all project involved in the HIT from worker metadata
        project_info = get_all_projects(hit_id)
        print(project_info)
        project_info_file = os.path.join(DIR,hit_id,hit_id+"_project_info.csv")
        project_info.to_csv(project_info_file)

        #get survey results for the hit_id
        survey_results = get_survey_resultsTLX(hit_id)
        #write to csv
        survey_file = os.path.join(DIR,hit_id,hit_id+"_survey.csv")
        survey_results.to_csv(survey_file)
        #get votes:
        total_votes = get_votes_results(hit_id,project_info)
        votes_file = os.path.join(DIR,hit_id,hit_id+"_votes_full.csv")
        total_votes.to_csv(votes_file)

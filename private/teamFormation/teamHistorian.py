# Module for methods pertaining to the Team History matrix/adjacency management
import pprint

# sets up the adjacency matrix that acts as teammate history
def initTeamHistory(participants):
    teamHistory = {}
    for participant in participants:
        teamHistory[participant] = {}
        for other_participant in participants:
            if other_participant != participant:
                teamHistory[participant][other_participant] = 0
    return teamHistory

# using the pre-built teamHistory dict and database access, we use the previous activity history of the participants to build a adjacency matrix
def buildTeamHistory(db, previous_activities, participants):
    teamHistory = initTeamHistory(participants)
    users = db['dynamic-users']
    teams = db['teams']
    for participant in participants:
        curr_user = users.find_one({"pid": participant})
        prev_teams = []
        for prev_act in previous_activities: # get the teams the user was a part of from the older activities
            user_th = curr_user['teamHistory']
            for past_team in user_th: # FIXME: this is slow af
                if 'activity_id' not in past_team: # handling older, out of date database docs
                    continue
                if past_team['activity_id'] == prev_act: # once we find the activity we of interest, we dip
                    prev_teams.append(past_team['team'])
                    break 
        for team in prev_teams: # update the teamHistory matrix based on the old teams
            teammates = teams.find_one({"_id": team})['members']
            for teammate_obj in teammates:
                teammate = teammate_obj['pid']
                if (teammate != participant): # a user shouldn't have a count for themselves
                    if teammate not in teamHistory[participant]:
                        teamHistory[participant][teammate] = 1
                    else: 
                        teamHistory[participant][teammate] = teamHistory[participant][teammate] + 1
        #pprint.pprint(teamHistory[participant])   

    return teamHistory
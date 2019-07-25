# script to create teams
import os, sys
import numpy as np
import random
import pymongo
from pymongo import MongoClient
import pprint
import time
import teamFormer as tf
import teamHistorian as th

# Some constants
MIN_REQUIRED_PPL = 6


# set up the colors that the teams will use
def buildColoredShapes(colored_shapes):
    shapes = np.array(
        ['circle', 'plus', 'moon', 'square', 'star', 'heart', 'triangle'])
    shapeColors = np.array(['blue', 'purple', 'green', 'yellow', 'red'])

    for shape in shapes:
        for color in shapeColors:
            colored_shapes.append((shape, color))

    np.random.shuffle(colored_shapes)


# using session_id, access the database and get the activities that occured prior to the current one
def getPrevActivities(db, session_id, current_activity_id):
    sessions = db['sessions']
    curr_session = sessions.find_one({"_id": session_id})
    activities = curr_session['activities']
    prev_acts = []
    for act in activities:
        if (act == current_activity_id):
            break
        prev_acts.append(act)
    return prev_acts


# main function that directs the team formation. Needs session_id, activity_id, participants
def main(args):
    # parse command line args
    sess_id = sys.argv[1]
    act_id = sys.argv[2]
    participants = np.array(sys.argv[3].split(','))

    # connect to the database, get the necessary collections
    # client = MongoClient(
    #     'mongodb://python:python3@ds059634.mlab.com:59634/heroku_wv2vnn66'
    # )  # TODO: hide these credentials
    # db = client.heroku_wv2vnn66
    client = MongoClient('mongodb://127.0.0.1:3001/meteor')
    db = client.meteor

    # set up the colored shapes for the teams collection insertion
    colored_shapes = []
    buildColoredShapes(colored_shapes)

    # build the teams
    previous_activities = getPrevActivities(db, sess_id, act_id)
    if not previous_activities:  # this is the first round of team-formation
        print("First Round")
        next_teams = tf.firstRoundGroups(participants)
    elif participants.size < MIN_REQUIRED_PPL:
        print("Small size, still random")
        next_teams = tf.firstRoundGroups(
            participants)  # not big enough to ensure new people
    else:
        print("Graph Problem")
        teamHistory = th.buildTeamHistory(db, previous_activities,
                                          participants)
        next_teams = tf.brute_force_unique_groups(participants, teamHistory)

    # build the team objects to be inserted into the db
    teams_to_insert = []
    pprint.pprint(next_teams)
    for idx, team in enumerate(next_teams):
        member_list = []
        for user in team:
            member_list.append({"pid": user, "confirmed": False})
        teams_to_insert.append({
            'activity_id': act_id,
            'teamCreated': int(time.time()),
            'members': member_list,
            'color': colored_shapes[idx][1],
            'shape': colored_shapes[idx][0],
            'teamNumber': idx,
            'responses': [],
        })

    # insert the teams into the teams collection
    teams = db['teams']
    inserted_teams = teams.insert_many(teams_to_insert)
    team_ids = inserted_teams.inserted_ids

    # update the teamHistory for each of the users
    users = db['dynamic-users']
    # pprint.pprint(team_ids)
    for idx, team_id in enumerate(team_ids):
        team_ids[idx] = str(team_id)
        # print(next_teams[idx])
        for member in next_teams[idx]:
            # print(member)
            users.update_one({"pid": member}, {
                "$push": {
                    "teamHistory": {
                        "team": team_ids[idx],
                        "activity_id": act_id
                    }
                }
            })

    # pprint.pprint(team_ids)
    # update the activity collection to have these teams saved
    db['activities'].update_one({'_id': act_id}, {
        '$set': {
            'statusStartTimes.teamForm': int(time.time()),
            'teams': team_ids,
            'allTeamsFound': False
        }
    })

    # if we get here, we're good
    sys.exit(0)


# expects something along these lines:
#   python form_teams.py session_id activity_id <participant1,participant2,...>
if __name__ == "__main__":
    main(sys.argv[1:])
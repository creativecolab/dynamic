# Module to Produce Teams for the Prototeams Web-App
import numpy as np
import random
import heapq as pq
import math
import pprint
import teamFormerHelper as tfh

#Some constants
MAX_TEAM_SIZE = 3
NUM_PARTICIPANTS = 62


#first round, just group people up. Gonna be a 2D numpy array if NUM_PARTICIPANTS is a multiple of 3, gonne be a list of arrays otherwise
def firstRoundGroups(participants):
    np.random.shuffle(participants)
    if (participants.size < MAX_TEAM_SIZE):  # evil number
        return (np.array([participants]))
    if (participants.size % MAX_TEAM_SIZE == 0):
        return np.reshape(
            participants,
            (int(participants.size / MAX_TEAM_SIZE), MAX_TEAM_SIZE))
    if (participants.size == 5):  # evil number
        return (np.array([participants[:3], participants[3:]]))
    return np.array(
        np.array_split(participants, participants.size / MAX_TEAM_SIZE))


# produce unique groups by simply choosing people that each person hasn't worked with before
def brute_force_unique_groups(participants, teamHistory):
    # set up
    new_groups = np.zeros(
        (math.floor(participants.size / MAX_TEAM_SIZE), MAX_TEAM_SIZE),
        dtype="object")
    ungrouped = np.array(participants)
    np.random.shuffle(ungrouped)
    groupNum = 0

    # repeat until all groups formed
    while groupNum < (math.floor(participants.size / MAX_TEAM_SIZE)):
        # remove the person from the ungrouped array and start a group with them
        new_group = [ungrouped[0]]
        ungrouped = np.delete(ungrouped, np.where(ungrouped == ungrouped[0]))

        # find someone to be in the group with them
        for _ in range(1, MAX_TEAM_SIZE):
            potential_partners = tfh.optimalTeammateQueue(
                new_group, ungrouped, teamHistory)
            new_groupmate = pq.heappop(potential_partners)
            new_group.append(new_groupmate[1])
            ungrouped = np.delete(ungrouped,
                                  np.where(ungrouped == new_groupmate[1]))
        new_groups[groupNum] = (new_group)
        groupNum = groupNum + 1

    # list of where to add the leftover people
    add_positions = []

    pprint.pprint(new_groups)

    # handle cases where groups are not even
    while ungrouped.size > 0:
        # print(ungrouped)
        # remove a leftover person
        leftover_person = ungrouped[0]
        ungrouped = np.delete(ungrouped,
                              np.where(ungrouped == leftover_person))

        # rank the most compatible teams for this leftover person and choose the best one
        teams_ranked = tfh.optimalTeamQueue(leftover_person, new_groups,
                                            add_positions, teamHistory)
        # pprint.pprint(teams_ranked)
        best_ranked_team = pq.heappop(teams_ranked)
        best_team = np.array(best_ranked_team[1].split(','))

        # find where to add the leftover people
        for groupNum, team in enumerate(new_groups):
            if (np.array_equal(team, best_team)):
                add_positions.append([leftover_person, groupNum])
                break  # once we find where we need to add, we can jump out
        # print(add_positions)

    # set up the groups to be able to be modified
    # pprint.pprint(new_groups)
    flattened_groups = new_groups.flatten()
    temp_new_groups = np.array_split(flattened_groups, participants.size /
                                     MAX_TEAM_SIZE)  # turn into mutable list
    # pprint.pprint(temp_new_groups)

    # add the leftover people
    for leftover in add_positions:
        # print(leftover)
        # print(temp_new_groups[leftover[1]])
        temp_new_groups[leftover[1]] = np.append(temp_new_groups[leftover[1]],
                                                 leftover[0])
        # print(temp_new_groups[leftover[1]])

    # update the new groups
    new_groups = np.array(temp_new_groups)

    return new_groups

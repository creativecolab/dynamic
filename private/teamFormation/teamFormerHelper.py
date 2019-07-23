# Module for some helper methods pertaining to Team Formation
import heapq as pq

# helper method to update our teamHistory tracking
def updateTeamHistory(groups, teamHistory):
    # for each group
    for i in range(0, len(groups)):
        # for each member of the group
        for j in range(0, len(groups[i])):
            # for each groupmate of that member of the group
            for k in range(0, len(groups[i])):
                if (groups[i][j] != groups[i][k]):
                    if groups[i][k] not in teamHistory[groups[i][j]]:
                        teamHistory[groups[i][j]][groups[i][k]] = 1
                    else: 
                        teamHistory[groups[i][j]][groups[i][k]] = teamHistory[groups[i][j]][groups[i][k]] + 1
    return

# helper method to find the best team for this leftover person to join
def optimalTeamQueue(person, teams, full_teams, teamHistory):
    groupmate_queue = []
    in_team_history = {}
    # pq of teams
    person_group_history = teamHistory[str(person)]

    # check each team
    for idx, team in enumerate(teams):
            
        # can't add into teams that will be of size 4 
        team_unavailable = False
        for positions in full_teams:
            if idx==positions[1]:
                team_unavailable = True
                break
        if team_unavailable:
            continue
        

        # build up the string to represent this team as a key   
        team_str = ""
        for other_people in team:
            team_str = team_str + other_people + ","
        team_str = team_str[:-1]
        
        # get the weights of each person in this team
        for other_people in team:
            if team_str not in in_team_history:
                in_team_history[team_str] = person_group_history[other_people]
            else: 
                in_team_history[team_str] = in_team_history[team_str] + person_group_history[other_people]

    # update the queue
    for k,v in in_team_history.items():
            pq.heappush(groupmate_queue, (v,k))  
            
    return groupmate_queue
  
# helper method to produce a priority queue to find the least recently worked with teammate for a person/people    
def optimalTeammateQueue(in_team, not_in_team, teamHistory):
    groupmate_queue = []
    in_team_history = {}
       
    # pq of single users
    for person in in_team:
        person_group_history = teamHistory[str(person)]
        
        # get the weights of each person
        for other_people in not_in_team:
            if other_people not in in_team_history:
                in_team_history[other_people] = person_group_history[other_people]
            else: 
                in_team_history[other_people] = in_team_history[other_people] + person_group_history[other_people]
                
    # build the priority queue based on the weights of the other people
    for k,v in in_team_history.items():
        pq.heappush(groupmate_queue, (v,k))
            
    return groupmate_queue
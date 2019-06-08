import argparse, csv, random, sys

parser = argparse.ArgumentParser(description='Test data.')
parser.add_argument('filename', type=str, help='CSV filename')
args = parser.parse_args()

LOOKUP = {
    '44_RB_C4_M0': 'E',
    '55_TeNoTeG_C8_M0': 'M',
    '66_BrNoBrG_C12_M0': 'H'
    }


LOOKUP_REV = {
    'E': '44_RB_C4_M0',
    'M':'55_TeNoTeG_C8_M0' ,
    'H':'66_BrNoBrG_C12_M0'
    }

ACTIONS = ['E', 'M', 'H']


_rewards = {}
for action in ACTIONS:
    _rewards[action] = []


trajs = []
with open(args.filename, 'rt') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        seq = [LOOKUP[e] for e in row['seq'].split('-')]
        reward = [int(e) for e in row['reward'].split('-')]
        traj = list(zip(seq, reward))
        trajs.append(traj)

        _rewards[seq[0]].append(sum(reward))



for action in ACTIONS:
    rew = sorted(_rewards[action])
    median = rew[len(rew) // 2]
    mean = sum(rew) / len(rew)
    #print(action, median, mean)



STATE_LEN = 3
Q = {}


for ii in range(300000):
    traj = trajs[random.randint(0, len(trajs) - 1)]
    pt = random.randint(0, len(traj) - 1)
    example = traj[max(0, pt - STATE_LEN):pt + 1]

    state = ''.join([e[0] for e in example[:-1]])
    action, value = example[-1]

    if pt == len(traj) - 1:
        next_state = 'X'
    else:
        next_state = (state + action)[-STATE_LEN:]

    #print(example, state, action, value, next_state)

    key = (state, action)

    if key not in Q:
        Q[key] = 0.0

    max_next_Q = -99.0
    for try_act in ACTIONS:
        try_key = (next_state, try_act)
        try_Q = 0.0
        if try_key in Q:
            try_Q = Q[try_key]
        max_next_Q = max(max_next_Q, try_Q)

    ALPHA = 0.001
    LAMBDA = 0.95

    Q[key] = (1.0 - ALPHA) * Q[key] + ALPHA * (value + LAMBDA * max_next_Q)

import pprint
#pprint.pprint(Q)


from numpy.random import choice

#print("Generating optimal")

if True:
    path = ''

    for ii in xrange(20):

        state = path
        if len(state) > STATE_LEN:
            state = state[-STATE_LEN:]
        max_act, max_Q = None, -99.0
        #pick weighted instead of max
        pick_w = []
        pick_act = []
        norm_w = 0
        for try_act in ACTIONS:
            try_key = (state, try_act)
            try_Q = 0.0
            if try_key in Q:
                try_Q = Q[try_key]
                norm_w += try_Q
                pick_w.append(try_Q)
                pick_act.append(try_act)
        #normalize weights of choices
        pick_w[:] = [x / norm_w for x in pick_w]
        max_act = choice(pick_act, 1, p=pick_w)
        path = path + max_act[0]

    #print path
rev_arr = []
for e in path:
    rev_arr.append(LOOKUP_REV[e])
print('-'.join(rev_arr))
sys.stdout.flush()

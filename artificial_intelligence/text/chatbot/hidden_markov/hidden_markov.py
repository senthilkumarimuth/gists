import numpy as np


class HiddenMarkovModel:
    def __init__(self, states, observations, initial_prob, transition_prob, emission_prob):
        self.states = states
        self.observations = observations
        self.initial_prob = initial_prob
        self.transition_prob = transition_prob
        self.emission_prob = emission_prob

    def predict_intent(self, observations):
        # Initialize variables
        T = len(observations)
        N = len(self.states)
        delta = np.zeros((T, N))
        psi = np.zeros((T, N), dtype=int)

        # Initialization
        for i in range(N):
            delta[0, i] = self.initial_prob[i] * self.emission_prob[i][observations[0]]

        # Recursion
        for t in range(1, T):
            for j in range(N):
                delta[t, j] = np.max(delta[t - 1] * self.transition_prob[:, j]) * self.emission_prob[j][observations[t]]
                psi[t, j] = np.argmax(delta[t - 1] * self.transition_prob[:, j])

        # Termination
        max_prob = np.max(delta[T - 1])
        state_seq = [np.argmax(delta[T - 1])]

        # Backtracking
        for t in range(T - 2, -1, -1):
            state_seq.insert(0, psi[t + 1, state_seq[0]])

        return self.states[state_seq[0]]


# Example intents and observations
states = ["greeting", "goodbye", "thanks"]
observations = ["hi", "hello", "hey", "bye", "goodbye", "see", "you", "later", "thanks", "thank", "you"]

# Initial probabilities
initial_prob = np.array([0.3, 0.3, 0.4])

# Transition probabilities
transition_prob = np.array([
    [0.6, 0.2, 0.2],
    [0.2, 0.6, 0.2],
    [0.2, 0.2, 0.6]
])

# Emission probabilities
emission_prob = np.array([
    [0.5, 0.25, 0.25, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0.5, 0.25, 0.25, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.25, 0.25]
])

# Create and train the Hidden Markov Model
hmm = HiddenMarkovModel(states, observations, initial_prob, transition_prob, emission_prob)

# Test the model
observations = [0, 1, 2]  # Observation sequence: "hi", "hello", "hey"
predicted_intent = hmm.predict_intent(observations)
print("Predicted Intent:", predicted_intent)

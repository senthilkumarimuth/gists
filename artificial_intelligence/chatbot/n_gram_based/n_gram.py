from collections import defaultdict


def train_model(intents):
    # Initialize dictionaries to store n-grams for each intent
    intent_ngrams = defaultdict(lambda: defaultdict(int))

    # Count n-grams for each intent
    for intent, examples in intents.items():
        for example in examples:
            words = example.lower().split()
            for i in range(len(words) - 1):
                intent_ngrams[intent][(words[i], words[i + 1])] += 1

    return intent_ngrams


def predict_intent(message, intent_ngrams):
    words = message.lower().split()
    max_prob = 0
    predicted_intent = None

    # Calculate probability for each intent based on n-grams
    for intent, ngrams in intent_ngrams.items():
        prob = 1
        for i in range(len(words) - 1):
            prob *= (ngrams.get((words[i], words[i + 1]), 0) + 1) / (sum(ngrams.values()) + len(ngrams))
        if prob > max_prob:
            max_prob = prob
            predicted_intent = intent

    return predicted_intent


# Example intents and examples
intents = {
    "greeting": ["hi there", "hello", "hey"],
    "goodbye": ["bye", "see you later", "goodbye"],
    "thanks": ["thanks", "thank you", "appreciate it"]
}

# Train the model
intent_ngrams = train_model(intents)

# Test the model
message = "Hello, how are you?"
predicted_intent = predict_intent(message, intent_ngrams)
print("Predicted Intent:", predicted_intent)

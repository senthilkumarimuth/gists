import spacy
# from spacy.pipeline.ner import DEFAULT_NER_MODEL
# config = {
#    "moves": None,
#    "update_with_oracle_cut_size": 100,
#    "model": DEFAULT_NER_MODEL,
#    "incorrect_spans_key": "incorrect_spans",
# }
# nlp = spacy.load('en_core_web_sm')
# doc = nlp('he spoke a lot about his company TCS, but his salary is low')
# # Extract named entities
# for ent in doc.ents:
#     print(ent.text, ent.label_)


import spacy
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.svm import SVC
from sklearn.pipeline import Pipeline

# Example training data (input text and intents)
train_data = [
    ("What's the weather like today?", "weather"),
    ("How do I get to the nearest cafe?", "directions"),
    ("Tell me a joke", "joke")
]

# Extract input text and intents
X_train, y_train = zip(*train_data)

# Define a text classification pipeline
text_clf = Pipeline([
    ("vect", CountVectorizer()),  # Convert text data into numerical features
    ("clf", SVC(kernel="linear"))  # Linear SVM classifier
])

# Train the text classification model
text_clf.fit(X_train, y_train)

# Load the pre-trained English language model
nlp = spacy.load("en_core_web_sm")

# Process input text and predict intent
def predict_intent(text):
    # Tokenize and preprocess input text
    tokens = [token.text for token in nlp(text)]
    preprocessed_text = " ".join(tokens)

    # Predict intent using the trained text classification model
    intent = text_clf.predict([preprocessed_text])[0]
    return intent

# Example usage
input_text = "What's the weather forecast for tomorrow?"
predicted_intent = predict_intent(input_text)
print("Predicted Intent:", predicted_intent)

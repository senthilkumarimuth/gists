from transformers import pipeline

pipe = pipeline(model="facebook/bart-large-mnli")
r = pipe('i want to predict stock prices', candidate_labels=['cnn', 'llm', 'nlp','transformers', 'artificial intelligence', 'machine learning',
                                       'natural language processing', 'computer vision', 'deep learning', 'data science',
                                       'data mining', 'data analysis', 'data visualization', 'data engineering',
                                       'data analytics', 'time series', 'statistics', 'mathematics', 'probability',
                                       'recurrent neural networks', 'convolutional neural networks', 'neural networks',
                                        'deep neural networks', 'neural network'])
print(r)
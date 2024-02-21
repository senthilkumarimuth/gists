from setfit import SetFitModel

model = SetFitModel.from_pretrained("output/", local_files_only=True)

sentiment_dict = {"non-ml": 0, "ml": 1}
inverse_dict = {value: key for (key, value) in sentiment_dict.items()}

# Run inference
text_list = [
    "i loved the spiderman movie!",
    "pineapple on pizza is the worst",
    "what the hell is this piece",
    "good morning, lady boss",
    "the product is excellent",
    "a piece of rubbish"
]

preds = model(text_list).tolist()

for i in range(len(text_list)):
    print(text_list[i])
    print(inverse_dict[preds[i]])
    print('\n')
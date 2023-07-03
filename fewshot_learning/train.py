from datasets import load_dataset
from sentence_transformers.losses import CosineSimilarityLoss

from setfit import SetFitModel, SetFitTrainer, sample_dataset

# load custom datasets
print('loading dataset')
dataset = load_dataset('csv', data_files={
    'train': ['train.csv'],
    'eval': ['eval.csv']},
    )
print('dataset is loaded..')
# Load a SetFit model from Hub
model = SetFitModel.from_pretrained(
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    cache_dir="./models/"
)
print('pretrained model is loaded')
# Create trainer
trainer = SetFitTrainer(
    model=model,
    train_dataset=dataset['train'],
    eval_dataset=dataset['eval'],
    loss_class=CosineSimilarityLoss,
    metric="accuracy",
    batch_size=8,
    num_iterations=20,  # The number of text pairs to generate for contrastive learning
    num_epochs=5,  # The number of epochs to use for contrastive learning
    column_mapping={"text": "text", "label": "label"}  # Map dataset columns to text/label expected by trainer
)

# Train and evaluate
print('Training in progress')
trainer.train()
print('Evaluation in progress')
metrics = trainer.evaluate()

# save
trainer.model._save_pretrained(save_directory="./output/")
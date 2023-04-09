import pandas as pd
import numpy as np
import io
import cv2
from sklearn.model_selection import train_test_split
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.applications.resnet import ResNet50
import matplotlib.pyplot as plt
from keras.layers import MaxPooling2D

# read dataset

with open("CSV_datasetsix_vowel_dataset_with_class_2.csv", "r") as f:
    data_str = f.read()


df = pd.read_csv(io.StringIO(data_str), delimiter=',')
pix=[]
for i in range(784):
    pix.append('pixel'+str(i))
features=pix

X = df.loc[:, features].values
y = df.loc[:,'class'].values
print(X.size)
print('###')
print(y.size)


# Step 2: Split the data into training, validation, and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.75, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.25, random_state=42)

# Step 3: Convert the pixelated data into image format
print(X_train.shape)

def reshape_3channel(img):
    """
    Reshape and make 1 channel to 3 channel

    :param img: imag array
    :return:
    """
    return cv2.cvtColor(cv2.resize(img.astype(np.uint8), (32,32), interpolation = cv2.INTER_AREA),cv2.COLOR_GRAY2BGR)

X_train_images = X_train.reshape(X_train.shape[0],28, 28,1)
X_train_images = np.array([reshape_3channel(img) for img in X_train_images])
X_val_images = X_val.reshape(X_val.shape[0], 28, 28, 1)
X_val_images = np.array([reshape_3channel(img) for img in X_val_images])
X_test_images = X_test.reshape(X_test.shape[0], 28, 28, 1)
X_test_images = np.array([reshape_3channel(img) for img in X_test_images])


# Visualize image
cv2.imwrite('someimage.jpg', X_train_images[1])


# Step 4: Normalize the pixel values of the images
X_train_images = X_train_images / 255.0
X_val_images = X_val_images / 255.0
X_test_images = X_test_images / 255.0

# Step 5: Compile the ResNet model
model = ResNet50(input_shape=(32, 32, 3), include_top= False, classes=6) # it accepts min 32 size and 3 channel
model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

print('inputshape', X_train_images.shape)
print('outputshape', y_train.shape)

# Step 6: Train the ResNet model
history = model.fit(X_train_images, y_train,
                    batch_size=32, epochs=30,
                    validation_data=(X_val_images, y_val))

# Step 7: Evaluate the performance of the trained ResNet model
test_loss, test_acc = model.evaluate(X_test_images, y_test, verbose=2)
print('Test accuracy:', test_acc)

# Step 8: Save the trained model for future use
model.save('resnet_model.h5')
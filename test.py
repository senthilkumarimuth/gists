import pandas as pd

df = pd. read_csv(r"C:\\Users\\senthil.marimuthu\\Downloads\\cell imbalance output.csv")
df =  df[['actual_km_failure', "Surv_prob_at_failure"]]
print(len(df))

from sklearn.model_selection import train_test_split


from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score

# Prepare the data
y = df['Surv_prob_at_failure'].values
X = df['actual_km_failure'].values


# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

from sklearn.preprocessing import PolynomialFeatures

# Transform X with polynomial features
poly = PolynomialFeatures(degree=2)  # You can change the degree as needed
X_train_poly = poly.fit_transform(X_train.reshape(-1, 1))

# Create a logistic regression model
model = LinearRegression()

# Fit the model
model.fit(X_train_poly, y_train)

# Make predictions
y_pred = model.predict(poly.transform(X_test.reshape(-1,1)))

from sklearn.metrics import mean_squared_error

# Calculate Mean Squared Error
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')


import matplotlib.pyplot as plt

# Visualize the fit
plt.scatter(X_test, y_test, color='blue', label='Actual Data')
plt.scatter(X_test, y_pred, color='red', label='Predicted Data')
plt.title('Actual vs Predicted_test')
plt.xlabel('Surv_prob_at_failure')
plt.ylabel('actual_km_failure')
plt.legend()
plt.show()

y_train_pred = model.predict(X_train_poly)

# Visualize the fit - TRAIN
plt.scatter(X_train, y_train, color='blue', label='Actual Data')
plt.scatter(X_train, y_train_pred, color='red', label='Predicted Data')
plt.title('Actual vs Predicted_train')
plt.xlabel('Surv_prob_at_failure')
plt.ylabel('actual_km_failure')
plt.legend()
plt.show()

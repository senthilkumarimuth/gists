import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import weibull_min

# Define parameters
scale = 2.0  # Scale parameter
shape = 1.5  # Shape parameter

# Create Weibull distribution object
weibull_dist = weibull_min(scale=scale, c=shape)

# Generate random samples
samples = weibull_dist.rvs(size=1000)

# Plot PDF
plt.figure(figsize=(10, 5))
plt.subplot(1, 2, 1)
plt.hist(samples, bins=30, density=True, alpha=0.6, color='g')
x = np.linspace(0, 10, 100)
plt.plot(x, weibull_dist.pdf(x), 'r-', lw=2)
plt.title('Probability Density Function')
plt.xlabel('x')
plt.ylabel('Density')

# Plot CDF
plt.subplot(1, 2, 2)
plt.plot(x, weibull_dist.cdf(x), 'b-', lw=2)
plt.title('Cumulative Distribution Function')
plt.xlabel('x')
plt.ylabel('Cumulative Probability')

plt.tight_layout()
plt.show()

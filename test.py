import os
import glob
import pandas as pd
from ydata_profiling import ProfileReport



# Read the CSV file into a DataFrame
df = pd.read_csv(r"C:\Users\senthil.marimuthu\Downloads\derating_eda.csv")

# Generate the pandas profiling report
profile = ProfileReport(df, title="Pandas Profiling Report", explorative=True)

# Save the report to an HTML file in the Downloads folder
report_path = os.path.join(downloads_path, "pandas_profiling_report.html")
profile.to_file(report_path)

print(f"Profiling report saved to: {report_path}")

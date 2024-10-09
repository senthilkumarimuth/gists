import pandas as pd

df = pd. read_excel(r"C:\\Users\\senthil.marimuthu\\Downloads\\CIM cases From Feb 24 to mar 24.xlsx")
df =  df[df['assigned']=='senthil']
print(len(df))
print(df['Sim'].tolist())
